const searchForHashToggle = document.getElementById("search-for-hash");
searchForHashToggle.addEventListener("click", () => {
  const container = document.getElementById("search-for-hash-container");
  container.classList.toggle("hidden");
});

const searchHashButton = document.getElementById("search-hash-button");
searchHashButton.addEventListener("click", () => {
  const hashInput = document.getElementById("hash-input").value;
  const resultsContainer = document.getElementById("search-hash-results");
  resultsContainer.innerHTML = "Searching...";
  searchParticularHash(hashInput)
    .then((data) => {
      if (data.lines && data.lines.length > 0) {
        resultsContainer.innerHTML = `<h3>Results:</h3><ul>${data.lines.map((result) => `<li>${result}</li>`).join("")}</ul>`;
      } else {
        resultsContainer.innerHTML = "No results found.";
      }
    })
    .catch((error) => {
      resultsContainer.innerHTML = `Error: ${error.message}`;
    });
});
