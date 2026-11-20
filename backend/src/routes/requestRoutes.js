const express = require("express");
const { authorize, protect } = require("../middleware/auth");
const {
  acceptRequest,
  cancelRequest,
  createRequest,
  fundRequest,
  getRequest,
  getWallet,
  listRequests,
  rejectRequest,
  releaseRequest,
  topUp,
} = require("../controllers/requestController");

const router = express.Router();

router.use(protect);
router.get("/wallet", getWallet);
router.post("/wallet/topup", topUp);
router.get("/requests", listRequests);
router.post("/requests", authorize("CUSTOMER"), createRequest);
router.get("/requests/:id", getRequest);
router.post("/requests/:id/accept", authorize("PROVIDER"), acceptRequest);
router.post("/requests/:id/reject", authorize("PROVIDER"), rejectRequest);
router.post("/requests/:id/cancel", authorize("CUSTOMER"), cancelRequest);
router.post("/requests/:id/fund", authorize("CUSTOMER"), fundRequest);
router.post("/requests/:id/release", authorize("CUSTOMER"), releaseRequest);

module.exports = router;
