const buckets = new Map();

const rateLimit = ({ windowMs, max }) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= max) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Try again in a few minutes.",
    });
  }
  recent.push(now);
  buckets.set(key, recent);
  return next();
};

module.exports = { rateLimit };
