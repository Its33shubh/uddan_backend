# 🚖 UDDAN Taxi Booking System Backend

A scalable and real-time Taxi Booking Backend API built with **Node.js**, **Express.js**, **MongoDB**, **JWT Authentication**, and **Socket.IO**.

The system supports Riders, Drivers, and Admins with complete ride management, driver verification, real-time ride updates, and dashboard analytics.

---

# 🚀 Features

## Rider Features

* Rider Registration & Login
* JWT Authentication
* Book Taxi Rides
* View Current Ride
* Ride History
* Cancel Ride
* Profile Management

## Driver Features

* Driver Registration & Login
* Driver Profile Completion
* Document Upload & Verification
* Available Ride Requests
* Accept Ride Requests
* Current Ride Tracking
* Ride History

## Admin Features

* Admin Authentication
* Driver Approval / Rejection
* Dashboard Statistics
* Manage Riders
* Manage Drivers
* Monitor All Rides

## Real-Time Features

* Driver Online Status
* Rider Online Status
* Live Ride Requests
* Ride Acceptance Updates
* Ride Start Notifications
* Ride Completion Notifications

---

# 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt.js
* Socket.IO
* Multer
* Cloudinary
* Render

---

# 📂 API Modules

## 🔐 Authentication APIs

### Rider

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | `/api/rider/register` |
| POST   | `/api/rider/login`    |

### Driver

| Method | Endpoint                       |
| ------ | ------------------------------ |
| POST   | `/api/driver/register`         |
| POST   | `/api/driver/login`            |
| POST   | `/api/driver/complete-profile` |

### Admin

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | `/api/admin/register` |
| POST   | `/api/admin/login`    |

---

# 🚕 Ride Management APIs

| Method | Endpoint                    |
| ------ | --------------------------- |
| POST   | `/api/rides/book`           |
| GET    | `/api/rides/history`        |
| GET    | `/api/rides/current`        |
| PATCH  | `/api/rides/cancel/:rideId` |

### Features

* Ride Booking
* Fare Calculation
* Current Ride Tracking
* Ride Cancellation
* Trip History

---

# 👤 Rider Profile APIs

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | `/api/rider/profile`        |
| PATCH  | `/api/rider/update-profile` |

---

# 🚗 Driver Profile APIs

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| GET    | `/api/driver-profile/profile`          |
| PATCH  | `/api/driver-profile/update-profile`   |
| POST   | `/api/driver-profile/upload-documents` |
| GET    | `/api/driver-profile/documents`        |
| PATCH  | `/api/driver-profile/update-documents` |

### Driver Documents

* Driving License
* Aadhaar Card
* Vehicle RC
* Vehicle Insurance

---

# 🚘 Driver Ride APIs

| Method | Endpoint                      |
| ------ | ----------------------------- |
| GET    | `/api/driver/available-rides` |
| GET    | `/api/driver/current-ride`    |
| GET    | `/api/driver/ride-history`    |

---

# 🛡️ Admin APIs

## Driver Approval Management

| Method | Endpoint                              |
| ------ | ------------------------------------- |
| GET    | `/api/admin/pending-drivers`          |
| PUT    | `/api/admin/approve-driver/:driverId` |
| PUT    | `/api/admin/reject-driver/:driverId`  |

## Dashboard Management

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | `/api/admin/dashboard-stats` |
| GET    | `/api/admin/all-drivers`     |
| GET    | `/api/admin/all-riders`      |
| GET    | `/api/admin/all-rides`       |

---

# ⚡ Socket.IO Events

## Driver Events

```javascript
driver_online
accept_ride
start_ride
complete_ride
```

## Rider Events

```javascript
rider_online
```

## Server Events

```javascript
new_ride_request
ride_accepted
ride_started
ride_completed
```

---

# 🔄 Ride Flow

```text
Rider Books Ride
        ↓
Online Drivers Receive Request
        ↓
Driver Accepts Ride
        ↓
Ride Accepted Event
        ↓
Driver Starts Ride
        ↓
Ride Started Event
        ↓
Driver Completes Ride
        ↓
Ride Completed Event
```

---

# 📁 Project Structure

```bash
backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── socket/
├── config/
├── utils/
├── uploads/
│
├── server.js
├── package.json
└── README.md
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

---

# ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Its33shubh/uddan-taxi-backend.git
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

---


# 👨‍💻 Developer

**Shubham Kaklotar**

📍 Bhavnagar, Gujarat

🔗 GitHub: https://github.com/Its33shubh

🔗 LinkedIn: https://linkedin.com/in/shubham-kaklotar

---

