(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.drawRegionBorderForTile = function (t, ts, animOffsetY = 0, animOpacity = 1) {
        if (!this.regions.length) return;
        const el = ts - (this.regionAnimStart || 0);
        let gt = Math.min(el / 800, 1);
        if (!this.showRegions) { gt = 1 - gt; if (gt <= 0) return; } else if (gt <= 0) return;

        const cz = this.camera.zoom;
        const pos = this.gridToScreen(t.gx, t.gy);
        const w = global.CONFIG.TILE_WIDTH * cz;
        const h = global.CONFIG.TILE_HEIGHT * cz;
        const y = pos.y + (t.offsetY || 0) * cz + animOffsetY;

        this.regions.forEach(reg => {
            if (!reg.ranges) return;
            reg.ranges.forEach(range => {
                if (t.chunkId !== range.cid) return;
                const cx = (this.chunkConfigs[range.cid]?.cx || 0) * 10;
                const cy = (this.chunkConfigs[range.cid]?.cy || 0) * 10;

                const rx1 = cx + Math.min(range.lx1, range.lx2) - 1;
                const ry1 = cy + Math.min(range.ly1, range.ly2) - 1;
                const rx2 = cx + Math.max(range.lx1, range.lx2) - 1;
                const ry2 = cy + Math.max(range.ly1, range.ly2) - 1;

                if (t.gx >= rx1 && t.gx <= rx2 && t.gy >= ry1 && t.gy <= ry2) {
                    if (reg.exceptions && reg.exceptions.includes(`${range.cid},${t.lx},${t.ly}`)) return;

                    const col = reg.color || '#10b981';
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.3 * gt * animOpacity;
                    this.ctx.fillStyle = col; this.createIsoPath(pos.x, y, w, h); this.ctx.fill();

                    this.ctx.globalAlpha = 0.8 * gt * animOpacity;
                    this.ctx.strokeStyle = col; this.ctx.lineWidth = 2 * cz; this.ctx.beginPath();
                    if (t.gy === ry1) { this.ctx.moveTo(pos.x, y); this.ctx.lineTo(pos.x + w / 2, y + h / 2); }
                    if (t.gx === rx2) { this.ctx.moveTo(pos.x + w / 2, y + h / 2); this.ctx.lineTo(pos.x, y + h); }
                    if (t.gy === ry2) { this.ctx.moveTo(pos.x, y + h); this.ctx.lineTo(pos.x - w / 2, y + h / 2); }
                    if (t.gx === rx1) { this.ctx.moveTo(pos.x - w / 2, y + h / 2); this.ctx.lineTo(pos.x, y); }
                    this.ctx.stroke(); this.ctx.restore();
                }
            });
        });
    };
})(window);
