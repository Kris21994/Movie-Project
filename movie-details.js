async function fetchMovieDetails(title) {
    const apiKey = "5b35e158";  
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.Response === "True" ? data : null;
    } catch (error) {
      console.error("Error fetching details:", error);
      return null;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieTitle = urlParams.get("title");
    if (!movieTitle) return;

    const apiKey = "5b35e158";  
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True") {
            // Set all movie details
            document.querySelector(".poster").src = data.Poster;
            document.querySelector(".poster").alt = data.Title;
            document.querySelector(".title").textContent = `${data.Title} (${data.Year})`;
            document.querySelector(".genre").textContent = `Genre: ${data.Genre}`;
            document.querySelector(".director").textContent = `Director: ${data.Director}`;
            document.querySelector(".actors").textContent = `Cast: ${data.Actors}`;
            document.querySelector(".plot").textContent = `Plot: ${data.Plot}`;
            document.querySelector(".release-date").textContent = `Released: ${data.Released}`;
            document.querySelector(".box-office").textContent = `Box Office: ${data.BoxOffice}`;

            // Extract Rotten Tomatoes & Metacritic ratings
            let rottenTomatoes = "N/A";
            let metacritic = "N/A";

            data.Ratings.forEach(rating => {
                if (rating.Source === "Rotten Tomatoes") {
                    rottenTomatoes = rating.Value;
                }
                if (rating.Source === "Metacritic") {
                    metacritic = rating.Value;
                }
            });

            // Set the ratings with icons
            document.querySelector(".rating-value").textContent = `${data.imdbRating}`;
            document.querySelector(".rotten-tomatoes").textContent = `${rottenTomatoes}`;
            document.querySelector(".metacritic").textContent = `${metacritic}`;
        } else {
            console.error("Movie not found:", data.Error);
            document.getElementById("movieDetails").innerHTML = "<p>Movie details unavailable.</p>";
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector(".back-btn");

    if (document.referrer) {
        backBtn.href = document.referrer; // Go back to the last visited page
    } else {
        backBtn.href = "index.html"; // Default to the home page if referrer is unavailable
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector(".back-btn");
    const movieCard = document.querySelector(".movie-card");

    backBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent immediate navigation
        movieCard.classList.add("hide"); // Apply pop-out effect

        setTimeout(() => {
            window.location.href = document.referrer || "index.html"; // Navigate after animation
        }, 400); // Match animation duration
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector(".back-btn");
    const movieCard = document.querySelector(".movie-card");

    backBtn.addEventListener("click", (event) => {
        event.preventDefault();
        sessionStorage.setItem("returningFromMovie", "true"); // Set flag before returning

        // Apply smooth fade-out and scale-down animation
        movieCard.style.transition = "opacity 0.5s ease-in-out, transform 0.5s ease-in-out";
        movieCard.style.opacity = "0";
        movieCard.style.transform = "scale(0.1) translateY(-50%)"; // Moves it upward, not downward

        setTimeout(() => {
            window.location.href = document.referrer || "index.html"; // Navigate AFTER animation completes
        }, 500); // Matches animation duration
    });
});








  