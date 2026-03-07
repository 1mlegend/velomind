import express from "express";
import cors from "cors";
import { config } from "./config";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(config.port, () => {
  console.log(`VeloMind API running on port ${config.port}`);
});
