
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
  
  function addToMyList(movie) {
    if (!movie || !(movie.Title || movie.title)) {
      console.error("Invalid movie object passed to addToMyList", movie);
      return false;
    }
    // Normalize the movie object keys.
    const normalizedMovie = {
      Title: movie.Title || movie.title,
      Poster: movie.Poster || movie.posterUrl || movie.poster || "https://via.placeholder.com/220x320?text=No+Image",
      Year: movie.Year || movie.year,
      Type: movie.Type || movie.type,
      imdbID: movie.imdbID || null,
      Genre: movie.Genre || movie.genre || "N/A",
      imdbRating: movie.imdbRating || "N/A"
    };
    let favorites = getFavorites();
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


/**
 * Now, the search page code.
 */
document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "5b35e158"; // Your OMDb API key.
  let allMovies = [];
  let filteredMovies = [];
  let currentPage = 1;
  const moviesPerPage = 15;
  let currentFilter = "all";
  let currentSort = "default";

  // DOM elements:
  const movieDisplay = document.getElementById("movieDisplay");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  if (!movieDisplay) {
    console.error("movieDisplay element not found in DOM.");
  }

  // Notification helper:
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

  // Dummy enrichMovieData (for additional details if needed):
  async function enrichMovieData(movie) {
    return movie;
  }

  // Updated fetchMovie with caching:
  async function fetchMovie(movieTitle) {
    const cacheKey = "omdb_" + encodeURIComponent(movieTitle);
    let cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        console.log(`Loading "${movieTitle}" from cache.`);
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error parsing cached data for", movieTitle, e);
      }
    }
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched movie data:", data);
      if (data.Response === "True") {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      return null;
    }
  }

  // Display movies: build the movie cards with details and add-to-list button.
  function displayMovies(movies) {
    if (!movieDisplay) return;
    movieDisplay.innerHTML = "";
    console.log("Rendering movies:", movies);

    movies.forEach(movie => {
      const title = movie.Title || "Unknown Title";
      const year = movie.Year || "Unknown Year";
      const type = (movie.Type && movie.Type !== "N/A")
        ? movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)
        : "N/A";
      const rawPoster = movie.Poster;
      const posterUrl = (rawPoster && rawPoster !== "N/A")
        ? rawPoster
        : "https://via.placeholder.com/220x320?text=No+Image";

      const detailsHtml = `
            <h3>${title} (${year})</h3>
            <p><strong>Genre:</strong> ${movie.Genre || "N/A"}</p>
            <p><strong>IMDb Rating:</strong> ${movie.imdbRating || "N/A"}</p>
          `;
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");

      movieCard.innerHTML = `
            <a href="movie-details.html?title=${encodeURIComponent(title)}">
              <img src="${posterUrl}" alt="${title}" class="poster">
              <div class="details">
                ${detailsHtml}
              </div>
            </a>
            <button class="add-to-list-btn" data-title="${title}">
              <i class="fa fa-star"></i>
            </button>
          `;

      const addBtn = movieCard.querySelector(".add-to-list-btn");
      if (addBtn) {
        addBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          let enrichedMovie = movie;
          if (!movie.Genre || movie.Genre === "N/A" ||
              !movie.imdbRating || movie.imdbRating === "N/A") {
            enrichedMovie = await enrichMovieData(movie);
          }
          if (AddToMyListService.isInFavorites(enrichedMovie)) {
            const removed = AddToMyListService.removeFromMyList(enrichedMovie);
            if (removed) {
              addBtn.classList.remove("added");
              showNotification(`"${enrichedMovie.Title}" removed from My List.`);
            }
          } else {
            const added = AddToMyListService.addToMyList(enrichedMovie);
            if (added) {
              addBtn.classList.add("added");
              showNotification(`"${enrichedMovie.Title}" added to My List!`);
            }
          }
        });
        if (AddToMyListService.isInFavorites({ Title: movie.Title })) {
          addBtn.classList.add("added");
        }
      }
      movieDisplay.appendChild(movieCard);
    });
  }

  // Update display with pagination.
  function updateDisplay() {
    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    const startIndex = (currentPage - 1) * moviesPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, startIndex + moviesPerPage);
    console.log(`Displaying page ${currentPage} of ${totalPages}`);
    displayMovies(moviesToShow);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  // Filtering functions.
  function filterMovies() {
    if (currentFilter === "all") {
      filteredMovies = [...allMovies];
    } else {
      filteredMovies = allMovies.filter(movie =>
        movie.Genre && movie.Genre.includes(currentFilter)
      );
    }
  }

  function sortMovies() {
    if (currentSort === "year") {
      filteredMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    } else if (currentSort === "rating") {
      filteredMovies.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    } else if (currentSort === "title") {
      filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
    }
  }

  function applyFiltersAndSorting() {
    filterMovies();
    sortMovies();
    currentPage = 1;
    updateDisplay();
  }

  // Search functionality: for each search result, fetch full details.
  async function performSearch() {
    const query = searchInput ? searchInput.value.trim() : "";
    if (!query) {
      if (movieDisplay) movieDisplay.innerHTML = "<p>Please enter a movie title to search.</p>";
      return;
    }
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.Response === "True") {
        console.log("Search results:", data.Search);
        const moviePromises = data.Search.map(movie => fetchMovie(movie.Title));
        const fullMovies = await Promise.all(moviePromises);
        allMovies = fullMovies.filter(movie => movie);
        filteredMovies = allMovies.slice();
        currentPage = 1;
        updateDisplay();
      } else {
        if (movieDisplay) movieDisplay.innerHTML = "<p>No movies found.</p>";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  // Pagination event listeners.
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateDisplay();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
        if (movieDisplay) window.scrollTo({ top: movieDisplay.offsetTop, behavior: "smooth" });
      }
    });
  }

  // Search button and Enter key listeners.
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }

  // Dropdown event listeners for Sorting and Filtering.
  const genreDropdown = document.getElementById("genreDropdown");
  if (genreDropdown) {
    document.querySelectorAll("#genreDropdown .dropdown-content button").forEach(btn => {
      btn.addEventListener("click", e => {
        currentFilter = e.target.getAttribute("data-genre") || "all";
        applyFiltersAndSorting();
        genreDropdown.classList.remove("open");
      });
    });
  }

  const sortDropdown = document.getElementById("sortDropdown");
  if (sortDropdown) {
    document.querySelectorAll("#sortDropdown .dropdown-content button").forEach(btn => {
      btn.addEventListener("click", e => {
        currentSort = e.target.getAttribute("data-sort") || "default";
        applyFiltersAndSorting();
        sortDropdown.classList.remove("open");
      });
    });
  }

  // Toggle dropdowns for mobile view.
  document.querySelectorAll(".dropdown .drop-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const parent = e.target.parentElement;
      if (parent) {
        parent.classList.toggle("open");
      }
    });
  });

  // Optional: listeners for select elements if you use them.
  const filterGenreEl = document.getElementById("filterGenre");
  if (filterGenreEl) {
    filterGenreEl.addEventListener("change", e => {
      currentFilter = e.target.value;
      applyFiltersAndSorting();
    });
  }
  const sortCriteriaEl = document.getElementById("sortCriteria");
  if (sortCriteriaEl) {
    sortCriteriaEl.addEventListener("change", e => {
      currentSort = e.target.value;
      applyFiltersAndSorting();
    });
  }

  // Fetch default set of movies.
  const defaultMovies = [
    "Mad Max: Fury Road",
    "Blade Runner 2049",
    "The Matrix",
    "Jurassic Park",
    "The Social Network",
    "Ford v Ferrari",
    "Whiplash",
    "The Grand Budapest Hotel",
    "A Quiet Place",
    "Coco",
    "Inside Out",
    "Soul",
    "Shutter Island",
    "The Prestige",
    "Interstellar",
    "The Godfather",
    "The Godfather: Part II",
    "The Dark Knight",
    "Schindler's List",
    "Pulp Fiction",
    "The Lord of the Rings: The Return of the King",
    "Fight Club",
    "Forrest Gump",
    "Inception",
    "The Lord of the Rings: The Fellowship of the Ring",
    "Star Wars: Episode V - The Empire Strikes Back",
    "The Lord of the Rings: The Two Towers",
    "The Good, the Bad and the Ugly",
    "Goodfellas",
    "One Flew Over the Cuckoo's Nest",
    "Seven Samurai",
    "Se7en",
    "City of God",
    "The Silence of the Lambs",
    "It's a Wonderful Life",
    "Life Is Beautiful",
    "The Usual Suspects",
    "Léon: The Professional",
    "Saving Private Ryan",
    "Spirited Away",
    "The Green Mile",
    "Parasite",
    "Gladiator",
    "American History X",
    "The Lion King",
    "The Pianist",
    "Terminator 2: Judgment Day",
    "Back to the Future",
    "Alien",
    "The Shining",
    "Vasantha Mullai",
    "Blade Runner",
    "The Revenant",
    "Joker",
    "1917",
    "Dunkirk",
    "Motel Melati",
    "The Wolf of Wall Street",
    "Bohemian Rhapsody",
    "The Irishman",
    "Moneyball",
    "No Country for Old Men",
    "The Departed",
    "Eternal Sunshine of the Spotless Mind",
    "Memento",
    "Requiem for a Dream",
    "Donnie Darko",
    "The Truman Show",
    "Up",
    "WALL-E",
    "Toy Story",
    "The Incredibles",
    "Finding Nemo",
    "Shrek",
    "Black Panther",
    "Avengers: Infinity War",
    "Avengers: Endgame",
    "Captain America: The Winter Soldier",
    "Guardians of the Galaxy",
    "Iron Man",
    "Thor: Ragnarok",
    "Spider-Man: Into the Spider-Verse",
    "The Avengers",
    "Deadpool",
    "Logan",
    "Edge of Tomorrow",
    "District 9",
    "The Martian",
    "Arrival",
    "Her",
    "Ex Machina",
    "Gravity",
    "Sicario",
    "Prisoners",
    "Nightcrawler",
    "The King's Speech",
    "Argo",
    "Spotlight",
    "Room",
    "Once Upon a Time in America"
  ];

  (async function () {
    const fetchPromises = defaultMovies.map(title => fetchMovie(title));
    const results = await Promise.all(fetchPromises);
    results.forEach(movie => {
      if (movie) { allMovies.push(movie); }
    });
    filteredMovies = allMovies.slice();
    updateDisplay();
  })();

  // Store current URL when a movie link is clicked for navigation.
  setTimeout(() => {
    document.querySelectorAll(".movie-card a").forEach(link => {
      link.addEventListener("click", () => {
        sessionStorage.setItem("previousPage", window.location.href);
      });
    });
  }, 1000);
});


document.addEventListener("DOMContentLoaded", () => {
  const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  };

  document.querySelectorAll('.drop-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentDropdown = button.closest('.dropdown');
      const wasOpen = parentDropdown.classList.contains('open');
      
      closeAllDropdowns();
      if (!wasOpen) {
        parentDropdown.classList.add('open');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  document.querySelectorAll('.dropdown-content button').forEach(option => {
    option.addEventListener('click', (e) => {
      const parentDropdown = e.target.closest('.dropdown');
      closeAllDropdowns();
      parentDropdown.classList.remove('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
});

