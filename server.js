const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const riderRoutes = require("./routes/riderRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");
const rideRoutes = require("./routes/rideRoutes");

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
  
  const onlineDrivers = {};
  
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);
  
    socket.on("driver_online", (data) => {
      const { driverId } = data;
  
      onlineDrivers[driverId] = socket.id;
  
      console.log("Online Drivers:", onlineDrivers);
    });
  
    socket.on("disconnect", () => {
      for (let driverId in onlineDrivers) {
        if (onlineDrivers[driverId] === socket.id) {
          delete onlineDrivers[driverId];
        }
      }
  
      console.log("Socket Disconnected:", socket.id);
      console.log("Online Drivers:", onlineDrivers);
    });
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

module.exports = { io, onlineDrivers };