import * as path from "path";
import * as fs from "fs";
import { cacheName as allHashesCacheName } from "../all-hash-list.js";

const cacheDir = path.join(process.cwd(), "caches", "particular_hashes");

export async function getHashReferences(particularHash) {
  ensureCacheDir();
  const outPath = path.join(cacheDir, `hash_${particularHash}.txt`);

  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(outPath, { flags: "w" });

    // const cacheLines = fs.readFileSync(path.join(process.cwd(), "caches", allHashesCacheName), "utf-8").split("\n");
  });
}

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
}
