const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const publicUserSelect = {
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
  profilePhoto: true,
  isVerified: true,
  isSuspended: true,
  createdAt: true,
};

const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "This account is suspended.",
      });
    }

    req.user = user;
    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired.",
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to do that.",
    });
  }

  return next();
};

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const requireAdmin = (req, res, next) => {
  const lifetime = req.auth ? Number(req.auth.exp) - Number(req.auth.iat) : Number.POSITIVE_INFINITY;
  const adminSession = req.auth?.adminSession === true && lifetime <= 2 * 60 * 60 + 120;
  if (!req.user || req.user.role !== "ADMIN" || !adminSession) {
    console.warn(
      `[admin-denied] time=${new Date().toISOString()} ip=${clientIp(req)} path=${req.originalUrl} user=${req.user?.id ?? "anonymous"} role=${req.user?.role ?? "none"}`
    );
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }
  return next();
};

const auditAdmin = (req, res, next) => {
  console.log(
    `[admin-action] time=${new Date().toISOString()} ip=${clientIp(req)} admin=${req.user.id} ${req.method} ${req.originalUrl}`
  );
  return next();
};

module.exports = {
  protect,
  authorize,
  requireAdmin,
  auditAdmin,
  publicUserSelect,
};
