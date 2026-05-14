const express = require("express");
const router = express.Router();

const { driverRegister,driverLogin,completeDriverProfile,getAvailableRides,acceptRide,startRide } = require("../controllers/driverAuthController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", driverRegister);
router.post("/login", driverLogin);
router.post("/complete-profile",authMiddleware,completeDriverProfile)
router.get("/available-rides", authMiddleware, getAvailableRides);
router.put("/accept-ride/:rideId", authMiddleware, acceptRide);
router.put("/start-ride/:rideId", authMiddleware, startRide);

module.exports = router;