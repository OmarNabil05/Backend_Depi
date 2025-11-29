import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";   // <-- FIXED

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new IOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

// Logger
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Socket events
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("joinRoom", (room) => socket.join(room));

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

// Make io available everywhere
app.set("io", io);

// Routes
import authRoutes from "./routes/auth.js";
import tableRoutes from "./routes/tables.js";
import reservationRoutes from "./routes/reservations.js";
import menuRoutes from "./routes/menu.js";
import statisticsRoutes from "./routes/statistics.js";

app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/statistics", statisticsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// DB
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
