import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";
import { cacheName as allGuidsCacheName } from "../all-guid-list.js";

const cacheDir = path.join(process.cwd(), "caches", "particular_guids");

/**
 * Get all references to a particular GUID from the all-GUIDs cache.
 * @param {string} particularGuid The GUID to look for (format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX).
 * @returns {Promise<{message: string, lines: string[]}>} Resolves with found lines or cache status.
 * @throws {Array} Rejects with [Error, statusCode] on failure.
 */
export async function getGuidReferences(particularGuid) {
  ensureCacheDir();

  particularGuid = particularGuid.toLowerCase();

  console.log(`Getting references for guid: ${particularGuid}`);

  // Sanitize the particularGuid for use in filenames
  const safeName = String(particularGuid).replace(/[^a-zA-Z0-9_-]/g, "_");
  const outPath = path.join(cacheDir, `guid_${safeName}.txt`);

  return new Promise((resolve, reject) => {
    if (safeName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) === null) {
      return reject([new Error("Invalid guid format. Expected format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"), 400]);
    }

    // if (particularGuid === "00000000-0000-0000-0000-000000000000") {
    //   return reject([new Error("Hash 00000000-0000-0000-0000-000000000000 is not valid for lookup."), 400]);
    // }

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

    const cachePath = path.join(process.cwd(), "caches", allGuidsCacheName);
    if (!fs.existsSync(cachePath)) {
      outStream.end();
      return reject([new Error(`All-GUIDs cache not found at ${cachePath}. Run createCache() first.`), 500]);
    }

    const readStream = fs.createReadStream(cachePath, { encoding: "utf8" });
    readStream.on("error", (err) => {
      try {
        outStream.close();
      } catch (e) {}
      return reject([new Error("Failed to read all-GUIDs cache: " + err.message), 500]);
    });

    const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

    let found = false;
    const lines = [];

    rl.on("line", (line) => {
      try {
        if (line.includes(String(particularGuid))) {
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
