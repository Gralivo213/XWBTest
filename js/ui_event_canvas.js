(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.attachEvents = function () {
        window.addEventListener('resize', () => {
            if (typeof this.resize === 'function') this.resize();
        });
        
        this.canvas.addEventListener('mousedown', e => {
            if (e.button === 0 && !this.chunkPlacementMode) {
                if (this.hoveredTile) {
                    const k = `${this.hoveredTile.chunkId},${this.hoveredTile.lx},${this.hoveredTile.ly}`;
                    this.checkContextualUI(k);
                }
            }
            if (e.button === 2) {
                if (this.chunkPlacementMode || this.ghostChunk) {
                    this.chunkPlacementMode = false;
                    document.body.classList.remove('hide-main-ui');
                    $('chunk-gen-popup').classList.remove('visible');
                    $('iso-chunk-btn').classList.remove('disabled-btn');
                    this.ghostChunk = null;
                }
                return;
            }
            if (e.button === 0 && this.chunkPlacementMode && this.ghostChunk && !this.ghostChunk.locked) {
                this.ghostChunk.locked = true;
                $('chunk-popup-text').textContent = `User is creating a new chunk. This means user has completed atleast 1 Main story mission of the chunk. Proccede to generate a New Chunk In the ${this.ghostChunk.cx},${this.ghostChunk.cy} of the Chunk ${this.ghostChunk.sourceId}`;
                $('chunk-gen-popup').classList.add('visible');
                return;
            }
            this.lastMouse = { x: e.clientX, y: e.clientY };
            if (!e.button) this.isDragging = true;
        });
        
        window.addEventListener('mouseup', () => this.isDragging = false);
        
        window.addEventListener('mousemove', e => {
            this.mousePos = { x: e.clientX, y: e.clientY };
            if (this.chunkPlacementMode && this.player && (!this.ghostChunk || !this.ghostChunk.locked)) {
                const mg = this.screenToGrid(e.clientX, e.clientY);
                const mx = Math.floor(mg.gx / 10), my = Math.floor(mg.gy / 10);
                let bestDist = Infinity, sourceCfg = null, sourceId = null;
                Object.entries(this.chunkConfigs).forEach(([id, cfg]) => {
                    const d = this.dist(mx, my, cfg.cx, cfg.cy);
                    if (d < bestDist) { bestDist = d; sourceCfg = cfg; sourceId = id; }
                });
                if (sourceCfg) {
                    const cx = sourceCfg.cx, cy = sourceCfg.cy;
                    const dx = mg.gx - (cx * 10 + 4.5), dy = mg.gy - (cy * 10 + 4.5);
                    let dir = '', tcx = cx, tcy = cy;
                    if (Math.abs(dx) > Math.abs(dy)) { if (dx > 0) { dir = 'East'; tcx = cx + 1; } else { dir = 'West'; tcx = cx - 1; } }
                    else { if (dy > 0) { dir = 'South'; tcy = cy + 1; } else { dir = 'North'; tcy = cy - 1; } }
                    const isOccupied = Object.values(this.chunkConfigs).some(cfg => cfg.cx === tcx && cfg.cy === tcy && !cfg.hidden);
                    if (tcx >= 1 && tcy >= 1 && tcx <= 10 && tcy <= 10 && !isOccupied) {
                        this.ghostChunk = { cx: tcx, cy: tcy, dir, sourceId, locked: false };
                    } else {
                        this.ghostChunk = null;
                    }
                }
            }
            if (this.isDragging && (!this.chunkPlacementMode || (this.ghostChunk && this.ghostChunk.locked))) {
                const dx = e.clientX - this.lastMouse.x, dy = e.clientY - this.lastMouse.y;
                this.targetCamera.x += dx; this.targetCamera.y += dy; this.camera.x += dx * 0.8; this.camera.y += dy * 0.8;
                this.lastMouse = { x: e.clientX, y: e.clientY };
                this.setMoving();
            }
        });
        
        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();
            this.targetCamera.zoom = Math.min(Math.max(this.targetCamera.zoom - e.deltaY * 0.001, 0.5), 3.0);
            this.setMoving();
        }, { passive: false });
        
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Call next event listeners setup for Settings Modal
        if (typeof this.attachSettingsEvents === 'function') {
            this.attachSettingsEvents();
        }
    };
})(window);
