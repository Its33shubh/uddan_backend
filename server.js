const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const path = require("path");
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
const driverProfileRoutes = require("./routes/driverProfileRoutes");
const Ride = require("./models/Ride");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Taxi Booking Backend Running...");
});

app.use("/api/rider", riderRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver-profile", driverProfileRoutes);
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
    let parsedData;

    try {
      parsedData =
        typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return;
    }

    const driverId = parsedData.driverId;

    if (!driverId) {
      console.log("Driver ID required");
      return;
    }

    onlineDrivers[driverId] = socket.id;

    console.log("Online Drivers:", onlineDrivers);
  });

  socket.on("rider_online", (data) => {
    let parsedData;

    try {
      parsedData =
        typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return;
    }

    const riderId = parsedData.riderId;
    if (!riderId) {
      console.log("Rider ID required");
      return;
    }

    onlineRiders[riderId] = socket.id;

    console.log("Online Riders:", onlineRiders);
  });
  socket.on("accept_ride", async (data) => {
    try {
      let parsedData;

      try {
        parsedData =
          typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        console.log("Invalid socket payload");
        return;
      }

      const { rideId, driverId } = parsedData;

      if (!rideId || !driverId) {
        console.log("Missing required data");
        return;
      }

      const ride = await Ride.findById(rideId);

      if (!ride) {
        console.log("Ride not found");
        return;
      }

      if (ride.rideStatus !== "requested") {
        console.log("Ride already accepted");
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


  socket.on("start_ride", async (data) => {
    try {
      let parsedData;

      try {
        parsedData =
          typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        console.log("Invalid socket payload");
        return;
      }

      const { rideId, driverId } = parsedData;

      if (!rideId || !driverId) {
        console.log("Missing required data");
        return;
      }

      const ride = await Ride.findById(rideId);

      if (!ride) {
        console.log("Ride not found");
        return;
      }

      if (ride.driverId.toString() !== driverId) {
        console.log("Unauthorized driver");
        return;
      }
      if (ride.rideStatus !== "accepted") {
        console.log("Ride must be accepted first");
        return;
      }

      ride.rideStatus = "started";

      await ride.save();

      const riderSocketId = onlineRiders[ride.riderId.toString()];

      if (riderSocketId) {
        io.to(riderSocketId).emit("ride_started", {
          message: "Your ride has started",
          ride
        });
      }

      console.log("Ride started:", ride._id);

    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("complete_ride", async (data) => {
    try {
      let parsedData;

      try {
        parsedData =
          typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        console.log("Invalid socket payload");
        return;
      }

      const { rideId, driverId } = parsedData;

      if (!rideId || !driverId) {
        console.log("Missing required data");
        return;
      }

      const ride = await Ride.findById(rideId);

      if (!ride) {
        console.log("Ride not found");
        return;
      }

      if (ride.driverId.toString() !== driverId) {
        console.log("Unauthorized driver");
        return;
      }
      if (ride.rideStatus !== "started") {
        console.log("Ride must be started first");
        return;
      }

      ride.rideStatus = "completed";

      await ride.save();

      const riderSocketId = onlineRiders[ride.riderId.toString()];

      if (riderSocketId) {
        io.to(riderSocketId).emit("ride_completed", {
          message: "Your ride has been completed",
          ride
        });
      }

      console.log("Ride completed:", ride._id);

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