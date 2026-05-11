const mongoose = require("mongoose");

const driverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },

    aadhaarNumber: {
      type: String,
      required: true
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true
    },
    vehicleType: {
      type: String,
      enum: ["bike", "auto", "car"],
      required: true
    },

    vehicleModel: {
      type: String,
      required: true
    },

    vehicleColor: {
      type: String
    },

    documents: {
      licenseImage: String,
      aadhaarImage: String,
      rcImage: String,
      insuranceImage: String
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    rejectionReason: {
      type: String,
      default: ""
    },

    isOnline: {
      type: Boolean,
      default: false
    },

    currentLocation: {
      lat: Number,
      lng: Number
    },

    earnings: {
      type: Number,
      default: 0
    },

    totalRides: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DriverProfile", driverProfileSchema);