const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocuments,getDocuments,updateDocuments,getDriverProfile,updateDriverProfile
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

router.get(
  "/documents",
  authMiddleware,
  getDocuments
);

router.get(
  "/profile",
  authMiddleware,
  getDriverProfile
);
router.patch(
  "/update-profile",
  authMiddleware,
  updateDriverProfile
);

router.patch(
  "/update-documents",
  authMiddleware,
  upload.fields([
    { name: "licenseImage", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 },
    { name: "rcImage", maxCount: 1 },
    { name: "insuranceImage", maxCount: 1 }
  ]),
  updateDocuments
);

module.exports = router;