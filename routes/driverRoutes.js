const express = require("express");
const router = express.Router();

const { driverRegister,driverLogin,completeDriverProfile,getAvailableRides,acceptRide,startRide,completeRide,getCurrentRide,getRideHistory } = require("../controllers/driverAuthController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", driverRegister);
router.post("/login", driverLogin);
router.post("/complete-profile",authMiddleware,completeDriverProfile)

router.get("/available-rides", authMiddleware, getAvailableRides);

//router.patch("/accept-ride/:rideId", authMiddleware, acceptRide);
//router.patch("/start-ride/:rideId", authMiddleware, startRide);
//router.patch("/complete-ride/:rideId", authMiddleware, completeRide);
router.get("/current-ride", authMiddleware, getCurrentRide);
router.get("/ride-history",authMiddleware,getRideHistory);


module.exports = router;