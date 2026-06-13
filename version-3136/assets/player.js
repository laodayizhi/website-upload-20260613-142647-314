(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function attachPlayer(video) {
        var shell = video.closest('.player-shell');
        var button = shell ? shell.querySelector('.player-cover-button') : null;
        var source = video.getAttribute('src');
        var attached = false;
        var instance = null;

        function prepare() {
            if (!source || attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(source);
                instance.attachMedia(video);
                attached = true;
            }
        }

        function play() {
            prepare();
            if (shell) {
                shell.classList.add('is-playing');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        prepare();
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(attachPlayer);
    });
})();
