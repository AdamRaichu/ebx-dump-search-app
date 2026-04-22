import * as path from "path";
import * as fs from "fs";
import * as entityNames from "./entity-names.json" with { type: "json" };
import { gitGrepCache } from "../utils.js";

const cacheDir = path.join(process.cwd(), "caches", "particular_entities");

export async function getEntityReferences(particularEntityName) {
  ensureCacheDir();

  console.log(`Getting references for entity: ${particularEntityName}`);

  return new Promise(async (resolve, reject) => {
    if (!entityNames.default.includes(particularEntityName)) {
      return reject([new Error(`Entity name "${particularEntityName}" not found in entity names list.`), 400]);
    }

    const outPath = path.join(cacheDir, `entity_${particularEntityName}.txt`);

    try {
      if (fs.existsSync(outPath)) {
        const fileContent = fs.readFileSync(outPath, "utf8");
        return resolve({ message: "Cache found", lines: fileContent.split("\n").filter((line) => line.length > 0).map((line) => line.trim()) });
      }
    } catch (err) {
      return reject([new Error("Failed to read per-entity cache: " + err.message), 500]);
    }

    const outStream = fs.createWriteStream(outPath, { flags: "w" });

    await gitGrepCache(`<${particularEntityName}`, outPath, "full-xml")
      .then(async () => {
        resolve(await (getEntityReferences(particularEntityName)));
      }).catch((err) => {
        reject([new Error(`Failed to create cache for entity ${particularEntityName}`), 500]);
      });
  });
}

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
}