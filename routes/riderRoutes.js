const express = require("express");
const router = express.Router();

const {riderRegister,riderLogin} = require("../controllers/riderAuthController");

router.post("/register", riderRegister);
router.post("/login", riderLogin);

module.exports = router;