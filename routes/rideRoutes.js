const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  bookRide,
  getRideHistory,
  getCurrentRide,
  cancelRide
} = require("../controllers/rideController");

router.post("/book", authMiddleware, bookRide);
router.get("/history", authMiddleware, getRideHistory);
router.get("/current", authMiddleware, getCurrentRide);
router.patch("/cancel/:rideId", authMiddleware, cancelRide);

module.exports = router;