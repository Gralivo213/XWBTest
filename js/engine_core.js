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
            ['herb', 'tree', 'spring', 'soil', 'gu', 'mineral', 'qiTile', 'forest'].forEach(k => this[`${k}Data`] = {});
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

        resize() {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
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
    }

    global.IsoGameEngine = IsoGameEngine;
})(window);
