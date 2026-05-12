const User = require("../models/user");
const DriverProfile = require("../models/DriverProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// DRIVER REGISTER
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



// DRIVER LOGIN
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

module.exports = {
  driverRegister,
  driverLogin
};