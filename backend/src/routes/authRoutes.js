const express = require("express");
const {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  signup,
  signupProvider,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { rateLimit } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", register);
router.post("/signup", signup);
router.post("/signup/provider", signupProvider);
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), login);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
