import express from "express";
import routes from "./routes/index.js";
import { port } from "./config.js";
import logger from "./utils/logger.js";
import session from "express-session";
import * as myauth from "./utils/auth.js";
import cors from "cors";

import { handler } from "./frontend/build/handler.js";

const app = express();
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
    },
  })
);

const WORK_IP = process.env.WORK_IP;

app.use("/api", async (req, res, next) => {
  const isDevMode = process.env.DEV === "true";
  const clientIp = req.ip === "::1" || req.ip === "::ffff:127.0.0.1" ? "127.0.0.1" : req.ip;
  const isWorkIp = clientIp === WORK_IP;

  console.log(`Client IP: ${clientIp}, Work IP: ${isWorkIp}, Dev Mode: ${isDevMode}`);

  if (isDevMode || isWorkIp) {
    console.log("Access granted: Development mode or work IP.");
    return next();
  }

  const apiKey = req.query.key || req.body.key;
  console.log(`Received API Key: ${apiKey}`);

  const isAuthorized = req.session?.loggedIn || apiKey === process.env.API_KEY || (apiKey && (await myauth.checkApiKey(apiKey)));

  if (isAuthorized) {
    console.log("Access granted: Authorized.");
    next();
  } else {
    console.error("Access denied: Unauthorized request.");
    res.status(401).json({ msg: "NO AUTH" });
  }
});

app.use("/api", routes);

app.use("/", handler);

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

export { app };
