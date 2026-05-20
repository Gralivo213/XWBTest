(function (global) {
    class IsoGameEngine {
        constructor() {
            Object.assign(this, {
                active: false, canvas: null, ctx: null, camera: { x: 0, y: 0, zoom: 1 }, targetCamera: { x: 0, y: 0, zoom: 1 },
                isDragging: false, lastMouse: { x: 0, y: 0 }, mousePos: { x: 0, y: 0 }, chunks: {}, chunkConfigs: {},
                player: { chunkId: 1, lx: 0, ly: 0 }, state: 'IDLE', validMoves: [], animStartTime: 0,
                npcs: {}, regions: [], showRegions: false, regionAnimStart: -10000,
                wallStructures: [], specificWalls: {}, towerStructures: {}, gateStructures: {},
                stamina: 100, maxStamina: 100, health: 100, maxHealth: 100, qi: 100, maxQi: 100, mood: 100, maxMood: 100, sanity: 100, maxSanity: 100, stats: { qiControl: 0, stealth: 0, dexterity: 0 },
                ui: { popup: null, popupText: null, regionBtn: null, missionBtn: null, missionPanel: null },
                missions: { main: {}, side: {} }, skills: { active: [], passive: [] }, craftRecipes: [],
                chunkPlacementMode: false, ghostChunk: null, shakeIntensity: 0, actionActive: false, lastUIKey: null, lastActionState: false,
                inventory: Array(24).fill(null), equipment: { head: null, torso: null, legs: null, weapon: null, accessory: null, feet: null },
                time: { day: '--', month: '--', year: '----' }, lastTime: 0, cultivationState: 'IDLE', dantianProgress: 0, realm: 'Unknown', lifespan: 100,
                currentEntityIndex: 0, currentTileEntities: [], lastEntityIndex: -1, viewingSenseResults: false,
                isMovingTimeout: null, particleOffsets: Array(100).fill({ rise: 0, spread: 0 }),
                chunkImages: {}, debugSelection: null, debugParams: { scale: 1, ox: 0, oy: 0, rot: 0, flip: false },
                relations: [], playerName: "Wandering Cultivator"
            });
            ['herb', 'tree', 'spring', 'soil', 'gu', 'mineral', 'qiTile'].forEach(k => this[`${k}Data`] = {});
            this.dist = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }

        getTile(cid, lx, ly) { return this.chunks[`${cid},${lx},${ly}`]; }

        setMoving() {
            document.body.classList.add('is-moving');
            clearTimeout(this.isMovingTimeout);
            this.isMovingTimeout = setTimeout(() => document.body.classList.remove('is-moving'), 100);
        }

        start() {
            if (this.active) return;
            this.active = true;
            this.createCanvas(); this.createUI(); this.buildTileCache();
            this.camera.x = this.targetCamera.x = window.innerWidth / 2;
            this.camera.y = this.targetCamera.y = window.innerHeight / 3;
            this.attachEvents(); this.loop(performance.now());
            console.log("IsoGameEngine: Engine Core Started");
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            Object.assign(this.canvas.style, { display: 'block', position: 'absolute', top: '0', left: '0', zIndex: '0', background: '#000' });
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            this.ctx.imageSmoothingEnabled = false;
            this.resize();
        }

        buildTileCache() {
            const z = 3.0, w = global.CONFIG.TILE_WIDTH * z, h = global.CONFIG.TILE_HEIGHT * z, th = global.CONFIG.TILE_THICKNESS * z;
            this.tileCache = document.createElement('canvas');
            const padX = 2 * z, padY = 2 * z;
            this.tileCache.width = w + (padX * 2); this.tileCache.height = h + th + (padY * 2);
            const c = this.tileCache.getContext('2d', { alpha: true });

            const createGrad = (y1, y2, c1, c2) => {
                let g = c.createLinearGradient(0, y1, 0, y2); g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
            };

            const leftMat = createGrad(h / 2, h + th, global.CONFIG.COLORS.SIDE_LEFT_LIGHT, global.CONFIG.COLORS.SIDE_LEFT_DARK);
            const rightMat = createGrad(h / 2, h + th, global.CONFIG.COLORS.SIDE_RIGHT_LIGHT, global.CONFIG.COLORS.SIDE_RIGHT_DARK);
            const topMat = createGrad(0, h, global.CONFIG.COLORS.TOP_LIGHT, global.CONFIG.COLORS.TOP_DARK);

            c.translate(w / 2 + padX, padY); c.strokeStyle = global.CONFIG.COLORS.BORDER; c.lineWidth = 1;

            const drawPoly = (fill, pts, strokeOpts = null) => {
                c.fillStyle = fill; c.beginPath(); c.moveTo(pts[0], pts[1]);
                for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
                c.closePath(); c.fill();
                if (strokeOpts) { c.strokeStyle = strokeOpts.c || c.strokeStyle; c.lineWidth = strokeOpts.w || 1; } c.stroke();
            };

            drawPoly(leftMat, [-w / 2, h / 2, 0, h, 0, h + th, -w / 2, h / 2 + th]);
            drawPoly(rightMat, [0, h, w / 2, h / 2, w / 2, h / 2 + th, 0, h + th]);
            drawPoly(topMat, [-w / 2, h / 2, 0, 0, w / 2, h / 2, 0, h], { c: 'rgba(0,0,0,0.5)', w: 1.5 });

            c.beginPath(); c.moveTo(-w / 2, h / 2); c.lineTo(0, 0); c.lineTo(w / 2, h / 2);
            c.strokeStyle = 'rgba(255,255,255,0.3)'; c.stroke();
        }

        parseHiddenMarkers(data) {
            let currentlyHidden = false;
            
            const markRecursiveHidden = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(item => {
                        if (item && typeof item === 'object') {
                            item.hidden = true;
                            markRecursiveHidden(item);
                        }
                    });
                } else if (obj && typeof obj === 'object') {
                    obj.hidden = true;
                    Object.values(obj).forEach(val => {
                        if (val && typeof val === 'object') {
                            val.hidden = true;
                            markRecursiveHidden(val);
                        }
                    });
                }
            };

            const cleanedRoot = {};
            Object.entries(data).forEach(([key, val]) => {
                let k = key;
                if (k.includes('{{<H>')) {
                    currentlyHidden = true;
                    k = k.replace('{{<H>', '');
                }
                if (currentlyHidden && val && typeof val === 'object') {
                    markRecursiveHidden(val);
                }
                if (k.includes('</H>}}')) {
                    currentlyHidden = false;
                    k = k.replace('</H>}}', '');
                }
                cleanedRoot[k] = val;
            });
            
            Object.keys(data).forEach(k => delete data[k]);
            Object.assign(data, cleanedRoot);

            if (data.chunks) {
                const cleanedChunks = {};
                let chunkHidden = false;
                Object.entries(data.chunks).forEach(([key, val]) => {
                    let k = key;
                    if (k.includes('{{<H>')) {
                        chunkHidden = true;
                        k = k.replace('{{<H>', '');
                    }
                    if (chunkHidden || val.hidden) {
                        val.hidden = true;
                    }
                    if (k.includes('</H>}}')) {
                        chunkHidden = false;
                        k = k.replace('</H>}}', '');
                    }
                    cleanedChunks[k] = val;
                });
                data.chunks = cleanedChunks;
            }

            if (data.entities) {
                ['herbData', 'treeData', 'npcs', 'qiTileData', 'mineralData', 'guData', 'springData', 'soilData', 'forestData'].forEach(field => {
                    if (data.entities[field]) {
                        const cleaned = {};
                        let fieldHidden = false;
                        Object.entries(data.entities[field]).forEach(([key, val]) => {
                            let k = key;
                            if (k.includes('{{<H>')) {
                                fieldHidden = true;
                                k = k.replace('{{<H>', '');
                            }
                            if (fieldHidden || val.hidden) {
                                val.hidden = true;
                            }
                            if (k.includes('</H>}}')) {
                                fieldHidden = false;
                                k = k.replace('</H>}}', '');
                            }
                            cleaned[k] = val;
                        });
                        data.entities[field] = cleaned;
                    }
                });
            }
        }

        parseMapData(jsonString) {
            try {
                let data;
                try {
                    data = JSON.parse(jsonString);
                } catch (pe) {
                    console.warn("JSON parse failed, attempting fallback cleanup of hidden markers", pe);
                    let cleanStr = jsonString;
                    cleanStr = cleanStr.replace(/\{\{<H>\}\}/g, '');
                    cleanStr = cleanStr.replace(/\{\{<\/H>\}\}/g, '');
                    cleanStr = cleanStr.replace(/<\/H>\}\}/g, '');
                    cleanStr = cleanStr.replace(/\{\{<H>/g, '');
                    data = JSON.parse(cleanStr);
                }

                this.parseHiddenMarkers(data);

                this.inventory = Array(24).fill(null);
                this.missions = { main: {}, side: {} };
                this.craftRecipes = [];
                this.skills = { active: [], passive: [] };
                this.wallStructures = data.wallStructures || [];
                this.specificWalls = data.specificWalls || {};
                this.chunks = {};
                this.chunkConfigs = {};
                this.activeChunkId = 1;
                this.isDragging = false;
                this.dragStart = { x: 0, y: 0 };
                ['herb', 'tree', 'spring', 'soil', 'gu', 'mineral', 'qiTile', 'forest'].forEach(k => this[`${k}Data`] = {});

                if (data.player) {
                    this.player = data.player;
                    if (data.player.name) {
                        this.playerName = data.player.name;
                        const pNameEl = global.$('profile-p-name');
                        if (pNameEl) pNameEl.innerHTML = `<strong>Name:</strong> ${this.playerName}`;
                    }
                }
                if (data.relations) this.relations = data.relations;
                if (data.time) {
                    this.time = data.time;
                    this.timeOfDay = data.time.cycle || 'Day';
                    this.updateClockUI();
                }
                if (data.dantianProgress !== undefined) {
                    this.dantianProgress = data.dantianProgress;
                    this.updateDantianUI();
                }
                if (data.realm) {
                    this.realm = data.realm;
                    this.updateRealmUI();
                }
                if (data.lifespan) {
                    this.lifespan = data.lifespan;
                    const lsEl = global.$('iso-lifespan-val');
                    if (lsEl) lsEl.textContent = this.lifespan + ' Years';
                }

                if (data.stats) {
                    const s = data.stats;
                    this.health = s.health || 100; this.maxHealth = s.maxHealth || 100;
                    this.stamina = s.will || 100; this.maxStamina = s.maxWill || 100;
                    this.qi = s.qi || 100; this.maxQi = s.maxQi || 100;
                    this.mood = s.mood || 100; this.maxMood = s.maxMood || 100;
                    this.sanity = s.sanity || 100; this.maxSanity = s.maxSanity || 100;

                    const srt = global.$('iso-spirit-root-text');
                    if (srt) srt.textContent = s.spiritRoot || '';

                    const uiStats = { ...s };
                    ['health', 'maxHealth', 'will', 'maxWill', 'qi', 'maxQi', 'mood', 'maxMood', 'sanity', 'maxSanity', 'spiritRoot'].forEach(k => delete uiStats[k]);

                    this.updateStatsUI(uiStats);
                    this.updateStatusUI();
                }

                if (data.inventory) {
                    data.inventory.forEach((item, i) => { if (i < 24) this.inventory[i] = item; });
                    this.updateInventoryUI();
                }
                if (data.craftRecipes) this.craftRecipes = data.craftRecipes;
                if (data.skills) this.skills = data.skills;
                if (data.missions) {
                    this.missions = data.missions;
                    this.updateMissionUI();
                }
                if (data.regions) this.regions = data.regions;

                if (data.access) {
                    const btn = global.$('iso-chunk-btn');
                    if (btn) btn.style.display = data.access.chunkGen ? 'flex' : 'none';
                }

                let currentMax = 0;
                let prevMaxChunk = parseInt(localStorage.getItem('iso_max_chunk')) || 0;
                if (!this.animatingChunks) this.animatingChunks = {};
                let fid = null;

                const getChunkPrefix = type => type.startsWith('City') ? 'CityT' : (type.startsWith('DT') ? 'DustyT' : (type.startsWith('MT') ? 'MagmaT' : (type.startsWith('F') ? 'FrostT' : (type.startsWith('S') ? 'SandT' : (type.startsWith('ForestT') ? 'ForestT' : 'GrassT')))));

                if (data.chunks) {
                    Object.entries(data.chunks).forEach(([idStr, cfg]) => {
                        const id = +idStr;
                        currentMax = Math.max(currentMax, id);
                        this.generateChunk(id, cfg.cx, cfg.cy);
                        this.chunkConfigs[id] = { ...this.chunkConfigs[id], cx: cfg.cx, cy: cfg.cy, type: cfg.type, hidden: cfg.hidden || false };
                        if (['G1', 'G2', 'G3', 'G4', 'DT1', 'DT2', 'DT3', 'DT4', 'F1', 'F2', 'F3', 'F4', 'S1', 'S2', 'S3', 'S4', 'MT1', 'MT2', 'MT3', 'MT4', 'CityT1', 'ForestT1', 'ForestT2'].includes(cfg.type)) {
                            const prefix = getChunkPrefix(cfg.type);
                            global.AssetManager.load(`${global.CONFIG.IMG_BASE}${prefix}${cfg.type.charAt(cfg.type.length - 1)}.png`);
                        }
                        if (id > prevMaxChunk) this.animatingChunks[id] = performance.now();
                        if (fid === null) fid = id;
                    });
                }
                if (currentMax < prevMaxChunk) prevMaxChunk = 0;
                localStorage.setItem('iso_max_chunk', currentMax);

                if (data.entities) {
                    this.herbData = data.entities.herbData || {};
                    this.treeData = data.entities.treeData || {};
                    this.guData = data.entities.guData || {};
                    this.mineralData = data.entities.mineralData || {};
                    this.springData = data.entities.springData || {};
                    this.soilData = data.entities.soilData || {};
                    this.npcs = data.entities.npcs || {};
                    this.qiTileData = data.entities.qiTileData || {};
                    this.forestData = data.entities.forestData || {};
                }

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

                [[this.herbData, 'H', global.CONFIG.ASSETS.H], [this.treeData, 'T', global.CONFIG.ASSETS.T]].forEach(([d, ty, arr]) => {
                    Object.entries(d).forEach(([k, v]) => {
                        const [c, x, y] = k.split(',').map(Number);
                        this.updateTileAsset(c, x, y, arr, ty, v.hidden, v.color);
                    });
                });

                const entitiesConfig = [
                    [this.guData, 'G', v => `${global.CONFIG.IMG_BASE}${v.type}.png`],
                    [this.mineralData, 'MI', () => `${global.CONFIG.IMG_BASE}MI${Math.floor(Math.random() * 9) + 1}.png`],
                    [this.springData, 'W', null],
                    [this.soilData, 'S', null]
                ];
                entitiesConfig.forEach(([d, ty, uFn]) => {
                    Object.entries(d).forEach(([k, v]) => {
                        const [c, x, y] = k.split(',').map(Number);
                        const t = this.getTile(c, x, y);
                        if (t) {
                            if (uFn && !t.assetUrl) {
                                t.assetUrl = uFn(v);
                                global.AssetManager.load(t.assetUrl);
                            }
                            t.assetType = ty; t.assetHidden = v.hidden; t.assetColor = v.color;
                        }
                    });
                });

                if (this.forestData) {
                    Object.entries(this.forestData).forEach(([k, v]) => {
                        const [c, x, y] = k.split(',').map(Number);
                        const tFront = this.getTile(c, x, y);
                        if (tFront) {
                            tFront.assetUrl = global.CONFIG.IMG_BASE + 'Forest.png';
                            tFront.assetType = 'Forest';
                            tFront.assetHidden = v.hidden || false;
                            tFront.assetColor = v.color || null;
                            global.AssetManager.load(tFront.assetUrl);
                        }
                        const tBack = this.getTile(c, x - 1, y);
                        if (tBack) {
                            tBack.isForestBackTile = true;
                            tBack.forestBaseKey = k;
                        }
                    });
                }

                Object.values(this.npcs).forEach(d => {
                    const url = global.CONFIG.getNPCAsset(d.type, d.stage);
                    if (url) global.AssetManager.load(url);
                });
                Object.entries(this.qiTileData).forEach(([k, v]) => { const [c, x, y] = k.split(',').map(Number); const t = this.getTile(c, x, y); if (t) t.qiData = v; });

                if (this.player && this.player.chunkId) {
                    global.AssetManager.get(global.CONFIG.PLAYER_IMG);
                    const cfg = this.chunkConfigs[this.player.chunkId];
                    if (cfg) {
                        const sc = this.gridToScreen((cfg.cx || 0) * 10 + this.player.lx - 1, (cfg.cy || 0) * 10 + this.player.ly - 1);
                        this.targetCamera.x = window.innerWidth / 2 - sc.x + this.camera.x;
                        this.targetCamera.y = window.innerHeight / 2 - sc.y + this.camera.y;
                    }
                }

                if (typeof this.checkContextualUI === 'function') {
                    this.checkContextualUI();
                }

                setTimeout(() => { Object.keys(this.chunkConfigs).forEach(cid => this.flattenChunk(+cid)); }, 150);

            } catch (e) { console.error("Map Parse Error:", e); }
        }

        generateChunk(id, cx, cy) {
            this.chunkConfigs[id] = { ...this.chunkConfigs[id], cx, cy };
            for (let y = 0; y < global.CONFIG.CHUNK_SIZE; y++) for (let x = 0; x < global.CONFIG.CHUNK_SIZE; x++) {
                const lx = x + 1, ly = y + 1;
                const k = `${id},${lx},${ly}`;
                if (!this.chunks[k]) {
                    const r = Math.random();
                    const gx = cx * global.CONFIG.CHUNK_SIZE + x, gy = cy * global.CONFIG.CHUNK_SIZE + y;
                    this.chunks[k] = { gx, gy, lx, ly, chunkId: id, assetUrl: null, assetType: null, assetHidden: false, offsetY: r < 0.33 ? -2 : r < 0.66 ? 2 : 0 };
                }
            }
        }

        flattenChunk(cid) {
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
        }

        updateTileAsset(cid, lx, ly, l, ty, h = false, col = null) {
            const t = this.getTile(cid, lx, ly);
            if (t && !t.assetUrl) {
                t.assetUrl = l[Math.floor(Math.random() * l.length)];
                t.assetType = ty;
                t.assetHidden = h;
                t.assetColor = col;
                global.AssetManager.get(t.assetUrl);
            }
        }

        get entityDataSources() {
            return [
                ['H', this.herbData],
                ['T', this.treeData],
                ['W', this.springData],
                ['S', this.soilData],
                ['G', this.guData],
                ['MI', this.mineralData],
                ['B', this.npcs],
                ['Forest', this.forestData]
            ];
        }
    }

    global.IsoGameEngine = IsoGameEngine;
})(window);
