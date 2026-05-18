const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocuments
} = require("../controllers/driverProfileController");

router.post(
  "/upload-documents",
  authMiddleware,
  upload.fields([
    { name: "licenseImage", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 },
    { name: "rcImage", maxCount: 1 },
    { name: "insuranceImage", maxCount: 1 }
  ]),
  uploadDocuments
);

module.exports = router;