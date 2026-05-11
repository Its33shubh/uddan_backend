const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// RIDER REGISTER
const riderRegister = async (req, res) => {
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

    const rider = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "rider"
    });

    res.status(201).json({
      success: true,
      error: false,
      message: "Rider registered successfully",
      data: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: rider.role
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


// RIDER LOGIN
const riderLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email and password are required"
      });
    }

    const rider = await User.findOne({
      email,
      role: "rider"
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Rider not found"
      });
    }

    if (rider.isBlocked) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Account is blocked"
      });
    }

    const isMatch = await bcrypt.compare(password, rider.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Invalid password"
      });
    }

    rider.lastLogin = new Date();
    await rider.save();

    const token = jwt.sign(
      {
        id: rider._id,
        role: rider.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      error: false,
      message: "Rider login successful",
      data: {
        token,
        user: {
          id: rider._id,
          name: rider.name,
          email: rider.email,
          phone: rider.phone,
          role: rider.role
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

module.exports = {
  riderRegister,
  riderLogin
};