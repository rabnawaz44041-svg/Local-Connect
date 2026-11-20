const prisma = require("../config/prisma");
const { parseServiceId } = require("../utils/validate");

const requestInclude = {
  service: { select: { id: true, title: true, category: true } },
  customer: { select: { id: true, name: true } },
  provider: { select: { id: true, name: true } },
  escrow: true,
};

const loadOwned = async (id, user) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: requestInclude,
  });
  if (!request) return { error: { status: 404, message: "Request not found." } };
  const allowed = request.customerId === user.id || request.providerId === user.id;
  if (!allowed) return { error: { status: 403, message: "You cannot view this request." } };
  return { request };
};

const createRequest = async (req, res, next) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({ success: false, message: "Only a customer can post a request." });
    }
    const serviceId = parseServiceId(String(req.body.serviceId ?? ""));
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";
    if (!serviceId) {
      return res.status(400).json({ success: false, message: "Choose a service to request." });
    }
    if (note.length < 8 || note.length > 1000) {
      return res.status(400).json({ success: false, message: "Describe the job in 8 to 1000 characters." });
    }
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "That service is not available." });
    }
    if (service.providerId === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot request your own service." });
    }
    const created = await prisma.serviceRequest.create({
      data: {
        customerId: req.user.id,
        providerId: service.providerId,
        serviceId: service.id,
        note,
        amount: service.price,
        currency: service.currency,
      },
      include: requestInclude,
    });
    return res.status(201).json({ success: true, message: "Request sent.", data: created });
  } catch (error) {
    return next(error);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const where = req.user.role === "PROVIDER" ? { providerId: req.user.id } : { customerId: req.user.id };
    const requests = await prisma.serviceRequest.findMany({
      where,
      include: requestInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    return next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Request id is invalid." });
    const { request, error } = await loadOwned(id, req.user);
    if (error) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    return next(error);
  }
};

const setStatus = (from, to) => async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Request id is invalid." });
    const { request, error } = await loadOwned(id, req.user);
    if (error) return res.status(error.status).json({ success: false, message: error.message });
    const isProvider = request.providerId === req.user.id;
    const isCustomer = request.customerId === req.user.id;
    if (to === "ACCEPTED" || to === "REJECTED") {
      if (!isProvider) return res.status(403).json({ success: false, message: "Only the provider can respond." });
    }
    if (to === "CANCELLED" && !isCustomer) {
      return res.status(403).json({ success: false, message: "Only the customer can cancel." });
    }
    if (request.status !== from) {
      return res.status(409).json({ success: false, message: "That step is no longer available." });
    }
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status: to },
      include: requestInclude,
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

async function changeBalance(tx, userId, currency, delta) {
  const wallet = await tx.wallet.upsert({
    where: { userId_currency: { userId, currency } },
    update: {},
    create: { userId, currency, balance: 0 },
  });
  if (delta < 0) {
    const updated = await tx.wallet.updateMany({
      where: { id: wallet.id, balance: { gte: -delta } },
      data: { balance: { increment: delta } },
    });
    if (updated.count !== 1) {
      const error = new Error("Not enough funds in this currency.");
      error.status = 400;
      throw error;
    }
    return tx.wallet.findUnique({ where: { id: wallet.id } });
  }
  return tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: delta } },
  });
}

const fundRequest = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Request id is invalid." });
    const { request, error } = await loadOwned(id, req.user);
    if (error) return res.status(error.status).json({ success: false, message: error.message });
    if (request.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the customer can lock payment." });
    }
    if (request.status !== "ACCEPTED") {
      return res.status(409).json({ success: false, message: "The provider must accept before payment can be locked." });
    }
    const updated = await prisma.$transaction(async (tx) => {
      await changeBalance(tx, request.customerId, request.currency, -request.amount);
      await tx.escrow.create({
        data: { requestId: request.id, amount: request.amount, currency: request.currency, status: "HELD" },
      });
      return tx.serviceRequest.update({
        where: { id: request.id },
        data: { status: "FUNDED", fundedAt: new Date() },
        include: requestInclude,
      });
    });
    return res.status(200).json({
      success: true,
      message: "Payment is locked in escrow. The provider is not paid yet.",
      data: updated,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    return next(error);
  }
};

const releaseRequest = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Request id is invalid." });
    const { request, error } = await loadOwned(id, req.user);
    if (error) return res.status(error.status).json({ success: false, message: error.message });
    if (request.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the customer can confirm completion." });
    }
    if (request.status !== "FUNDED" || !request.escrow || request.escrow.status !== "HELD") {
      return res.status(409).json({ success: false, message: "There is no locked payment to release." });
    }
    const updated = await prisma.$transaction(async (tx) => {
      await changeBalance(tx, request.providerId, request.currency, request.amount);
      await tx.escrow.update({
        where: { requestId: request.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      return tx.serviceRequest.update({
        where: { id: request.id },
        data: { status: "RELEASED", releasedAt: new Date() },
        include: requestInclude,
      });
    });
    return res.status(200).json({
      success: true,
      message: "Payment released to the provider.",
      data: updated,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    return next(error);
  }
};

const topUp = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const currency = typeof req.body.currency === "string" ? req.body.currency.trim().toUpperCase() : "";
    if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) {
      return res.status(400).json({ success: false, message: "Amount must be a whole number from 1 to 10000000." });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ success: false, message: "Currency must be a 3-letter code." });
    }
    const wallet = await prisma.$transaction((tx) => changeBalance(tx, req.user.id, currency, amount));
    return res.status(200).json({
      success: true,
      message: "Test funds added. This is not a real card charge.",
      data: wallet,
    });
  } catch (error) {
    return next(error);
  }
};

const getWallet = async (req, res, next) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user.id },
      orderBy: { currency: "asc" },
    });
    return res.status(200).json({ success: true, data: wallets });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  acceptRequest: setStatus("OPEN", "ACCEPTED"),
  rejectRequest: setStatus("OPEN", "REJECTED"),
  cancelRequest: async (req, res, next) => {
    try {
      const id = parseServiceId(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Request id is invalid." });
      const { request, error } = await loadOwned(id, req.user);
      if (error) return res.status(error.status).json({ success: false, message: error.message });
      if (request.customerId !== req.user.id) {
        return res.status(403).json({ success: false, message: "Only the customer can cancel." });
      }
      if (request.status !== "OPEN" && request.status !== "ACCEPTED") {
        return res.status(409).json({ success: false, message: "Payment is already locked, so this request cannot be cancelled here." });
      }
      const updated = await prisma.serviceRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: requestInclude,
      });
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return next(error);
    }
  },
  fundRequest,
  releaseRequest,
  topUp,
  getWallet,
};
