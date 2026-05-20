const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DriverProfile = require("../models/DriverProfile");
const authMiddleware = require("../middleware/authMiddleware")
const Ride = require("../models/Ride");


// driver register
const driverRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "driver"
    });

    res.status(201).json({
      success: true,
      error: false,
      message: "Driver registered successfully",
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        role: driver.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

// driver login
const driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email and password are required"
      });
    }

    const driver = await User.findOne({
      email,
      role: "driver"
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Driver not found"
      });
    }

    if (driver.isBlocked) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Driver account is blocked"
      });
    }

    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Invalid password"
      });
    }

    const driverProfile = await DriverProfile.findOne({
      userId: driver._id
    });

    driver.lastLogin = new Date();
    await driver.save();

    const token = jwt.sign(
      {
        id: driver._id,
        role: driver.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // profile not completed
    if (!driverProfile) {
      return res.status(200).json({
        success: true,
        error: false,
        message: "Driver login successful. Complete your profile.",
        profileCompleted: false,
        data: {
          token,
          user: {
            id: driver._id,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            role: driver.role
          }
        }
      });
    }

    // waiting approval
    if (!driverProfile.isApproved) {
      return res.status(403).json({
        success: false,
        error: true,
        profileCompleted: true,
        message: "Driver account pending admin approval"
      });
    }

    // login success
    res.status(200).json({
      success: true,
      error: false,
      profileCompleted: true,
      message: "Driver login successful",
      data: {
        token,
        user: {
          id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          role: driver.role
        },
        driverProfile
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};
 // Complete the driver profile
const completeDriverProfile = async (req, res) => {
  try {
    const {
      licenseNumber,
      aadhaarNumber,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor
    } = req.body;

    if (
      !licenseNumber ||
      !aadhaarNumber ||
      !vehicleNumber ||
      !vehicleType ||
      !vehicleModel
    ) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "All required fields are mandatory"
      });
    }

    // only driver allowed
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Access denied"
      });
    }

    const existingProfile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Driver profile already completed"
      });
    }

    const duplicateDriver = await DriverProfile.findOne({
      $or: [
        { licenseNumber },
        { aadhaarNumber },
        { vehicleNumber }
      ]
    });

    if (duplicateDriver) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Driver details already exist"
      });
    }

    const driverProfile = await DriverProfile.create({
      userId: req.user._id,
      licenseNumber,
      aadhaarNumber,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor
    });

    res.status(201).json({
      success: true,
      error: false,
      message: "Driver profile completed successfully. Waiting for admin approval.",
      data: driverProfile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

// get available ride
const getAvailableRides = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can access available rides"
      });
    }

    const driverProfile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (!driverProfile || !driverProfile.isApproved) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Driver not approved"
      });
    }

    const rides = await Ride.find({
      rideStatus: "requested",
      driverId: null
    })
      .populate("riderId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      error: false,
      message: "Available rides fetched successfully",
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

// accept rides 
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can accept rides"
      });
    }

    const driverProfile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (!driverProfile || !driverProfile.isApproved) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Driver not approved"
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

    if (ride.rideStatus !== "requested") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Ride already accepted or unavailable"
      });
    }

    ride.driverId = req.user._id;
    ride.rideStatus = "accepted";

    await ride.save();

    res.status(200).json({
      success: true,
      error: false,
      message: "Ride accepted successfully",
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

// start rides 
const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can start rides"
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

    if (ride.driverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "This ride is not assigned to you"
      });
    }

    if (ride.rideStatus !== "accepted") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Only accepted rides can be started"
      });
    }

    ride.rideStatus = "started";

    await ride.save();

    res.status(200).json({
      success: true,
      error: false,
      message: "Ride started successfully",
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

//complete ride
const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can complete rides"
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

    if (ride.driverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "This ride is not assigned to you"
      });
    }

    if (ride.rideStatus !== "started") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Only started rides can be completed"
      });
    }

    ride.rideStatus = "completed";

    if (ride.paymentMethod === "cash") {
      ride.paymentStatus = "paid";
    }

    await ride.save();

    // update driver stats
    const driverProfile = await DriverProfile.findOne({
      userId: req.user._id
    });

    if (driverProfile) {
      driverProfile.totalRides += 1;
      driverProfile.earnings += ride.fare;

      await driverProfile.save();
    }

    res.status(200).json({
      success: true,
      error: false,
      message: "Ride completed successfully",
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

const getCurrentRide = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Only drivers can access current ride"
      });
    }

    const ride = await Ride.findOne({
      driverId: req.user._id,
      rideStatus: {
        $in: ["accepted", "arrived", "started"]
      }
    })
      .populate("riderId", "name phone profileImage")
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

module.exports = {
  driverRegister,
  driverLogin,
  completeDriverProfile,
  getAvailableRides,
  acceptRide,
  startRide,
  completeRide,
  getCurrentRide
};