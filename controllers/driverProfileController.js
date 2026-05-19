const DriverProfile = require("../models/DriverProfile");


// UPLOAD DOCUMENTS
const uploadDocuments = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can upload documents"
      });
    }

    const profile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Driver profile not found"
      });
    }

    if (req.files.licenseImage) {
      profile.documents.licenseImage =
        req.files.licenseImage[0].path;
    }

    if (req.files.aadhaarImage) {
      profile.documents.aadhaarImage =
        req.files.aadhaarImage[0].path;
    }

    if (req.files.rcImage) {
      profile.documents.rcImage =
        req.files.rcImage[0].path;
    }

    if (req.files.insuranceImage) {
      profile.documents.insuranceImage =
        req.files.insuranceImage[0].path;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      error: false,
      message: "Documents uploaded successfully",
      data: profile.documents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};
const getDocuments = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can view documents"
      });
    }

    const profile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Driver profile not found"
      });
    }

    res.status(200).json({
      success: true,
      error: false,
      message: "Documents fetched successfully",
      data: profile.documents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

module.exports = {
  uploadDocuments,
  getDocuments
};