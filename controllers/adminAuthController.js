const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DriverProfile = require("../models/DriverProfile");
const Ride = require("../models/Ride");

// ADMIN REGISTER
const adminRegister = async (req, res) => {
    try {
        const { name, email, phone, password, adminSecret } = req.body;

        if (!name || !email || !phone || !password || !adminSecret) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "All fields are required"
            });
        }

        // console.log("BODY SECRET:", adminSecret);
        // console.log("ENV SECRET:", process.env.ADMIN_SECRET_KEY);
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                error: true,
                message: "Invalid admin secret key"
            });
        }

        const existingAdmin = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Admin already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: "admin"
        });

        res.status(201).json({
            success: true,
            error: false,
            message: "Admin registered successfully",
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role
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

// ADMIN LOGIN
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Email and password are required"
            });
        }

        const admin = await User.findOne({
            email,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Admin not found"
            });
        }

        if (admin.isBlocked) {
            return res.status(403).json({
                success: false,
                error: true,
                message: "Admin account is blocked"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: true,
                message: "Invalid password"
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            {
                id: admin._id,
                role: admin.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            error: false,
            message: "Admin login successful",
            data: {
                token,
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    role: admin.role
                }
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

// get pending driver
const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await DriverProfile.find({
      approvalStatus: "pending"
    }).populate("userId", "name email phone profileImage");

    res.status(200).json({
      success: true,
      error: false,
      message: "Pending drivers fetched successfully",
      data: pendingDrivers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    });
  }
};

// approve the driver 
const approveDriver = async (req, res) => {
    try {
      const { driverId } = req.params;
  
      const driverProfile = await DriverProfile.findById(driverId);
  
      if (!driverProfile) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Driver profile not found"
        });
      }
  
      driverProfile.isApproved = true;
      driverProfile.approvalStatus = "approved";
      driverProfile.rejectionReason = "";
  
      await driverProfile.save();
  
      res.status(200).json({
        success: true,
        error: false,
        message: "Driver approved successfully",
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

//reject the driver 
const rejectDriver = async (req, res) => {
    try {
      const { driverId } = req.params;
      const { rejectionReason } = req.body;
  
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Rejection reason is required"
        });
      }
  
      const driverProfile = await DriverProfile.findById(driverId);
  
      if (!driverProfile) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Driver profile not found"
        });
      }
  
      driverProfile.isApproved = false;
      driverProfile.approvalStatus = "rejected";
      driverProfile.rejectionReason = rejectionReason;
  
      await driverProfile.save();
  
      res.status(200).json({
        success: true,
        error: false,
        message: "Driver rejected successfully",
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

//getDashboardStats 
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Access denied. Admin only"
      });
    }

    const totalRiders = await User.countDocuments({
      role: "rider"
    });

    const totalDrivers = await User.countDocuments({
      role: "driver"
    });

    const pendingDrivers = await DriverProfile.countDocuments({
      approvalStatus: "pending"
    });

    const approvedDrivers = await DriverProfile.countDocuments({
      approvalStatus: "approved"
    });

    const totalRides = await Ride.countDocuments();

    const completedRides = await Ride.countDocuments({
      rideStatus: "completed"
    });

    const cancelledRides = await Ride.countDocuments({
      rideStatus: "cancelled"
    });

    res.status(200).json({
      success: true,
      error: false,
      message: "Dashboard stats fetched successfully",
      data: {
        totalRiders,
        totalDrivers,
        pendingDrivers,
        approvedDrivers,
        totalRides,
        completedRides,
        cancelledRides
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
module.exports = {
    adminRegister,
    adminLogin,
    getPendingDrivers,
    approveDriver,
    rejectDriver,
    getDashboardStats
};