document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded – rendering My List favorites.");

  // Debug: Log the raw localStorage content for our key "myList"
  const rawFavorites = localStorage.getItem("myList");
  console.log("Raw localStorage 'myList':", rawFavorites);

  renderFavoritesList();
});

function renderFavoritesList() {
  // Use the container id "myListGrid" as provided in your HTML.
  const myListGrid = document.getElementById("myListGrid");
  if (!myListGrid) {
    console.error("No container found with id 'myListGrid'. Please add an element with id='myListGrid' to your HTML.");
    return;
  }

  // Retrieve favorites using the AddToMyListService module.
  const favorites = (typeof AddToMyListService !== "undefined")
    ? AddToMyListService.getFavorites()
    : [];
  console.log("Rendering favorites from localStorage (via AddToMyListService):", favorites);

  // Clear current content.
  myListGrid.innerHTML = "";

  if (favorites.length === 0) {
    myListGrid.innerHTML = "<p>No movies in your list yet.</p>";
    return;
  }

  favorites.forEach(movie => {
    // Normalize basic properties.
    const title = movie.Title || movie.title || "Unknown Title";
    const year = movie.Year || movie.year || "Unknown Year";
    const type = movie.Type || movie.type || "N/A";
    const rawPoster = movie.Poster || movie.posterUrl || movie.poster;
    const posterUrl = (rawPoster && rawPoster !== "N/A")
      ? rawPoster
      : "https://via.placeholder.com/220x320?text=No+Image";

    // Check for additional details.
    const genre = movie.Genre || movie.genre || "N/A";
    const imdbRating = movie.imdbRating || "N/A";

    console.log("Rendering movie:", { title, year, type, posterUrl, genre, imdbRating });

    // Create a movie card element.
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <a href="movie-details.html?title=${encodeURIComponent(title)}">
        <img src="${posterUrl}" alt="${title}" class="poster">
        <div class="details">
          <h3>${title} (${year})</h3>
          <p><strong>Genre:</strong> ${genre}</p>
          <p><strong>IMDb Rating:</strong> ${imdbRating}</p>
        </div>
      </a>
      <button class="remove-btn" data-title="${title}">Remove</button>
    `;

    // Attach event listener for the "Remove" button.
    const removeBtn = movieCard.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Attempting to remove movie:", title);
        const removed = AddToMyListService.removeFromMyList({ Title: title });
        if (removed) {
          showNotification(`"${title}" removed from My List.`);
          renderFavoritesList(); // Re-render the list.
        } else {
          console.warn("Failed to remove movie:", title);
        }
      });
    }

    myListGrid.appendChild(movieCard);
  });
}

// Optional: Non-blocking notification helper.
function showNotification(message, duration = 2000) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.bottom = "1rem";
    notification.style.right = "1rem";
    notification.style.padding = "0.75rem 1rem";
    notification.style.backgroundColor = "#333";
    notification.style.color = "#fff";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
    notification.style.zIndex = 1000;
    notification.style.fontSize = "0.9rem";
    notification.style.display = "none";
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, duration);
}

(function(global) {
  const STORAGE_KEY = "myList";

  function getFavorites() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Error parsing localStorage data for", STORAGE_KEY, err);
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      console.log("Favorites updated:", list);
    } catch (err) {
      console.error("Error saving favorites to localStorage", err);
    }
  }

  // Always add movies using uppercase keys
  function addToMyList(movie) {
    if (!movie || !(movie.Title || movie.title)) {
      console.error("Invalid movie object passed to addToMyList", movie);
      return false;
    }
    // Normalize the movie using uppercase keys.
    const normalizedMovie = {
      Title: movie.Title || movie.title,
      Poster: movie.Poster || movie.posterUrl || movie.poster || "https://via.placeholder.com/220x320?text=No+Image",
      Year: movie.Year || movie.year,
      Type: movie.Type || movie.type,
      imdbID: movie.imdbID || null
    };

    let favorites = getFavorites();
    // Compare using lower-case values for title.
    const normalizedTitle = normalizedMovie.Title.toLowerCase().trim();
    if (favorites.some(fav => ((fav.Title || fav.title || "").toLowerCase().trim() === normalizedTitle))) {
      console.warn(`Movie "${normalizedMovie.Title}" is already in favorites.`);
      return false;
    }
    favorites.push(normalizedMovie);
    saveFavorites(favorites);
    console.log(`Added "${normalizedMovie.Title}" to favorites.`);
    return true;
  }

  function removeFromMyList(movie) {
    if (!movie || !(movie.Title || movie.title)) {
      console.error("Invalid movie object passed to removeFromMyList", movie);
      return false;
    }
    let favorites = getFavorites();
    const removalTitle = (movie.Title || movie.title).toLowerCase().trim();
    const newFavorites = favorites.filter(fav => ((fav.Title || fav.title || "").toLowerCase().trim() !== removalTitle));
    if (newFavorites.length === favorites.length) {
      console.warn(`Movie "${movie.Title || movie.title}" was not found in favorites.`);
      return false;
    }
    saveFavorites(newFavorites);
    console.log(`Removed "${movie.Title || movie.title}" from favorites.`);
    return true;
  }

  // isInFavorites now compares normalized titles.
  function isInFavorites(movie) {
    if (!movie || !(movie.Title || movie.title)) return false;
    let favorites = getFavorites();
    const checkTitle = (movie.Title || movie.title).toLowerCase().trim();
    return favorites.some(fav => ((fav.Title || fav.title || "").toLowerCase().trim() === checkTitle));
  }

  global.AddToMyListService = {
    getFavorites,
    saveFavorites,
    addToMyList,
    removeFromMyList,
    isInFavorites
  };
})(window);

// Scroll behavior for My List Navbar
(function() {
  let lastScrollTop = 0;
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    // If scrolling down and more than 100px from top, hide navbar.
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (currentScroll > totalHeight * 0.1) {
      navbar.style.opacity = "0";
      navbar.style.pointerEvents = "none";
    } else {
      navbar.style.opacity = "1";
      navbar.style.pointerEvents = "all";
    }
  });
})();