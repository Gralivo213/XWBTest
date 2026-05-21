(function (global) {
    const IsoGameEngine = global.IsoGameEngine;
    Object.assign(IsoGameEngine.prototype, {
        parseEntities(data) {
            if (data.entities) {
                this.herbData = data.entities.herbData || {}; this.treeData = data.entities.treeData || {};
                this.guData = data.entities.guData || {}; this.mineralData = data.entities.mineralData || {};
                this.springData = data.entities.springData || {}; this.soilData = data.entities.soilData || {};
                this.npcs = data.entities.npcs || {}; this.qiTileData = data.entities.qiTileData || {};
                this.forestData = data.entities.forestData || {};
            }
            [[this.herbData, 'H', global.CONFIG.ASSETS.H], [this.treeData, 'T', global.CONFIG.ASSETS.T]].forEach(([d, ty, arr]) => {
                Object.entries(d).forEach(([k, v]) => {
                    const [c, x, y] = k.split(',').map(Number);
                    this.updateTileAsset(c, x, y, arr, ty, v.hidden, v.color);
                });
            });
            const entConfig = [
                [this.guData, 'G', v => `${global.CONFIG.IMG_BASE}${v.type}.png`],
                [this.mineralData, 'MI', (v, key) => {
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
                    if (!window.PersistentVisualCache.mineralAssets[key]) {
                        window.PersistentVisualCache.mineralAssets[key] = `${global.CONFIG.IMG_BASE}MI${Math.floor(Math.random() * 9) + 1}.png`;
                        cacheDirty = true;
                    }
                    if (cacheDirty) {
                        try {
                            sessionStorage.setItem('PersistentVisualCache', JSON.stringify(window.PersistentVisualCache));
                        } catch (e) {}
                    }
                    return window.PersistentVisualCache.mineralAssets[key];
                }],
                [this.springData, 'W', null], [this.soilData, 'S', null]
            ];
            entConfig.forEach(([d, ty, uFn]) => {
                Object.entries(d).forEach(([k, v]) => {
                    const [c, x, y] = k.split(',').map(Number); const t = this.getTile(c, x, y);
                    if (t) {
                        if (uFn && !t.assetUrl) { t.assetUrl = uFn(v, k); global.AssetManager.load(t.assetUrl); }
                        t.assetType = ty; t.assetHidden = v.hidden; t.assetColor = v.color;
                    }
                });
            });
            if (this.forestData) {
                Object.entries(this.forestData).forEach(([k, v]) => {
                    const [c, x, y] = k.split(',').map(Number); const tFront = this.getTile(c, x, y);
                    if (tFront) {
                        tFront.assetUrl = global.CONFIG.IMG_BASE + 'Forest.png'; tFront.assetType = 'Forest';
                        tFront.assetHidden = v.hidden || false; tFront.assetColor = v.color || null;
                        global.AssetManager.load(tFront.assetUrl);
                    }
                    const tBack = this.getTile(c, x - 1, y);
                    if (tBack) { tBack.isForestBackTile = true; tBack.forestBaseKey = k; }
                });
            }
            Object.values(this.npcs).forEach(d => {
                const url = global.CONFIG.getNPCAsset(d.type, d.stage, d.name);
                if (url) global.AssetManager.load(url);
            });
            Object.entries(this.qiTileData).forEach(([k, v]) => {
                const [c, x, y] = k.split(',').map(Number); const t = this.getTile(c, x, y); if (t) t.qiData = v;
            });
        },
        parsePlayerPositionAndCamera(data) {
            if (this.player) {
                global.AssetManager.get(global.CONFIG.PLAYER_IMG);
                let cid = this.player.chunkId, lx = this.player.lx, ly = this.player.ly;
                if (this.player.tilePath && this.player.tilePath.includes('|')) {
                    let parts = this.player.tilePath.split('|').map(s => s.trim());
                    [cid, lx, ly] = parts[parts.length - 1].split(',').map(Number);
                }
                const cfg = this.chunkConfigs[cid];
                if (cfg) {
                    const sc = this.gridToScreen(cfg.cx * 10 + lx - 1, cfg.cy * 10 + ly - 1);
                    this.targetCamera.x = window.innerWidth / 2 - sc.x + this.camera.x;
                    this.targetCamera.y = window.innerHeight / 2 - sc.y + this.camera.y;
                }
            }
        },
        updateTileAsset(cid, lx, ly, l, ty, h = false, col = null) {
            const t = this.getTile(cid, lx, ly);
            if (t && !t.assetUrl) {
                if (!window.PersistentVisualCache) {
                    try {
                        const raw = sessionStorage.getItem('PersistentVisualCache');
                        window.PersistentVisualCache = raw ? JSON.parse(raw) : null;
                    } catch (e) {}
                    if (!window.PersistentVisualCache) {
                        window.PersistentVisualCache = { offsetY: {}, tileAssets: {}, mineralAssets: {} };
                    }
                }
                const k = `${cid},${lx},${ly}`;
                let cacheDirty = false;
                if (!window.PersistentVisualCache.tileAssets[k]) {
                    window.PersistentVisualCache.tileAssets[k] = l[Math.floor(Math.random() * l.length)];
                    cacheDirty = true;
                }
                t.assetUrl = window.PersistentVisualCache.tileAssets[k]; t.assetType = ty;
                t.assetHidden = h; t.assetColor = col; global.AssetManager.get(t.assetUrl);
                if (cacheDirty) {
                    try {
                        sessionStorage.setItem('PersistentVisualCache', JSON.stringify(window.PersistentVisualCache));
                    } catch (e) {}
                }
            }
        }
    });
    Object.defineProperty(IsoGameEngine.prototype, 'entityDataSources', {
        get: function () {
            return [
                ['H', this.herbData], ['T', this.treeData], ['W', this.springData], ['S', this.soilData],
                ['G', this.guData], ['MI', this.mineralData], ['B', this.npcs], ['Forest', this.forestData]
            ];
        },
        configurable: true
    });
})(window);
