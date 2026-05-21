(function (global) {
    const engine = new global.IsoGameEngine();
    const checker = setInterval(() => {
        if (global.Game === "Start") {
            clearInterval(checker);
            engine.start();
        }
    }, 100);

    global.UpdateMap = s => { if (engine?.active) engine.parseMapData(s); };
})(window);
