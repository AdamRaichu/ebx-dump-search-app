import express from "express";
import { confirmCachesExit } from "./cacher/index.js";
const app = express();
import { spawn } from "child_process";
import { openSync, closeSync } from "fs";

const port = process.env.PORT || 3000;

console.log("Starting cache confirmation...");
await confirmCachesExit();
console.log("All caches confirmed.");

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/", (req, res) => {
  res.send("EBX Dump Search API");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
