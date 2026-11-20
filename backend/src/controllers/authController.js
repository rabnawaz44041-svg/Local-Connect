const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { publicUserSelect } = require("../middleware/auth");
const { currencyForCountry } = require("../utils/locale");
const { isEmail, isNonEmptyString } = require("../utils/validate");

const PROVIDER_CATEGORIES = new Set([
  "plumbing",
  "electrical",
  "cleaning",
  "carpentry",
  "painting",
  "hvac",
  "appliance_repair",
  "moving",
  "pest_control",
  "other",
]);

const signToken = (user, remember) => {
  const isAdmin = user.role === "ADMIN";
  return jwt.sign(
    { id: user.id, role: user.role, adminSession: isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: isAdmin ? "2h" : remember ? "30d" : "7d" }
  );
};

const readText = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const passwordError = (password) =>
  typeof password !== "string" || password.length < 8 || password.length > 72
    ? "Password must be between 8 and 72 characters."
    : "";

const register = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    const role = req.body.role;
    const phone =
      typeof req.body.phone === "string" && req.body.phone.trim()
        ? req.body.phone.trim()
        : null;
    const location =
      typeof req.body.location === "string" && req.body.location.trim()
        ? req.body.location.trim()
        : null;
    const city = typeof req.body.city === "string" ? req.body.city.trim() : "";
    const country = typeof req.body.country === "string" ? req.body.country.trim() : "";
    const countryCode =
      typeof req.body.countryCode === "string" ? req.body.countryCode.trim().toUpperCase() : "";
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    const errors = [];

    if (!isNonEmptyString(name) || name.length > 80) {
      errors.push("Name is required and must be 80 characters or fewer.");
    }

    if (!isEmail(email) || email.length > 120) {
      errors.push("A valid email is required.");
    }

    if (passwordError(password)) {
      errors.push(passwordError(password));
    }

    if (role !== "CUSTOMER" && role !== "PROVIDER") {
      errors.push("Role must be CUSTOMER or PROVIDER.");
    }

    if (phone && phone.length > 30) {
      errors.push("Phone must be 30 characters or fewer.");
    }

    if (!location || location.length > 120) {
      errors.push("A detected region is required.");
    }

    if (!city || city.length > 80) {
      errors.push("City is required.");
    }

    if (!country || country.length > 80) {
      errors.push("Country is required.");
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      errors.push("Country code must be two letters.");
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      errors.push("A valid latitude is required.");
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      errors.push("A valid longitude is required.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details.",
        errors,
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        isVerified: role === "CUSTOMER",
        phone,
        location,
        city,
        country,
        countryCode,
        latitude,
        longitude,
      },
      select: publicUserSelect,
    });

    return res.status(201).json({
      success: true,
      message: "Account created.",
      data: {
        user,
        token: signToken(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;

    if (!isEmail(email) || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatches || user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const safeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: safeUser,
        token: signToken(safeUser, req.body.rememberMe === true),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

const locationFromBody = (body) => {
  const city = readText(body.city, 80);
  const country = readText(body.country, 80);
  const countryCode = readText(body.countryCode, 2).toUpperCase();
  const latitude = body.latitude == null || body.latitude === "" ? null : Number(body.latitude);
  const longitude = body.longitude == null || body.longitude === "" ? null : Number(body.longitude);
  const errors = [];
  if (!city) errors.push("City is required.");
  if (!country) errors.push("Country is required.");
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) errors.push("Country code must be two letters.");
  if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    errors.push("Latitude is invalid.");
  }
  if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    errors.push("Longitude is invalid.");
  }
  return {
    errors,
    data: {
      city,
      country,
      countryCode: countryCode || null,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      location: [city, country].filter(Boolean).join(", "),
    },
  };
};

const signup = async (req, res, next) => {
  try {
    const name = readText(req.body.fullName || req.body.name, 80);
    const email = readText(req.body.email, 120).toLowerCase();
    const password = req.body.password;
    const place = locationFromBody(req.body);
    const errors = [...place.errors];
    if (!isNonEmptyString(name)) errors.push("Full name is required.");
    if (!isEmail(email)) errors.push("A valid email is required.");
    if (passwordError(password)) errors.push(passwordError(password));
    if (req.body.acceptedTerms !== true) errors.push("Accept the terms to create an account.");
    if (errors.length) {
      return res.status(400).json({ success: false, message: "Invalid registration details.", errors });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "CUSTOMER",
        isVerified: true,
        ...place.data,
      },
      select: publicUserSelect,
    });
    return res.status(201).json({
      success: true,
      message: "Account created.",
      data: { user, token: signToken(user, true) },
    });
  } catch (error) {
    return next(error);
  }
};

const signupProvider = async (req, res, next) => {
  try {
    const name = readText(req.body.fullName || req.body.name, 80);
    const email = readText(req.body.email, 120).toLowerCase();
    const phone = readText(req.body.phone, 30);
    const businessName = readText(req.body.businessName, 120) || null;
    const password = req.body.password;
    const bio = readText(req.body.bio, 500);
    const currency = readText(req.body.currency, 3).toUpperCase();
    const hourlyRate = Number(req.body.hourlyRate);
    const categories = Array.isArray(req.body.categories) ? req.body.categories.map((item) => String(item)) : [];
    const offeredServices = Array.isArray(req.body.services)
      ? req.body.services.map((item) => readText(item, 80)).filter(Boolean).slice(0, 20)
      : [];
    const place = locationFromBody(req.body);
    const errors = [...place.errors];
    if (!isNonEmptyString(name)) errors.push("Full name is required.");
    if (!isEmail(email)) errors.push("A valid email is required.");
    if (!phone) errors.push("Phone is required.");
    if (passwordError(password)) errors.push(passwordError(password));
    if (!categories.length || categories.some((item) => !PROVIDER_CATEGORIES.has(item))) {
      errors.push("Choose at least one valid service category.");
    }
    if (!offeredServices.length) errors.push("Add at least one service.");
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) errors.push("Hourly rate must be greater than 0.");
    if (!/^[A-Z]{3}$/.test(currency)) errors.push("Currency must be a 3-letter code.");
    if (bio.length < 200 || bio.length > 500) errors.push("Bio must be 200 to 500 characters.");
    const profilePhoto = typeof req.body.profilePhoto === "string" ? req.body.profilePhoto : null;
    if (profilePhoto && profilePhoto.length > 500000) errors.push("Profile photo is too large.");
    if (errors.length) {
      return res.status(400).json({ success: false, message: "Invalid registration details.", errors });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        businessName,
        password: await bcrypt.hash(password, 10),
        role: "PROVIDER",
        isVerified: false,
        categories,
        offeredServices,
        hourlyRate,
        currency: currency || currencyForCountry(place.data.countryCode),
        bio,
        profilePhoto,
        ...place.data,
      },
      select: publicUserSelect,
    });
    return res.status(201).json({
      success: true,
      message: "Provider account created.",
      data: { user, token: signToken(user, true) },
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = readText(req.body.email, 120).toLowerCase();
    const message = "If that email exists, a reset link was sent.";
    if (!isEmail(email)) {
      return res.status(200).json({ success: true, message });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.isSuspended) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const base = process.env.CLIENT_URL || "http://localhost:5173";
      console.log(`Password reset link for ${email}: ${base}/reset?token=${token}`);
    }
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const token = readText(req.body.token, 200);
    const password = req.body.password;
    if (!token || passwordError(password) || password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "The reset link is invalid or the passwords do not match.",
      });
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "The reset link is invalid or has expired.",
      });
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: await bcrypt.hash(password, 10) },
      }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);
    return res.status(200).json({ success: true, message: "Password updated. You can log in." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  signup,
  signupProvider,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
