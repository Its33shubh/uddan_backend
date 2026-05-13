const express = require("express");
const router = express.Router();

const {
  adminRegister,
  adminLogin,
  getPendingDrivers
} = require("../controllers/adminAuthController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/pending-drivers",authMiddleware,adminMiddleware,getPendingDrivers);
module.exports = router;