const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const {
    setSocketIO,
    onlineDrivers,
    onlineRiders
  } = require("./socket/socketManager");

const riderRoutes = require("./routes/riderRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");
const rideRoutes = require("./routes/rideRoutes");
const Ride = require("./models/Ride");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Taxi Booking Backend Running...");
});

app.use("/api/rider", riderRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rides", rideRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

setSocketIO(io);

io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);
  
    socket.on("driver_online", (data) => {
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      
        const driverId = parsedData.driverId;
      
        onlineDrivers[driverId] = socket.id;
      
        console.log("Online Drivers:", onlineDrivers);
      });
      
      socket.on("rider_online", (data) => {
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      
        const riderId = parsedData.riderId;
      
        onlineRiders[riderId] = socket.id;
      
        console.log("Online Riders:", onlineRiders);
      });
      socket.on("accept_ride", async (data) => {
        try {
          const parsedData =
            typeof data === "string" ? JSON.parse(data) : data;
      
          const { rideId, driverId } = parsedData;
      
          const ride = await Ride.findById(rideId);
      
          if (!ride) {
            console.log("Ride not found");
            return;
          }
      
          ride.driverId = driverId;
          ride.rideStatus = "accepted";
      
          await ride.save();
      
          const riderSocketId = onlineRiders[ride.riderId.toString()];
      
          if (riderSocketId) {
            io.to(riderSocketId).emit("ride_accepted", {
              message: "Driver accepted your ride",
              ride
            });
          }
      
          console.log("Ride accepted:", ride._id);
      
        } catch (error) {
          console.log(error.message);
        }
      });
    socket.on("disconnect", () => {
      // remove drivers
      for (let driverId in onlineDrivers) {
        if (onlineDrivers[driverId] === socket.id) {
          delete onlineDrivers[driverId];
        }
      }
  
      // remove riders
      for (let riderId in onlineRiders) {
        if (onlineRiders[riderId] === socket.id) {
          delete onlineRiders[riderId];
        }
      }
  
      console.log("Socket Disconnected:", socket.id);
      console.log("Online Drivers:", onlineDrivers);
      console.log("Online Riders:", onlineRiders);
    });
  });
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});