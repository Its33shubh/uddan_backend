const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    pickupLocation: {
      address: {
        type: String,
        required: true
      },
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },

    dropLocation: {
      address: {
        type: String,
        required: true
      },
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },

    vehicleType: {
      type: String,
      enum: ["economy", "premium", "taxixl"],
      required: true
    },

    fare: {
      type: Number,
      required: true
    },

    distance: {
      type: Number,
      default: 0
    },

    duration: {
      type: Number,
      default: 0
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    rideStatus: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "arrived",
        "started",
        "completed",
        "cancelled"
      ],
      default: "requested"
    },

    cancelReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Ride", rideSchema);