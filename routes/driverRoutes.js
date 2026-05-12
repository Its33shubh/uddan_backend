const express = require("express");
const router = express.Router();

const {
  driverRegister,
  driverLogin,
  completeDriverProfile
} = require("../controllers/driverAuthController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", driverRegister);
router.post("/login", driverLogin);
router.post("/complete-profile",authMiddleware,completeDriverProfile)

module.exports = router;