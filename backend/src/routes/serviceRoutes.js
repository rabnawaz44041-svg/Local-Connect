const express = require("express");
const {
  createService,
  getServices,
  getServiceById,
} = require("../controllers/serviceController");
const { authorize, protect } = require("../middleware/auth");

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protect(req, res, next);
};

const router = express.Router();

router.get("/", optionalAuth, getServices);
router.get("/:id", optionalAuth, getServiceById);
router.post("/", protect, authorize("PROVIDER"), createService);

module.exports = router;
