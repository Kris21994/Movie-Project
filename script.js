
document.addEventListener("DOMContentLoaded", () => {
  // --- Global DOM Elements ---
  const movieDisplay = document.getElementById("movieDisplay");
  const navbar = document.querySelector(".navbar, .navbar__search");
  const moviesGrid = document.getElementById("moviesGrid");
  const decorationsContainer = document.querySelector(".search-decorations");

  // --- Scroll Handler: Toggle Navbar after significant scroll ---
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    
    const currentScroll = window.scrollY;
    // Use either 10% of scrollable area or a minimum of 50px, whichever is greater
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const threshold = Math.max(scrollable * 0.1, 50);
    
    if (currentScroll > threshold) {
      navbar.style.opacity = "0";
      navbar.style.pointerEvents = "none";
    } else {
      navbar.style.opacity = "1";
      navbar.style.pointerEvents = "all";
    }
  });
  
  // --- Floating Icons for Search Decorations ---
  if (decorationsContainer) {
    const icons = [
      "assets/clapperboard-open.png",
      "assets/film-strip.png",
      "assets/drink.png",
      "assets/star.png",
      "assets/microphone.png",
      "assets/theatre.png",
      "assets/film-roll.png",
      "assets/popcorn.png",
      "assets/cinema-tickets.png",
      "assets/video-camera.png",
      "assets/television.png",
      "assets/producer-chair.png"
    ];
    const rows = 5;        // Number of rows for symmetry
    const columns = 6;     // Number of icons per row
    const totalIcons = rows * columns;
    
    for (let i = 0; i < totalIcons; i++) {
      const icon = document.createElement("img");
      icon.src = icons[i % icons.length]; // Cycle through icons
      icon.classList.add("floating-icon");
      
      // Calculate symmetric grid positioning
      const row = Math.floor(i / columns);
      const column = i % columns;
      icon.style.top = `${(row / rows) * 100}%`;
      icon.style.left = `${(column / columns) * 100}%`;
      
      decorationsContainer.appendChild(icon);
    }
  }
  
  // --- Event Delegation for "Add to My List" Buttons ---
  // This checks if a movies grid exists and uses delegation to catch clicks on dynamically generated buttons.
  if (moviesGrid) {
    moviesGrid.addEventListener("click", function(e) {
      const button = e.target.closest(".add-to-list-btn");
      if (button) {
        const movieTitle = button.getAttribute("data-title");
        let myList = JSON.parse(localStorage.getItem("myList")) || [];
        // Note: Here we compare movieTitle as stored; ensure consistency with how you add movies.
        if (!myList.includes(movieTitle)) {
          myList.push(movieTitle);
          localStorage.setItem("myList", JSON.stringify(myList));
          alert(`${movieTitle} added to My List!`);
        } else {
          alert(`${movieTitle} is already in My List.`);
        }
      }
    });
  }
});

