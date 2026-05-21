(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading renderer_projection.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const CONFIG = global.CONFIG;

    proto.gridToScreen = function (gx, gy) {
        const w = CONFIG.TILE_WIDTH * this.camera.zoom;
        const h = CONFIG.TILE_HEIGHT * this.camera.zoom;
        return {
            x: (((gx - gy) * (w / 2)) + this.camera.x) | 0,
            y: (((gx + gy) * (h / 2)) + this.camera.y) | 0
        };
    };

    proto.screenToGrid = function (sx, sy) {
        const w = CONFIG.TILE_WIDTH * this.camera.zoom;
        const h = CONFIG.TILE_HEIGHT * this.camera.zoom;
        const a = (sx - this.camera.x) / (w / 2);
        const b = (sy - this.camera.y) / (h / 2);
        return { gx: (a + b) / 2, gy: (b - a) / 2 };
    };

    proto.createIsoPath = function (x, y, w, h) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w / 2, y + h / 2);
        this.ctx.lineTo(x, y + h);
        this.ctx.lineTo(x - w / 2, y + h / 2);
        this.ctx.closePath();
    };
})(window);
