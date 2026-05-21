(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.getVisibleChunks = function (cw, ch) {
        const visibleChunks = new Set();
        const padX = global.CONFIG.TILE_WIDTH * this.camera.zoom * 2;
        const padY = global.CONFIG.TILE_HEIGHT * this.camera.zoom * 2;
        Object.entries(this.chunkConfigs).forEach(([id, cfg]) => {
            if (cfg.hidden) return;
            const cx = cfg.cx * 10, cy = cfg.cy * 10;
            const c1 = this.gridToScreen(cx, cy), c2 = this.gridToScreen(cx + 9, cy);
            const c3 = this.gridToScreen(cx, cy + 9), c4 = this.gridToScreen(cx + 9, cy + 9);
            const minX = Math.min(c1.x, c2.x, c3.x, c4.x), maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
            const minY = Math.min(c1.y, c2.y, c3.y, c4.y), maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
            if (maxX >= -padX && minX <= cw + padX && maxY >= -padY && minY <= ch + padY) {
                visibleChunks.add(+id);
            }
        });
        return visibleChunks;
    };

    proto.computeHoveredTile = function (visibleChunks, hGrid) {
        this.hoveredTile = null;
        let bestZ = -Infinity;
        visibleChunks.forEach(cid => {
            for (let lx = 1; lx <= 10; lx++) {
                for (let ly = 1; ly <= 10; ly++) {
                    const t = this.chunks[`${cid},${lx},${ly}`];
                    if (!t) continue;
                    if (Math.abs(t.gx - hGrid.gx) < 3 && Math.abs(t.gy - hGrid.gy) < 3) {
                        const pos = this.gridToScreen(t.gx, t.gy);
                        const w = global.CONFIG.TILE_WIDTH * this.camera.zoom;
                        const h = global.CONFIG.TILE_HEIGHT * this.camera.zoom;
                        this.createIsoPath(pos.x, pos.y + (t.offsetY || 0) * this.camera.zoom, w, h);
                        if (this.ctx.isPointInPath(this.mousePos.x, this.mousePos.y)) {
                            const z = t.gx + t.gy;
                            if (z > bestZ) { bestZ = z; this.hoveredTile = t; }
                        }
                    }
                }
            }
        });
    };

    proto.drawChunkBackgrounds = function (visibleChunks) {
        visibleChunks.forEach(cid => {
            const img = this.chunkImages[cid];
            if (img) {
                const cfg = this.chunkConfigs[cid];
                const basePos = this.gridToScreen(cfg.cx * 10, cfg.cy * 10);
                const scale = this.camera.zoom / 2.0;
                const drawW = img.width * scale, drawH = img.height * scale;
                const drawX = (basePos.x - (img.width / 2) * scale) | 0;
                const drawY = (basePos.y - 100 * scale) | 0;
                this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
            }
        });
    };

    proto.drawActiveChunkAnimations = function (ts) {
        if (!this.animatingChunks) return;
        Object.entries(this.animatingChunks).forEach(([idStr, startTime]) => {
            const elapsed = ts - startTime;
            if (elapsed < 1500) {
                const cfg = this.chunkConfigs[+idStr];
                if (cfg) {
                    const w = global.CONFIG.TILE_WIDTH * this.camera.zoom, h = global.CONFIG.TILE_HEIGHT * this.camera.zoom;
                    this.ctx.save();
                    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
                    this.ctx.lineWidth = 1.5 * this.camera.zoom;
                    this.ctx.globalAlpha = elapsed < 1000 ? 1 : 1 - ((elapsed - 1000) / 500);
                    for (let x = 0; x < 10; x++) {
                        for (let y = 0; y < 10; y++) {
                            const pos = this.gridToScreen(cfg.cx * 10 + x, cfg.cy * 10 + y);
                            this.createIsoPath(pos.x, pos.y, w, h); this.ctx.fill(); this.ctx.stroke();
                        }
                    }
                    this.ctx.restore();
                }
            }
        });
    };
})(window);
