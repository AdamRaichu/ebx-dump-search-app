import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export const cacheName = "all_hashes.txt";

export async function createCache() {
  const cacheDir = path.join(process.cwd(), "caches");
  fs.mkdirSync(cacheDir, { recursive: true });
  const outPath = path.join(cacheDir, cacheName);

  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(outPath, { flags: "w" });

    // spawn git grep without extra shell quoting; pass the raw regex as an arg
    const child = spawn("git", ["grep", "-E", "0x[0-9a-f]{8}"], { cwd: path.join(process.cwd(), "full-xml") });

    child.on("error", (err) => {
      outStream.close();
      reject(new Error("Failed to start git process: " + err.message));
    });

    // Pipe stdout to the output file
    if (child.stdout) child.stdout.pipe(outStream);

    let stderr = "";
    if (child.stderr) {
      child.stderr.on("data", (c) => (stderr += c.toString()));
    }

    child.on("close", (code, signal) => {
      outStream.end();
      if (code === 0) {
        resolve("Cache created successfully.");
      } else if (code === 1) {
        // git grep returns 1 when no matches found — create empty cache and resolve
        resolve("Cache created (no matches).");
      } else if (code === null && signal) {
        reject(new Error(`git grep terminated with signal ${signal}`));
      } else {
        reject(new Error(`Cache creation failed with exit code ${code}. ${stderr}`));
      }
    });
  });
}
