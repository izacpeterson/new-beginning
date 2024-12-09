import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/", (req, res) => {
  const logFilePath = path.resolve("../logs/app.log");

  try {
    const fileStream = fs.createReadStream(logFilePath, { encoding: "utf-8" });

    res.setHeader("Content-Type", "text/plain");

    // Pipe the file stream directly to the response
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("Error reading log file stream:", err.message);
      res.status(500).send("Error reading log file.");
    });
  } catch (error) {
    console.error("Error handling log file request:", error.message);
    res.status(500).send("Error handling log file.");
  }
});

export default router;
