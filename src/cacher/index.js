import * as fs from "fs";
import * as allHashList from "./all-hash-list.js";
import * as allGuidList from "./all-guid-list.js";

export async function confirmCachesExit() {
  if (!fs.existsSync("caches")) {
    fs.mkdirSync("caches");
  }

  const promises = [];

  if (!fs.existsSync("caches/" + allHashList.cacheName)) {
    console.log("Creating all hashes cache...");
    promises.push(allHashList.createCache());
  }

  if (!fs.existsSync("caches/" + allGuidList.cacheName)) {
    console.log("Creating all GUIDs cache...");
    promises.push(allGuidList.createCache());
  }

  await Promise.all(promises).catch((err) => {
    console.error("Error creating caches:", err);
  });
}
