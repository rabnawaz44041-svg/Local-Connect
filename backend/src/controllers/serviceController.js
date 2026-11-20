const prisma = require("../config/prisma");
const { currencyForCountry } = require("../utils/locale");
const { isNonEmptyString, parsePrice, parseServiceId } = require("../utils/validate");

const providerSelect = {
  id: true,
  name: true,
  phone: true,
  location: true,
  city: true,
  country: true,
  countryCode: true,
  latitude: true,
  longitude: true,
  isVerified: true,
  isSuspended: true,
};

const serviceInclude = {
  provider: {
    select: providerSelect,
  },
};

const readServiceInput = (body) => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const price = parsePrice(body.price);

  const errors = [];

  if (!isNonEmptyString(title) || title.length > 120) {
    errors.push("Title is required and must be 120 characters or fewer.");
  }

  if (!isNonEmptyString(description) || description.length > 2000) {
    errors.push("Description is required and must be 2000 characters or fewer.");
  }

  if (!isNonEmptyString(category) || category.length > 60) {
    errors.push("Category is required and must be 60 characters or fewer.");
  }

  if (!isNonEmptyString(location) || location.length > 120) {
    errors.push("Location is required and must be 120 characters or fewer.");
  }

  if (price === null) {
    errors.push("Price must be a whole number greater than 0.");
  }

  return {
    errors,
    data: { title, description, category, location, price },
  };
};

const createService = async (req, res, next) => {
  try {
    const { errors, data } = readServiceInput(req.body || {});

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid service details.",
        errors,
      });
    }

    if (!Number.isFinite(req.user.latitude) || !Number.isFinite(req.user.longitude)) {
      return res.status(400).json({
        success: false,
        message: "Set your region before publishing a service.",
      });
    }

    const currency =
      typeof req.body.currency === "string" && /^[A-Za-z]{3}$/.test(req.body.currency.trim())
        ? req.body.currency.trim().toUpperCase()
        : currencyForCountry(req.user.countryCode);

    const service = await prisma.service.create({
      data: {
        ...data,
        currency,
        latitude: req.user.latitude,
        longitude: req.user.longitude,
        providerId: req.user.id,
      },
      include: serviceInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Service created.",
      data: service,
    });
  } catch (error) {
    return next(error);
  }
};

const readFilter = (value, max) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

const getServices = async (req, res, next) => {
  try {
    const q = readFilter(req.query.q, 120);
    const category = readFilter(req.query.category, 60);
    const location = readFilter(req.query.location, 120);
    const where = {
      isActive: true,
      OR: [
        { provider: { isVerified: true, isSuspended: false } },
        ...(req.user?.role === "PROVIDER" ? [{ providerId: req.user.id }] : []),
      ],
    };

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: serviceInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    return next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const id = parseServiceId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "Service id must be a positive whole number.",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: serviceInclude,
    });

    const provider = service?.provider;
    const visible =
      service &&
      service.isActive !== false &&
      provider &&
      ((provider.isVerified && !provider.isSuspended) ||
        (req.user && (req.user.id === provider.id || req.user.role === "ADMIN")));

    if (!visible) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
};
