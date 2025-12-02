import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";
import { cacheName as allHashesCacheName } from "../all-hash-list.js";

const cacheDir = path.join(process.cwd(), "caches", "particular_hashes");

export async function getHashReferences(particularHash) {
  ensureCacheDir();

  console.log(`Getting references for hash: ${particularHash}`);

  // Sanitize the particularHash for use in filenames
  const safeName = String(particularHash).replace(/[^a-zA-Z0-9_-]/g, "_");
  const outPath = path.join(cacheDir, `hash_${safeName}.txt`);

  return new Promise((resolve, reject) => {
    if (safeName.match(/^0x[0-9a-fA-F]{8}$/) === null) {
      return reject([new Error("Invalid hash format. Expected format: 0xXXXXXXXX"), 400]);
    }

    // If the per-hash cache already exists, return early to avoid reprocessing.
    if (fs.existsSync(outPath)) {
      try {
        const data = fs.readFileSync(outPath, { encoding: "utf8" });
        const lines = data.split(/\r?\n/).filter((l) => l.length > 0);
        return resolve({ message: "Cache exists", lines });
      } catch (err) {
        return reject([new Error("Failed to read per-hash cache: " + err.message), 500]);
      }
    }

    const outStream = fs.createWriteStream(outPath, { flags: "w" });

    const cachePath = path.join(process.cwd(), "caches", allHashesCacheName);
    if (!fs.existsSync(cachePath)) {
      outStream.end();
      return reject([new Error(`All-hashes cache not found at ${cachePath}. Run createCache() first.`), 500]);
    }

    const readStream = fs.createReadStream(cachePath, { encoding: "utf8" });
    readStream.on("error", (err) => {
      try {
        outStream.close();
      } catch (e) {}
      return reject([new Error("Failed to read all-hashes cache: " + err.message), 500]);
    });

    const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

    let found = false;
    const lines = [];

    rl.on("line", (line) => {
      try {
        if (line.includes(String(particularHash))) {
          found = true;
          lines.push(line);
          outStream.write(line + "\n");
        }
      } catch (e) {
        // ignore malformed lines
      }
    });

    rl.on("close", () => {
      outStream.end();
      if (found) resolve({ message: "References found", lines });
      else resolve({ message: "No matches", lines: [] });
    });
  });
}

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
}
