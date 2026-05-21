(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.loop = function (ts) {
        if (this.active) {
            this.render(ts);
            requestAnimationFrame(t => this.loop(t));
        }
    };

    proto.render = function (ts) {
        const { camera: c, targetCamera: tc } = this;
        c.x = global.lerp(c.x, tc.x, 0.15);
        c.y = global.lerp(c.y, tc.y, 0.15);
        c.zoom = global.lerp(c.zoom, tc.zoom, 0.15);
        let sx = 0, sy = 0;
        if (this.shakeIntensity > 0.1) {
            sx = (Math.random() - 0.5) * this.shakeIntensity;
            sy = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.85;
        } else { this.shakeIntensity = 0; }

        const cw = this.canvas.width, ch = this.canvas.height;
        this.ctx.clearRect(0, 0, cw, ch);
        this.drawSkyBackground(ts, cw, ch);

        this.ctx.save();
        this.ctx.translate(sx, sy);

        const unW = global.CONFIG.TILE_WIDTH, unH = global.CONFIG.TILE_HEIGHT;
        for (let i = 0; i < 100; i++) {
            const speed = 0.03 + (i % 10) / 200, phase = i % (Math.PI * 2), timeFactor = ts * speed;
            this.particleOffsets[i] = {
                rise: ((timeFactor + i * 100) % (unH * 1.5)),
                spread: Math.sin(timeFactor * 0.02 + phase) * 0.3 + (((i % unW) - unW / 2) * 0.6 / unW)
            };
        }

        const visibleChunks = this.getVisibleChunks(cw, ch);
        const hGrid = this.screenToGrid(this.mousePos.x - sx, this.mousePos.y - sy);
        
        if (typeof this.computeHoveredTile === 'function') this.computeHoveredTile(visibleChunks, hGrid);
        if (typeof this.drawChunkBackgrounds === 'function') this.drawChunkBackgrounds(visibleChunks);

        let q = [];
        if (typeof this.collectRenderQueue === 'function') q = this.collectRenderQueue(visibleChunks, ts);

        this.drawActiveChunkAnimations(ts);
        if (typeof this.renderQueueItems === 'function') this.renderQueueItems(q, ts);

        this.drawRegions(ts);
        this.drawGhostChunkPreview();

        if (this.timeOfDay === 'Night') {
            this.ctx.save(); this.ctx.fillStyle = 'rgba(10, 15, 35, 0.35)';
            this.ctx.fillRect(-cw, -ch, cw * 3, ch * 3); this.ctx.restore();
        }
        this.drawSolarSystem(ts);
        this.ctx.restore();
    };

    proto.drawGhostChunkPreview = function () {
        if (!this.ghostChunk) return;
        const c = this.camera;
        const { cx, cy } = this.ghostChunk;
        const w = global.CONFIG.TILE_WIDTH * c.zoom;
        const h = global.CONFIG.TILE_HEIGHT * c.zoom;
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
        this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        this.ctx.lineWidth = 1.5 * c.zoom;
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const pos = this.gridToScreen(cx * 10 + x, cy * 10 + y);
                this.createIsoPath(pos.x, pos.y, w, h);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
        const cp = this.gridToScreen(cx * 10 + 4.5, cy * 10 + 4.5);
        Object.assign(this.ctx, {
            fillStyle: '#fff',
            font: `bold ${32 * c.zoom}px var(--font-title)`,
            textAlign: 'center',
            textBaseline: 'middle',
            shadowColor: 'rgba(0,0,0,0.9)',
            shadowBlur: 10
        });
        this.ctx.fillText(`${cx},${cy}`, cp.x, cp.y);
        this.ctx.restore();
    };
})(window);
