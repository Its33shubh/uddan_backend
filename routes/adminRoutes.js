const express = require("express");
const router = express.Router();

const {
  adminRegister,
  adminLogin,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
  getDashboardStats
} = require("../controllers/adminAuthController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/pending-drivers",authMiddleware,adminMiddleware,getPendingDrivers);
router.put("/approve-driver/:driverId",authMiddleware,adminMiddleware,approveDriver);
router.put("/reject-driver/:driverId",authMiddleware,adminMiddleware,rejectDriver);
router.get("/dashboard-stats", authMiddleware, getDashboardStats);
module.exports = router;