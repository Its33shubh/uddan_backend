const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require('./config/db')
const riderRoutes = require("./routes/riderRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes")
const rideRoutes = require("./routes/rideRoutes");
dotenv.config();

connectDB()

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Taxi Booking Backend Running...");
});

app.use("/api/rider", riderRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/rides", rideRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});