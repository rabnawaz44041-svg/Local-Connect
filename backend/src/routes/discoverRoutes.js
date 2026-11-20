const express = require("express");
const { discover, reverseGeocode } = require("../controllers/discoverController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protect(req, res, next);
};

router.post("/discover", optionalAuth, discover);
router.get("/geo/reverse", reverseGeocode);

module.exports = router;
