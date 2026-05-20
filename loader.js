(function () {
    var BASE = 'https://cdn.jsdelivr.net/gh/Gralivo213/XWBTest@master/';

    function loadCSS(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('Failed to load: ' + src)); };
            document.head.appendChild(s);
        });
    }

    loadCSS(BASE + 'style.css');

    loadScript(BASE + 'config.js')
        .then(function () { return loadScript(BASE + 'asset_manager.js'); })
        .then(function () { return loadScript(BASE + 'engine.js'); })
        .then(function () { return loadScript(BASE + 'renderer.js'); })
        .then(function () { return loadScript(BASE + 'ui.js'); })
        .then(function () { return loadScript(BASE + '18.js'); })
        .catch(function (err) { console.error('[Loader] Bootstrap failed:', err); });
})();
