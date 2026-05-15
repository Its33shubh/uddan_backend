const Ride = require("../models/Ride");

const {
  getSocketIO,
  onlineDrivers
} = require("../socket/socketManager");

const bookRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      vehicleType,
      fare,
      distance,
      duration,
      paymentMethod
    } = req.body;

    if (
      !pickupLocation?.address ||
      pickupLocation?.lat == null ||
      pickupLocation?.lng == null ||
      !dropLocation?.address ||
      dropLocation?.lat == null ||
      dropLocation?.lng == null ||
      !vehicleType ||
      fare == null ||
      distance == null ||
      duration == null ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "All required ride fields are mandatory"
      });
    }

    if (req.user.role !== "rider") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only riders can book rides"
      });
    }

    const ride = await Ride.create({
      riderId: req.user._id,
      pickupLocation,
      dropLocation,
      vehicleType,
      fare,
      distance,
      duration,
      paymentMethod
    });

    const io = getSocketIO();

    Object.values(onlineDrivers).forEach((socketId) => {
      io.to(socketId).emit("new_ride_request", {
        message: "New ride request",
        ride
      });
    });

    res.status(201).json({
      success: true,
      error: false,
      message: "Ride booked successfully",
      data: ride
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

// get ride history
const getRideHistory = async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only riders can access ride history"
      });
    }

    const rides = await Ride.find({
      riderId: req.user._id
    })
      .populate("driverId", "name phone profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      error: false,
      message: "Ride history fetched successfully",
      data: rides
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

//get current ride
const getCurrentRide = async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only riders can access current ride"
      });
    }

    const ride = await Ride.findOne({
      riderId: req.user._id,
      rideStatus: {
        $in: ["requested", "accepted", "started"]
      }
    })
      .populate("driverId", "name phone profileImage")
      .sort({ createdAt: -1 });

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "No active ride found"
      });
    }

    res.status(200).json({
      success: true,
      error: false,
      message: "Current ride fetched successfully",
      data: ride
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

// cancel ride
const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { cancelReason } = req.body;

    if (req.user.role !== "rider") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only riders can cancel rides"
      });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Ride not found"
      });
    }

    if (ride.riderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "This ride does not belong to you"
      });
    }

    if (!["requested", "accepted"].includes(ride.rideStatus)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Ride cannot be cancelled now"
      });
    }

    ride.rideStatus = "cancelled";
    ride.cancelReason = cancelReason || "Cancelled by rider";

    await ride.save();

    res.status(200).json({
      success: true,
      error: false,
      message: "Ride cancelled successfully",
      data: ride
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
  bookRide,
  getRideHistory,
  getCurrentRide,
  cancelRide
};