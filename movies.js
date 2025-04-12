document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "5b35e158"; // Replace with your valid OMDb API key if necessary
    const moviesGrid = document.getElementById("moviesGrid");
    let moviesData = [];
  
    // --- Helper functions for localStorage management ---
    function getMyList() {
      return JSON.parse(localStorage.getItem("myList")) || [];
    }
  
    function saveMyList(list) {
      localStorage.setItem("myList", JSON.stringify(list));
    }
  
    // --- Notification helper ---
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
        document.body.appendChild(notification);
      }
      notification.textContent = message;
      notification.style.display = "block";
      setTimeout(() => {
        notification.style.display = "none";
      }, duration);
    }
  
    // --- Function to add a movie to "My List" ---
    function addToMyList(movie) {
      if (!movie || !movie.Title) {
        showNotification("Incomplete movie data. Cannot add to list.");
        return;
      }
      let list = getMyList();
      // Check for duplicates based on movie title
      if (list.some(m => m.title === movie.Title)) {
        showNotification(`${movie.Title} is already in your list.`);
      } else {
        // Normalize the object before saving
        const movieObject = {
          title: movie.Title,
          posterUrl: movie.Poster,
          year: movie.Year,
          genre: movie.Genre,
          imdbRating: movie.imdbRating
        };
        list.push(movieObject);
        saveMyList(list);
        showNotification(`${movie.Title} has been added to your list!`);
      }
    }
  
    // --- Function to remove a movie from "My List" ---
    function removeFromMyList(movie) {
      let list = getMyList();
      list = list.filter(m => m.title !== movie.Title);
      saveMyList(list);
      showNotification(`${movie.Title} has been removed from your list.`);
    }
  
    // --- Function to display movies ---
    function displayMovies(movies) {
      if (!moviesGrid) return;
      moviesGrid.innerHTML = ""; // Clear previous content
  
      movies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card", "show");
        card.style.position = "relative";
  
        // Use dummy image as fallback if movie.Poster is missing or invalid
        const posterUrl = (movie.Poster && movie.Poster !== "N/A")
                          ? movie.Poster
                          : "https://dummyimage.com/220x320/000/fff.png&text=No+Image";
  
        card.innerHTML = `
          <a href="movie-details.html?title=${encodeURIComponent(movie.Title)}">
            <img src="${posterUrl}" alt="${movie.Title}" class="poster">
            <div class="details">
              <h3>${movie.Title} (${movie.Year})</h3>
              <p><strong>Genre:</strong> ${movie.Genre}</p>
              <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
            </div>
          </a>
          <button class="add-to-list-btn" data-title="${movie.Title}">
            <i class="fa fa-star"></i>
          </button>
        `;
  
        // Attach click event to the "Add to My List" button.
        const addBtn = card.querySelector(".add-to-list-btn");
        if (addBtn) {
          addBtn.addEventListener("click", (e) => {
            // Prevent the anchor from being followed if button is inside the card
            e.preventDefault();
            e.stopPropagation();
  
            // Toggle state without blocking alerts
            if (addBtn.classList.contains("added")) {
              removeFromMyList(movie);
              addBtn.classList.remove("added");
            } else {
              addToMyList(movie);
              addBtn.classList.add("added");
            }
          });
        }
        moviesGrid.appendChild(card);
      });
    }
  
    // --- Function to fetch a movie from the OMDb API by title ---
    async function fetchMovie(movieTitle) {
      const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True") {
          moviesData.push(data);
          displayMovies(moviesData);
        } else {
          console.error(`Movie not found: ${movieTitle}`);
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    }
  
    // --- List of popular movies to fetch automatically ---
    const popularMovies = [
      "Inception", "Interstellar", "The Dark Knight",
      "Avatar", "Avengers: Endgame", "Joker",
      "Parasite", "Dune", "Tenet",
      "Guardians of the Galaxy", "Spider-Man: No Way Home", "Black Panther"
    ];
  
    // Fetch each popular movie
    popularMovies.forEach(title => {
      fetchMovie(title);
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Select the header element (adjust selector/id as needed)
    const header = document.getElementById("mainHeader");
    if (!header) {
      console.error("Main header element not found.");
      return;
    }
    
    // URL of the header background image
    const bgImageUrl = "assets/header-bg.jpg"; // update with your actual image path
    
    // Check if a cached data URL already exists for the header background
    let cachedBg = sessionStorage.getItem("headerBg");
    if (cachedBg) {
      header.style.backgroundImage = `url(${cachedBg})`;
      console.log("Loaded header background from cache.");
    } else {
      // Create an image object to load the header background image
      const img = new Image();
      img.src = bgImageUrl;
      img.crossOrigin = "Anonymous"; // if image is served with proper CORS headers
      img.onload = function () {
        // Create a canvas to get the base64 representation
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Convert the canvas to a data URL (PNG or JPEG)
        const dataURL = canvas.toDataURL("image/jpeg");
        // Set the header background to the data URL
        header.style.backgroundImage = `url(${dataURL})`;
        // Cache the base64 image in sessionStorage for subsequent page loads
        sessionStorage.setItem("headerBg", dataURL);
        console.log("Fetched and cached header background.");
      };
      img.onerror = function (err) {
        console.error("Error loading header background image:", err);
      };
    }
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    // Check if the viewport is 600px or less
    if (window.innerWidth <= 600 || window.matchMedia("(max-width: 600px)").matches) {
      // Insert your mobile-only JavaScript code here.
      // This example ensures that when an add-to-list button is clicked,
      // its 'added' state toggles immediately and remains consistent.
      document.querySelectorAll(".add-to-list-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          const title = this.getAttribute("data-title");
          // Construct a minimal movie object – adjust as needed
          const movie = { Title: title };
          if (AddToMyListService.isInFavorites(movie)) {
            // Immediately update the button state
            this.classList.remove("added");
            AddToMyListService.removeFromMyList(movie);
            showNotification(`"${title}" removed from My List.`);
          } else {
            this.classList.add("added");
            AddToMyListService.addToMyList(movie);
            showNotification(`"${title}" added to My List!`);
          }
        });
      });
  
      // If you need any additional mobile-specific event listeners or fixes,
      // add them here.
      // For example, resetting transform on click if necessary:
      document.querySelectorAll(".movie-card").forEach(card => {
        card.addEventListener("click", function() {
          // Reset transform after a short delay to ensure animation is cleared.
          setTimeout(() => {
            this.style.transform = "translateY(0) scale(1)";
          }, 100);
        });
      });
    }
  });