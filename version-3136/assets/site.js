(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = !panel.hasAttribute('hidden');
            if (isOpen) {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                activate(index);
                start();
            });
        });
        start();
    }

    function setupFiltering() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));
        if (!grids.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';
        var input = document.querySelector('.search-page-input') || document.querySelector('.inline-filter');
        var typeFilter = document.querySelector('.type-filter');
        var sortFilter = document.querySelector('.sort-filter');
        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }
        function apply() {
            var query = normalize(input ? input.value : '');
            var typeValue = normalize(typeFilter ? typeFilter.value : '');
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-movie-card'));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.category,
                        card.dataset.tags
                    ].join(' '));
                    var cardType = normalize(card.dataset.type);
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    card.classList.toggle('is-hidden', !(matchQuery && matchType));
                });
                sortCards(grid);
            });
        }
        function sortCards(grid) {
            var mode = sortFilter ? sortFilter.value : 'default';
            if (mode === 'default') {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-movie-card'));
            cards.sort(function (a, b) {
                if (mode === 'year') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (mode === 'views') {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }
                return 0;
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        [input, typeFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
