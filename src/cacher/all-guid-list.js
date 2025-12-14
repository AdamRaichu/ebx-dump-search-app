import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { gitGrepCache } from "./utils.js";

const cacheDir = path.join(process.cwd(), "caches");
export const cacheName = "all_guids.txt";

export async function createCache() {
  return await gitGrepCache("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", path.join(cacheDir, cacheName), "full-xml");
}

// export async function createCache() {
//   fs.mkdirSync(cacheDir, { recursive: true });
//   const outPath = path.join(cacheDir, cacheName);

//   return new Promise((resolve, reject) => {
//     const outStream = fs.createWriteStream(outPath, { flags: "w" });

//     // spawn git grep without extra shell quoting; pass the raw regex as an arg
//     const child = spawn("git", ["grep", "-E", "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"], { cwd: path.join(process.cwd(), "full-xml") });

//     child.on("error", (err) => {
//       outStream.close();
//       reject(new Error("Failed to start git process: " + err.message));
//     });

//     // Pipe stdout to the output file
//     if (child.stdout) child.stdout.pipe(outStream);

//     // Keep only a small tail of stderr to avoid unbounded memory usage
//     let stderrBuf = "";
//     const STDERR_MAX = 1024; // characters
//     if (child.stderr) {
//       child.stderr.on("data", (c) => {
//         stderrBuf += c.toString();
//         if (stderrBuf.length > STDERR_MAX) stderrBuf = stderrBuf.slice(-STDERR_MAX);
//       });
//     }

//     child.on("close", (code, signal) => {
//       outStream.end();
//       if (code === 0) {
//         resolve("Cache created successfully.");
//       } else if (code === 1) {
//         // git grep returns 1 when no matches found — create empty cache and resolve
//         resolve("Cache created (no matches).");
//       } else if (code === null && signal) {
//         reject(new Error(`git grep terminated with signal ${signal}`));
//       } else {
//         // include only the capped stderr tail in the error
//         reject(new Error(`Cache creation failed with exit code ${code}. ${stderrBuf}`));
//       }
//     });
//   });
// }
