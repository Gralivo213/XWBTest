(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading engine_chunk.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;

    proto.generateChunk = function (id, cx, cy) {
        this.chunkConfigs[id] = { ...this.chunkConfigs[id], cx, cy };
        if (!window.PersistentVisualCache) {
            try {
                const raw = sessionStorage.getItem('PersistentVisualCache');
                window.PersistentVisualCache = raw ? JSON.parse(raw) : null;
            } catch (e) {}
            if (!window.PersistentVisualCache) {
                window.PersistentVisualCache = { offsetY: {}, tileAssets: {}, mineralAssets: {} };
            }
        }
        let cacheDirty = false;
        for (let y = 0; y < global.CONFIG.CHUNK_SIZE; y++) {
            for (let x = 0; x < global.CONFIG.CHUNK_SIZE; x++) {
                const lx = x + 1, ly = y + 1;
                const k = `${id},${lx},${ly}`;
                if (!this.chunks[k]) {
                    if (window.PersistentVisualCache.offsetY[k] === undefined) {
                        const r = Math.random();
                        window.PersistentVisualCache.offsetY[k] = r < 0.33 ? -2 : r < 0.66 ? 2 : 0;
                        cacheDirty = true;
                    }
                    const offsetY = window.PersistentVisualCache.offsetY[k];
                    const gx = cx * global.CONFIG.CHUNK_SIZE + x, gy = cy * global.CONFIG.CHUNK_SIZE + y;
                    this.chunks[k] = { gx, gy, lx, ly, chunkId: id, assetUrl: null, assetType: null, assetHidden: false, offsetY: offsetY };
                }
            }
        }
        if (cacheDirty) {
            try {
                sessionStorage.setItem('PersistentVisualCache', JSON.stringify(window.PersistentVisualCache));
            } catch (e) {}
        }
    };

    proto.flattenChunk = function (cid) {
        const z = 2.0;
        const w = global.CONFIG.TILE_WIDTH * z, h = global.CONFIG.TILE_HEIGHT * z, th = global.CONFIG.TILE_THICKNESS * z;

        const cvs = document.createElement('canvas');
        cvs.width = 10 * w + (20 * z);
        cvs.height = 10 * h + th + (100 * z);
        const ctx = cvs.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = false;

        const originX = cvs.width / 2;
        const originY = 50 * z;

        const cfg = this.chunkConfigs[cid];
        let hbg = cfg && ['G1', 'G2', 'G3', 'G4', 'DT1', 'DT2', 'DT3', 'DT4', 'F1', 'F2', 'F3', 'F4', 'S1', 'S2', 'S3', 'S4', 'MT1', 'MT2', 'MT3', 'MT4', 'CityT1', 'ForestT1', 'ForestT2'].includes(cfg.type);

        let img = null, iw = 0, ih = 0;
        if (hbg) {
            const prefix = cfg.type.startsWith('City') ? 'CityT' : (cfg.type.startsWith('DT') ? 'DustyT' : (cfg.type.startsWith('MT') ? 'MagmaT' : (cfg.type.startsWith('F') ? 'FrostT' : (cfg.type.startsWith('S') ? 'SandT' : (cfg.type.startsWith('ForestT') ? 'ForestT' : 'GrassT')))));
            const imgUrl = `${global.CONFIG.IMG_BASE}${prefix}${cfg.type.charAt(cfg.type.length - 1)}.png`;
            img = global.AssetManager.get(imgUrl, false);
            iw = img?.width || img?.naturalWidth; ih = img?.height || img?.naturalHeight;
            if (!img) {
                global.AssetManager.whenReady(imgUrl, () => this.flattenChunk(cid));
                hbg = false;
            }
        }

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const t = this.getTile(cid, x + 1, y + 1);
                if (!t) continue;
                const px = Math.round(originX + (x - y) * (w / 2));
                const py = Math.round(originY + (x + y) * (h / 2) + (t.offsetY || 0) * z);

                if (!hbg && this.tileCache) {
                    const padX = 2 * z, padY = 2 * z;
                    ctx.drawImage(this.tileCache, px - w / 2 - padX, py - padY, w + padX * 2, h + th + padY * 2);
                } else if (hbg && img && iw) {
                    ctx.save(); ctx.translate(px, py);

                    ctx.fillStyle = global.CONFIG.COLORS.SIDE_LEFT_LIGHT; ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, h); ctx.lineTo(0, h + th); ctx.lineTo(-w / 2, h / 2 + th); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = global.CONFIG.COLORS.SIDE_RIGHT_LIGHT; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w / 2, h / 2); ctx.lineTo(w / 2, h / 2 + th); ctx.lineTo(0, h + th); ctx.closePath(); ctx.fill();

                    ctx.fillStyle = global.CONFIG.COLORS.TOP_DARK;
                    ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, 0); ctx.lineTo(w / 2, h / 2); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

                    ctx.save(); ctx.clip(new Path2D(`M 0 0 L ${w / 2} ${h / 2} L 0 ${h} L ${-w / 2} ${h / 2} Z`));
                    ctx.translate(0, h / 2); ctx.scale(1, 0.5); ctx.rotate(Math.PI / 4);
                    const sx = x / 10 * iw, sy = y / 10 * ih, sw = iw / 10, sh = ih / 10, s = w / Math.sqrt(2);
                    ctx.drawImage(img, sx, sy, sw, sh, -s / 2 - 1, -s / 2 - 1, s + 2, s + 2);
                    ctx.restore();

                    ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, 0); ctx.lineTo(w / 2, h / 2); ctx.lineTo(0, h); ctx.closePath();
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = z / 2; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, 0); ctx.lineTo(w / 2, h / 2);
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = z / 2; ctx.stroke();

                    ctx.restore();
                }
            }
        }
        this.chunkImages[cid] = cvs;
    };
})(window);
