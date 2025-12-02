import express from "express";
import { confirmCachesExit } from "./cacher/index.js";
const app = express();
import { spawn } from "child_process";
import { openSync, closeSync } from "fs";
import { getHashReferences } from "./cacher/on-demand/particular-hash.js";

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

app.get("/search/:hash", async (req, res) => {
  const particularHash = req.params.hash;
  const result = await getHashReferences(particularHash).catch((errStatusPair) => {
    res.status(errStatusPair[1]).json({
      status: "error",
      message: errStatusPair[0].message,
    });
    if (errStatusPair[1] === 500) console.error("Error getting hash references:", errStatusPair[0]);
  });
  if (!result) return; // error already handled above
  res.json({
    status: "success",
    message: result.message,
    cachePath: result.path,
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
