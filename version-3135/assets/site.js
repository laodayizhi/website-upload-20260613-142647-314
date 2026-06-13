(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      mobilePanel.hidden = !isOpen;
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-overlay");
    var stream = player.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function showButton() {
      if (button) {
        button.hidden = false;
      }
      player.classList.remove("is-playing");
    }

    function hideButton() {
      if (button) {
        button.hidden = true;
      }
      player.classList.add("is-playing");
    }

    function playVideo() {
      loadStream();
      hideButton();
      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          showButton();
        });
      }
    }

    if (button && video) {
      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", hideButton);
      video.addEventListener("pause", function () {
        if (!video.ended) {
          showButton();
        }
      });
      video.addEventListener("ended", showButton);
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });

  var searchInput = document.querySelector("[data-search-input]");
  var searchStatus = document.querySelector("[data-search-status]");
  var searchResults = document.querySelector("[data-search-results]");
  var searchForm = document.querySelector("[data-search-form]");

  if (searchInput && searchStatus && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge" aria-hidden="true">▶</span>',
        '    <span class="type-badge">' + escapeHtml(movie.category) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.text) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function runSearch(query) {
      var normalized = query.trim().toLowerCase();

      if (!normalized) {
        searchStatus.textContent = "输入关键词开始搜索。";
        searchResults.innerHTML = "";
        return;
      }

      var words = normalized.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.type,
          movie.region,
          movie.category,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.text
        ].join(" ").toLowerCase();

        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      searchStatus.textContent = "找到 " + matched.length + " 个匹配影片。";
      searchResults.innerHTML = matched.map(card).join("");
    }

    searchInput.addEventListener("input", function () {
      runSearch(searchInput.value);
    });

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = searchInput.value.trim();
        var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        window.history.replaceState(null, "", url);
        runSearch(query);
      });
    }

    runSearch(initialQuery);
  }
})();
