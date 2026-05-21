(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.checkContextualUI = function (forcedKey = null) {
        if (!this.player || !this.ui.herbPanel) return;
        
        // 1. Try forest check
        if (this.checkForestContextual(forcedKey)) {
            return;
        }

        // 2. Regular entity check
        this.checkEntityContextual(forcedKey);
    };
})(window);
