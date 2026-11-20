const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { isEmail, isNonEmptyString, parsePrice, parseServiceId } = require("../utils/validate");

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  location: true,
  city: true,
  country: true,
  countryCode: true,
  latitude: true,
  longitude: true,
  businessName: true,
  categories: true,
  offeredServices: true,
  hourlyRate: true,
  currency: true,
  bio: true,
  isVerified: true,
  isSuspended: true,
  rejectionReason: true,
  createdAt: true,
};

const isWebmaster = (user) => user.email === "webmaster@localconnect.test";

const readUserInput = (body, { requirePassword }) => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role;
  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
  const location = typeof body.location === "string" && body.location.trim() ? body.location.trim() : null;
  const city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : null;
  const country = typeof body.country === "string" && body.country.trim() ? body.country.trim() : null;
  const countryCode = typeof body.countryCode === "string" && body.countryCode.trim()
    ? body.countryCode.trim().toUpperCase()
    : null;
  const latitude = body.latitude === "" || body.latitude == null ? null : Number(body.latitude);
  const longitude = body.longitude === "" || body.longitude == null ? null : Number(body.longitude);
  const password = body.password;
  const errors = [];

  if (!isNonEmptyString(name) || name.length > 80) errors.push("Name is required.");
  if (!isEmail(email)) errors.push("A valid email is required.");
  if (role !== "CUSTOMER" && role !== "PROVIDER") errors.push("Role must be CUSTOMER or PROVIDER.");
  if (requirePassword && (typeof password !== "string" || password.length < 8)) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!requirePassword && password && (typeof password !== "string" || password.length < 8)) {
    errors.push("Password must be at least 8 characters.");
  }
  if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    errors.push("Latitude is invalid.");
  }
  if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    errors.push("Longitude is invalid.");
  }

  return {
    errors,
    data: { name, email, role, phone, location, city, country, countryCode, latitude, longitude },
    password: typeof password === "string" && password ? password : null,
  };
};

const listUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const where = { role: { in: ["CUSTOMER", "PROVIDER"] } };
    if (role === "CUSTOMER" || role === "PROVIDER") where.role = role;
    if (typeof req.query.country === "string" && req.query.country.trim()) {
      where.country = { contains: req.query.country.trim(), mode: "insensitive" };
    }
    if (typeof req.query.email === "string" && req.query.email.trim()) {
      where.email = { contains: req.query.email.trim(), mode: "insensitive" };
    }
    if (req.query.status === "suspended") where.isSuspended = true;
    if (req.query.status === "active") where.isSuspended = false;
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return res.status(200).json({ success: true, data: { users, total, page, pageSize } });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { errors, data, password } = readUserInput(req.body || {}, { requirePassword: true });
    if (errors.length) return res.status(400).json({ success: false, message: "Invalid account.", errors });
    const user = await prisma.user.create({
      data: { ...data, isVerified: true, password: await bcrypt.hash(password, 10) },
      select: userSelect,
    });
    return res.status(201).json({ success: true, message: "Account created.", data: user });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "User id is invalid." });
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role === "ADMIN") {
      return res.status(404).json({ success: false, message: "That customer or provider was not found." });
    }
    const { errors, data, password } = readUserInput(req.body || {}, { requirePassword: false });
    if (errors.length) return res.status(400).json({ success: false, message: "Invalid account.", errors });
    const user = await prisma.user.update({
      where: { id },
      data: { ...data, ...(password ? { password: await bcrypt.hash(password, 10) } : {}) },
      select: userSelect,
    });
    return res.status(200).json({ success: true, message: "Account updated.", data: user });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "User id is invalid." });
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete the webmaster account." });
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || isWebmaster(existing) || existing.role === "ADMIN") {
      return res.status(404).json({ success: false, message: "That customer or provider was not found." });
    }
    await prisma.$transaction(async (tx) => {
      await tx.serviceRequest.deleteMany({ where: { OR: [{ customerId: id }, { providerId: id }] } });
      await tx.user.delete({ where: { id } });
    });
    return res.status(200).json({ success: true, message: "Account deleted." });
  } catch (error) {
    return next(error);
  }
};

const serviceInclude = {
  provider: { select: { id: true, name: true, email: true, role: true } },
};

const readService = (body) => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "USD";
  const price = parsePrice(body.price);
  const providerId = Number(body.providerId);
  const isActive = body.isActive !== false && body.isActive !== "false";
  const latitude = body.latitude === "" || body.latitude == null ? null : Number(body.latitude);
  const longitude = body.longitude === "" || body.longitude == null ? null : Number(body.longitude);
  const errors = [];
  if (!isNonEmptyString(title)) errors.push("Title is required.");
  if (!isNonEmptyString(description)) errors.push("Description is required.");
  if (!isNonEmptyString(category)) errors.push("Category is required.");
  if (!isNonEmptyString(location)) errors.push("Location is required.");
  if (!/^[A-Z]{3}$/.test(currency)) errors.push("Currency must be a 3-letter code.");
  if (price == null) errors.push("Price must be a whole number greater than 0.");
  if (!Number.isInteger(providerId) || providerId < 1) errors.push("Choose a provider.");
  return { errors, data: { title, description, category, location, currency, price, providerId, isActive, latitude, longitude } };
};

const listServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({ include: serviceInclude, orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    return next(error);
  }
};

const ensureProvider = async (providerId) => {
  const provider = await prisma.user.findUnique({ where: { id: providerId } });
  return provider && provider.role === "PROVIDER" ? provider : null;
};

const createService = async (req, res, next) => {
  try {
    const { errors, data } = readService(req.body || {});
    if (errors.length) return res.status(400).json({ success: false, message: "Invalid service.", errors });
    const provider = await ensureProvider(data.providerId);
    if (!provider) return res.status(400).json({ success: false, message: "Choose an existing provider." });
    const service = await prisma.service.create({
      data: {
        ...data,
        latitude: Number.isFinite(data.latitude) ? data.latitude : provider.latitude,
        longitude: Number.isFinite(data.longitude) ? data.longitude : provider.longitude,
      },
      include: serviceInclude,
    });
    return res.status(201).json({ success: true, message: "Service created.", data: service });
  } catch (error) {
    return next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Service id is invalid." });
    const { errors, data } = readService(req.body || {});
    if (errors.length) return res.status(400).json({ success: false, message: "Invalid service.", errors });
    if (!(await ensureProvider(data.providerId))) {
      return res.status(400).json({ success: false, message: "Choose an existing provider." });
    }
    const service = await prisma.service.update({ where: { id }, data, include: serviceInclude });
    return res.status(200).json({ success: true, message: "Service updated.", data: service });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Service not found." });
    return next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Service id is invalid." });
    await prisma.$transaction([
      prisma.serviceRequest.deleteMany({ where: { serviceId: id } }),
      prisma.service.delete({ where: { id } }),
    ]);
    return res.status(200).json({ success: true, message: "Service deleted." });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Service not found." });
    return next(error);
  }
};

const setSuspended = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "User id is invalid." });
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role === "ADMIN") {
      return res.status(404).json({ success: false, message: "That account was not found." });
    }
    const isSuspended = req.body.isSuspended === true || req.body.status === "suspended";
    const user = await prisma.user.update({
      where: { id },
      data: { isSuspended },
      select: userSelect,
    });
    return res.status(200).json({ success: true, message: isSuspended ? "Account suspended." : "Account activated.", data: user });
  } catch (error) {
    return next(error);
  }
};

const listProviders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const where = { role: "PROVIDER" };
    if (req.query.verified === "true") where.isVerified = true;
    if (req.query.verified === "false") where.isVerified = false;
    const [total, providers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          ...userSelect,
          reviewsReceived: { where: { hidden: false }, select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const data = providers.map(({ reviewsReceived, ...provider }) => {
      const rating = reviewsReceived.length
        ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived.length
        : null;
      return { ...provider, rating, reviewCount: reviewsReceived.length };
    });
    return res.status(200).json({ success: true, data: { providers: data, total, page, pageSize } });
  } catch (error) {
    return next(error);
  }
};

const setVerification = (isVerified) => async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Provider id is invalid." });
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "PROVIDER") {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim().slice(0, 300) : null;
    const provider = await prisma.user.update({
      where: { id },
      data: { isVerified, rejectionReason: isVerified ? null : reason },
      select: userSelect,
    });
    return res.status(200).json({
      success: true,
      message: isVerified ? "Provider approved." : "Provider rejected.",
      data: provider,
    });
  } catch (error) {
    return next(error);
  }
};

const bulkProviders = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter((id) => Number.isInteger(id) && id > 0) : [];
    const approve = req.body.action === "approve";
    if (!ids.length || (req.body.action !== "approve" && req.body.action !== "reject")) {
      return res.status(400).json({ success: false, message: "Choose providers and an action." });
    }
    await prisma.user.updateMany({
      where: { id: { in: ids }, role: "PROVIDER" },
      data: { isVerified: approve, rejectionReason: approve ? null : readText(req.body.reason) },
    });
    return res.status(200).json({ success: true, message: approve ? "Providers approved." : "Providers rejected." });
  } catch (error) {
    return next(error);
  }
};

const readText = (value) => (typeof value === "string" ? value.trim().slice(0, 300) : null);

const listReviews = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.maxRating) where.rating = { lte: Number(req.query.maxRating) };
    if (req.query.providerId) where.providerId = Number(req.query.providerId);
    if (req.query.from || req.query.to) {
      where.createdAt = {};
      if (req.query.from) where.createdAt.gte = new Date(req.query.from);
      if (req.query.to) where.createdAt.lte = new Date(req.query.to);
    }
    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
};

const hideReview = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Review id is invalid." });
    const review = await prisma.review.update({
      where: { id },
      data: { hidden: req.body.hidden !== false },
    });
    return res.status(200).json({ success: true, message: "Review updated.", data: review });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Review not found." });
    return next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Review id is invalid." });
    await prisma.review.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Review deleted." });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Review not found." });
    return next(error);
  }
};

const stats = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [users, providers, pending, reviews, llmQueries, countries] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.count({ where: { role: "PROVIDER", isVerified: true, isSuspended: false } }),
      prisma.user.count({ where: { role: "PROVIDER", isVerified: false } }),
      prisma.review.aggregate({ _count: { _all: true }, _avg: { rating: true } }),
      prisma.llmQuery.count({ where: { createdAt: { gte: start } } }),
      prisma.user.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ["country"] }),
    ]);
    const [latestUsers, latestReviews] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ["CUSTOMER", "PROVIDER"] } },
        select: userSelect,
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.review.findMany({
        include: {
          customer: { select: { name: true } },
          provider: { select: { name: true, businessName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        users,
        activeProviders: providers,
        pendingVerifications: pending,
        reviewCount: reviews._count._all,
        averageRating: reviews._avg.rating,
        llmQueriesToday: llmQueries,
        countriesActive: countries.length,
        latestUsers,
        latestReviews,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setSuspended,
  listProviders,
  approveProvider: setVerification(true),
  rejectProvider: setVerification(false),
  bulkProviders,
  listReviews,
  hideReview,
  deleteReview,
  stats,
  listServices,
  createService,
  updateService,
  deleteService,
};
