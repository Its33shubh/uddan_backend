const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  bookRide,
  getRideHistory
} = require("../controllers/rideController");

router.post("/book", authMiddleware, bookRide);
router.get("/history", authMiddleware, getRideHistory);

module.exports = router;