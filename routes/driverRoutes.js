const express = require("express");
const router = express.Router();

const {
  driverRegister,
  driverLogin
} = require("../controllers/driverAuthController");

router.post("/register", driverRegister);
router.post("/login", driverLogin);

module.exports = router;