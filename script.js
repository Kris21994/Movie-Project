document.addEventListener("DOMContentLoaded", () => {
  // --- Global DOM Elements ---
  const movieDisplay = document.getElementById("movieDisplay"); // may be used on specific pages
  const navbar = document.querySelector(".navbar, .navbar__search");
  const moviesGrid = document.getElementById("moviesGrid");
  const decorationsContainer = document.querySelector(".search-decorations");
  
  // --- Scroll Handler: Hide Navbar on Scroll & Adjust Opacity ---
  let lastScrollTop = window.scrollY;
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    
    const currentScroll = window.scrollY;
    // Hide or show navbar based on scroll direction
    if (currentScroll > lastScrollTop) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }
    lastScrollTop = currentScroll;
    
    // Adjust navbar opacity & pointer events if scrolled past 10% of page scroll
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (currentScroll > totalHeight * 0.1) {
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
      "/assets/clapperboard-open.png",
      "/assets/film-strip.png",
      "/assets/drink.png",
      "/assets/star.png",
      "/assets/microphone.png",
      "/assets/theatre.png",
      "/assets/film-roll.png",
      "/assets/popcorn.png",
      "/assets/cinema-tickets.png",
      "/assets/video-camera.png",
      "/assets/television.png",
      "/assets/producer-chair.png"
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
  
  // --- (Optional) If you have other page-specific code, add it here ---
});

