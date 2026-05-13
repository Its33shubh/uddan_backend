const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  bookRide
} = require("../controllers/rideController");

router.post("/book", authMiddleware, bookRide);

module.exports = router;