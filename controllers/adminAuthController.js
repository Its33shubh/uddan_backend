const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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

module.exports = {
    adminRegister,
    adminLogin
};