(function (global) {
    const IsoGameEngine = global.IsoGameEngine;
    Object.assign(IsoGameEngine.prototype, {
        parseStructures(data) {
            this.wallStructures.forEach(wRange => {
                const getGlobal = (s) => {
                    const [cid, lx, ly] = s.trim().split(',').map(Number);
                    const cfg = this.chunkConfigs[cid];
                    return cfg ? { gx: (cfg.cx * 10) + lx - 1, gy: (cfg.cy * 10) + ly - 1 } : null;
                };
                const parts = wRange.range.split('-');
                const start = getGlobal(parts[0]), end = getGlobal(parts[1]);
                if (start && end) {
                    const minGX = Math.min(start.gx, end.gx), maxGX = Math.max(start.gx, end.gx);
                    const minGY = Math.min(start.gy, end.gy), maxGY = Math.max(start.gy, end.gy);
                    Object.entries(this.chunkConfigs).forEach(([cidStr, cfg]) => {
                        const cid = +cidStr, cMinX = cfg.cx * 10, cMaxX = cMinX + 9, cMinY = cfg.cy * 10, cMaxY = cMinY + 9;
                        if (cMaxX >= minGX && cMinX <= maxGX && cMaxY >= minGY && cMinY <= maxGY) {
                            for (let gx = Math.max(minGX, cMinX); gx <= Math.min(maxGX, cMaxX); gx++) {
                                for (let gy = Math.max(minGY, cMinY); gy <= Math.min(maxGY, cMaxY); gy++) {
                                    if (gx === minGX || gx === maxGX || gy === minGY || gy === maxGY) {
                                        const lx = gx - cMinX + 1, ly = gy - cMinY + 1, wk = `${cid},${lx},${ly}`, tile = this.getTile(cid, lx, ly);
                                        if (tile) {
                                            if ((gx === minGX || gx === maxGX) && (gy === minGY || gy === maxGY)) {
                                                tile.assetUrl = global.CONFIG.ASSETS.CityTower; tile.assetType = 'CityTower';
                                                if (!this.towerStructures[wk]) this.towerStructures[wk] = { hp: "10000/10000", condition: "Sturdy", quality: wRange.quality || "Polished Granite" };
                                            } else {
                                                tile.assetUrl = global.CONFIG.ASSETS.CityWall; tile.assetType = 'CityWall';
                                                tile.wallOrientation = (gy === minGY || gy === maxGY) ? 'H' : 'V';
                                                if (!this.specificWalls[wk]) this.specificWalls[wk] = { condition: wRange.condition || "Sturdy", quality: wRange.quality || "Polished Granite", hp: wRange.hp || "5000/5000", direction: wRange.direction || "N" };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            });
            [['specificWalls', 'CityWall'], ['towerStructures', 'CityTower']].forEach(([storeName, assetKey]) => {
                Object.keys(this[storeName]).forEach(k => {
                    const [c, x, y] = k.split(',').map(Number);
                    const t = this.getTile(c, x, y);
                    if (t) { t.assetUrl = global.CONFIG.ASSETS[assetKey]; t.assetType = assetKey; }
                });
            });
            Object.entries(this.gateStructures).forEach(([k, gData]) => {
                const [c, x, y] = k.split(',').map(Number);
                const isV = gData.direction === 'E' || gData.direction === 'W';
                const setGate = (t, part) => {
                    if (t) {
                        t.assetUrl = global.CONFIG.ASSETS.CityGate; t.assetType = 'CityGate';
                        t[`isGatePart${part}`] = true; t.wallOrientation = isV ? 'V' : 'H';
                    }
                };
                setGate(this.getTile(c, x, y), 1);
                const t2 = isV ? this.getTile(c, x, y + 1) : this.getTile(c, x + 1, y);
                setGate(t2, 2);
                if (t2) this.gateStructures[isV ? `${c},${x},${y + 1}` : `${c},${x + 1},${y}`] = gData;
            });
        }
    });
})(window);
