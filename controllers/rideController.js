const Ride = require("../models/Ride");


// BOOK RIDE
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
        !pickupLocation?.lat ||
        !pickupLocation?.lng ||
        !dropLocation?.address ||
        !dropLocation?.lat ||
        !dropLocation?.lng ||
        !vehicleType ||
        !fare ||
        !distance ||
        !duration ||
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

module.exports = {
  bookRide,
  getRideHistory,
};