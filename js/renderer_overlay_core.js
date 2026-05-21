(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.drawTileOverlay = function (t, ts, animOffsetY = 0, animOpacity = 1) {
        const c = this.ctx, cz = this.camera.zoom, pos = this.gridToScreen(t.gx, t.gy);
        const w = global.CONFIG.TILE_WIDTH * cz, h = global.CONFIG.TILE_HEIGHT * cz;
        const x = pos.x, y = pos.y + (t.offsetY || 0) * cz + animOffsetY, isLOD = cz < 0.7;
        c.globalAlpha = animOpacity;

        if (this.state === 'SENSE_ACTIVE') {
            const m = this.validMoves.find(mv => mv.key === `${t.chunkId},${t.lx},${t.ly}`);
            if (m) {
                const el = ts - this.animStartTime, d = (m.dist - 1) * 80;
                if (el > d) {
                    let a = Math.min(1, (el - d) / 400);
                    if (el > 2000) a *= Math.max(0, 1 - (el - 2000) / 1000);
                    if (a > 0) {
                        if (t.assetHidden) t.assetHidden = false;
                        if (t.qiData && t.qiData.hidden) t.qiData.hidden = false;
                        const wv = (Math.sin(el / 200) + 1) / 2; this.createIsoPath(x, y, w, h);
                        const gp = c.createRadialGradient(x, y + h / 2, 0, x, y + h / 2, w / 2);
                        gp.addColorStop(0, `rgba(251,191,36,${0.4 * a})`); gp.addColorStop(1, `rgba(251,191,36,${0.1 * a * wv})`);
                        c.fillStyle = gp; c.fill(); c.strokeStyle = `rgba(251,191,36,${0.8 * a})`; c.lineWidth = 2; c.stroke();
                    }
                }
            }
        }
        this.createIsoPath(x, y, w, h);
        if (t === this.hoveredTile) {
            c.fillStyle = global.CONFIG.COLORS.HOVER_FILL; c.fill(); c.strokeStyle = global.CONFIG.COLORS.HOVER_STROKE; c.lineWidth = 2; c.stroke();
            c.save(); c.font = `bold ${13 * cz}px var(--font-data)`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 6; c.fillText(`${t.chunkId},${t.lx},${t.ly}`, x, y + h / 2); c.restore();
        }
        if (t.assetUrl && !t.assetHidden && typeof this.drawTileAssetImage === 'function') {
            this.drawTileAssetImage(t, x, y, w, h, cz, isLOD);
        }
        if (t.assetType === 'W' && !t.assetHidden && typeof this.drawTileWater === 'function') {
            this.drawTileWater(t, x, y, w, h, ts, isLOD);
        }
        if (t.qiData && !t.qiData.hidden && typeof this.drawTileQi === 'function') {
            this.drawTileQi(t, x, y, w, h, ts, animOpacity, cz, isLOD);
        }
        c.globalAlpha = 1;
    };

    proto.drawPiece = function (gx, gy, url, col, animOffsetY = 0, animOpacity = 1) {
        const c = this.ctx, cz = this.camera.zoom, isLOD = cz < 0.7, pos = this.gridToScreen(gx, gy);
        const t = Object.values(this.chunks).find(tile => tile.gx === gx && tile.gy === gy && !this.chunkConfigs[tile.chunkId]?.hidden);
        const oy = (t?.offsetY || 0) * cz, w = global.CONFIG.TILE_WIDTH * cz, h = global.CONFIG.TILE_HEIGHT * cz, cx = pos.x, cy = pos.y + h / 2 + oy + animOffsetY;
        c.globalAlpha = animOpacity;
        c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(cx, cy, w * 0.3, h * 0.25, 0, 0, Math.PI * 2); c.fill();
        const img = global.AssetManager.getTinted(url, col, isLOD); c.save();
        const iw = img?.width || img?.naturalWidth, ih = img?.height || img?.naturalHeight;
        if (iw) {
            const isp = url === global.CONFIG.PLAYER_IMG; let ph = h * (isp ? 1.3 : 1.5), pw = ph * (iw / ih);
            if (pw > w * 0.8) { pw = w * 0.8; ph = pw * (ih / iw); }
            c.drawImage(img, cx - pw / 2, cy - ph + h * 0.4, pw, ph);
        }
        c.restore(); c.globalAlpha = 1;
    };
})(window);
