function bindMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);

  if (!video || !source) {
    return;
  }

  var started = false;
  var hls = null;

  function playVideo() {
    var playAction = video.play();

    if (playAction && typeof playAction.catch === "function") {
      playAction.catch(function() {});
    }
  }

  function start() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (started) {
      playVideo();
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      playVideo();
      return;
    }

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          video.src = source;
          video.load();
          playVideo();
        }
      });
      return;
    }

    video.src = source;
    video.load();
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function() {
    if (!started) {
      start();
    }
  });
}

(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function() {
      var isOpen = panel.hasAttribute("hidden") === false;
      if (isOpen) {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setupSearchRedirects() {
    var forms = document.querySelectorAll(".search-redirect");

    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var previous = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(activeIndex + 1);
      }, 5600);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        schedule();
      });
    });

    if (previous) {
      previous.addEventListener("click", function() {
        show(activeIndex - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(activeIndex + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function setupLocalFilters() {
    var input = document.querySelector(".local-filter-input");
    var select = document.querySelector(".local-filter-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));

    if (!cards.length || (!input && !select)) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";

      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function movieCardHTML(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function(tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-poster-link\" href=\"" + escapeAttribute(movie.link) + "\" aria-label=\"" + escapeAttribute(movie.title) + "\">",
      "<img class=\"movie-cover\" src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"movie-badge\">" + escapeHTML(movie.year) + "</span>",
      "<span class=\"movie-playmark\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h3 class=\"movie-card-title\"><a href=\"" + escapeAttribute(movie.link) + "\">" + escapeHTML(movie.title) + "</a></h3>",
      "<p class=\"movie-card-line\">" + escapeHTML(movie.oneLine) + "</p>",
      "<div class=\"movie-tags\">" + tags + "</div>",
      "<p class=\"movie-card-meta\">" + escapeHTML(movie.region) + " · " + escapeHTML(movie.type) + "</p>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");

    if (!results || !Array.isArray(window.SEARCH_DATA)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector(".search-page-input");

    if (input) {
      input.value = query;
    }

    if (!query) {
      results.innerHTML = "";
      return;
    }

    var lowered = query.toLowerCase();
    var matched = window.SEARCH_DATA.filter(function(movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();
      return text.indexOf(lowered) !== -1;
    }).slice(0, 160);

    results.innerHTML = matched.map(movieCardHTML).join("");
  }

  ready(function() {
    setupMobileMenu();
    setupSearchRedirects();
    setupHeroCarousel();
    setupLocalFilters();
    setupSearchPage();
  });
})();
