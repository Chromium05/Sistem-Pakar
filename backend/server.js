const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Import routes
const expertSystemRoutes = require("./routes/expertSystem")
const houseRoutes = require("./routes/houses")
const questionRoutes = require("./routes/questions")

// Routes
app.use("/api/expert-system", expertSystemRoutes)
app.use("/api/houses", houseRoutes)
app.use("/api/questions", questionRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Expert System House Recommendation API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      expertSystem: "/api/expert-system",
      houses: "/api/houses",
      questions: "/api/questions",
    },
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack)
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expert System Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message)
  // Close server & exit process
  process.exit(1)
})

module.exports = app