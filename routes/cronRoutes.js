import express from "express";
import { startAllJobs, stopAllJobs, getAllJobs, getJobByName } from "../jobs/index.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Crons");
});

router.get("/stopall", (req, res) => {
  stopAllJobs();
  res.send({ msg: "Jobs Stopped" });
});

router.get("/startall", (req, res) => {
  startAllJobs();
  res.send({ msg: "Jobs Started" });
});

router.get("/status", (req, res) => {
  const jobs = getAllJobs();
  const status = jobs.map((job) => job.status());
  res.json(status);
});

router.get("/force/:name", (req, res) => {
  const jobName = req.params.name;
  const job = getJobByName(jobName);

  if (!job) {
    return res.status(404).json({ message: `Job '${jobName}' not found.` });
  }

  try {
    job.forceExecute();
    res.json({ message: `Job '${jobName}' executed successfully.` });
  } catch (error) {
    res.status(500).json({ message: `Error executing job '${jobName}': ${error.message}` });
  }
});

export default router;
