import express from "express";
import compression from "compression";
import cors from "cors";
import { confirmCachesExit } from "./cacher/index.js";
const app = express();
import * as entityNames from "./cacher/on-demand/entity-names.json" with { type: "json" };
import { getHashReferences } from "./cacher/on-demand/particular-hash.js";
import { getGuidReferences } from "./cacher/on-demand/particular-guid.js";
import { getEntityReferences } from "./cacher/on-demand/particular-entity.js"

const port = process.env.PORT || 3000;

app.use(compression());
app.use(cors());
app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    return res.status(400).send('Malformed URL: Check your percent signs.');
  }

  res.status(500).send('Something went wrong');
});

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

app.get("/search/hash/:hash", async (req, res) => {
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
    lines: result.lines,
  });
});

app.get("/search/guid/:guid", async (req, res) => {
  const particularGuid = req.params.guid;
  const result = await getGuidReferences(particularGuid).catch((errStatusPair) => {
    res.status(errStatusPair[1]).json({
      status: "error",
      message: errStatusPair[0].message,
    });
    if (errStatusPair[1] === 500) console.error("Error getting guid references:", errStatusPair[0]);
  });
  if (!result) return; // error already handled above
  res.json({
    status: "success",
    message: result.message,
    lines: result.lines,
  });
});

app.get("/search/entity/:entity", async (req, res) => {
  const particularEntityName = req.params.entity;
  const result = await getEntityReferences(particularEntityName).catch((errStatusPair) => {
    res.status(errStatusPair[1]).json({
      status: "error",
      message: errStatusPair[0].message,
    });
    if (errStatusPair[1] === 500) console.error("Error getting entity references:", errStatusPair[0]);
  });
  if (!result) return; // error already handled above
  res.json({
    status: "success",
    message: result.message,
    lines: result.lines,
  });
});

app.get("/search/entity/list", async (req, res) => {
  res.json({
    status: "success",
    message: "Listing allowed entities to search for",
    entities: entityNames.default
  })
});

app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    return res.status(400).send('Malformed URL');
  }

  res.status(500).send('Something went wrong');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


export default app;
