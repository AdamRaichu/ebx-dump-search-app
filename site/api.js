const apiRoot = "https://ebxdump.freemyip.com:3000/";

function searchParticularHash(hash) {
  if (!hash.match(/^0x[0-9a-fA-F]{8}$/)) {
    return Promise.reject(new Error("Invalid hash format. Expected 0xXXXXXXXX"));
  }

  if (hash === "0x00000000") {
    return Promise.reject(new Error("0x00000000 is not a valid hash to search for."));
  }

  return fetch(`${apiRoot}search/hash/${hash}`).then((response) => response.json());
}
