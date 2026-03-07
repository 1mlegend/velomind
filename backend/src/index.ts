import express from "express";
import cors from "cors";
import { config } from "./config";
import inferenceRouter from "./routes/inference";
import jobsRouter from "./routes/jobs";
import proofsRouter from "./routes/proofs";
import statsRouter from "./routes/stats";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/inference", inferenceRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/proofs", proofsRouter);
app.use("/api/stats", statsRouter);

app.listen(config.port, () => {
  console.log(`VeloMind API running on port ${config.port}`);
});
