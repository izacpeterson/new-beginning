const express = require("express");
const hubSpotRoutes = require("./hubSpotRoutes");
const cronRoutes = require("./cronRoutes");
const logRoutes = require("./logRoutes");
const syncRoutes = require("./syncRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

// Mount hubSpot routes
router.use("/hubspot", hubSpotRoutes);
router.use("/crons", cronRoutes);
router.use("/logs", logRoutes);
router.use("/sync", syncRoutes);
router.use("/auth", authRoutes);

router.get("/", (req, res) => {
  res.send("Hello, world");
});

module.exports = router;
