(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", () => {
      const open = mobilePanel.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));

  if (slides.length > 1) {
    let current = 0;

    const activate = (index) => {
      current = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => activate(index));
    });

    window.setInterval(() => {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  const searchInput = document.querySelector("#searchInput");
  const searchState = document.querySelector("#searchState");
  const searchableCards = Array.from(document.querySelectorAll("[data-search-text]"));

  if (searchInput && searchableCards.length) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    const updateSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;

      searchableCards.forEach((card) => {
        const matched = !query || card.getAttribute("data-search-text").includes(query);
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (searchState) {
        searchState.textContent = query ? `筛选结果：${visible} 部影片` : "输入片名、类型、地区或关键词即可筛选影片";
      }
    };

    searchInput.addEventListener("input", updateSearch);
    updateSearch();
  }

  const filterInput = document.querySelector("#filterInput");
  const filterCards = Array.from(document.querySelectorAll("[data-filter-text]"));

  if (filterInput && filterCards.length) {
    filterInput.addEventListener("input", () => {
      const query = filterInput.value.trim().toLowerCase();
      filterCards.forEach((card) => {
        const matched = !query || card.getAttribute("data-filter-text").includes(query);
        card.classList.toggle("is-hidden", !matched);
      });
    });
  }
})();
