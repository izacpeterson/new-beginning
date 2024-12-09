import express from "express";
import hubSpotRoutes from "./hubSpotRoutes.js";
import cronRoutes from "./cronRoutes.js";
import logRoutes from "./logRoutes.js";
import syncRoutes from "./syncRoutes.js";
import authRoutes from "./authRoutes.js";
import zohoRoutes from "./zohoRoutes.js";

const router = express.Router();

router.use("/hubspot", hubSpotRoutes);
router.use("/crons", cronRoutes);
router.use("/logs", logRoutes);
router.use("/sync", syncRoutes);
router.use("/auth", authRoutes);
router.use("/zoho", zohoRoutes);

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let text = `
    Routes:
    /api/hubspot
    /api/crons
    /api/logs
    /api/sync
    /api/auth
    /api/zoho
    `;
  res.send(text);
});

export default router;
