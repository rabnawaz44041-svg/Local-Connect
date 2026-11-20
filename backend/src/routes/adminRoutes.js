const express = require("express");
const { auditAdmin, protect, requireAdmin } = require("../middleware/auth");
const {
  approveProvider,
  bulkProviders,
  createService,
  createUser,
  deleteReview,
  deleteService,
  deleteUser,
  hideReview,
  listProviders,
  listReviews,
  listServices,
  listUsers,
  rejectProvider,
  setSuspended,
  stats,
  updateService,
  updateUser,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, requireAdmin, auditAdmin);
router.get("/stats", stats);
router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/status", setSuspended);
router.delete("/users/:id", deleteUser);
router.get("/providers", listProviders);
router.patch("/providers/bulk", bulkProviders);
router.patch("/providers/:id/approve", approveProvider);
router.patch("/providers/:id/reject", rejectProvider);
router.get("/reviews", listReviews);
router.patch("/reviews/:id/hide", hideReview);
router.delete("/reviews/:id", deleteReview);
router.get("/services", listServices);
router.post("/services", createService);
router.patch("/services/:id", updateService);
router.delete("/services/:id", deleteService);

module.exports = router;
