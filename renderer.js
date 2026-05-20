(function (global) {
    const IsoGameEngine = global.IsoGameEngine;
    const CONFIG = global.CONFIG;

    Object.assign(IsoGameEngine.prototype, {
        gridToScreen(gx, gy) {
            const w = CONFIG.TILE_WIDTH * this.camera.zoom;
            const h = CONFIG.TILE_HEIGHT * this.camera.zoom;
            return {
                x: (((gx - gy) * (w / 2)) + this.camera.x) | 0,
                y: (((gx + gy) * (h / 2)) + this.camera.y) | 0
            };
        },

        screenToGrid(sx, sy) {
            const w = CONFIG.TILE_WIDTH * this.camera.zoom, h = CONFIG.TILE_HEIGHT * this.camera.zoom;
            const a = (sx - this.camera.x) / (w / 2), b = (sy - this.camera.y) / (h / 2);
            return { gx: (a + b) / 2, gy: (b - a) / 2 };
        },

        createIsoPath(x, y, w, h) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + w / 2, y + h / 2);
            this.ctx.lineTo(x, y + h);
            this.ctx.lineTo(x - w / 2, y + h / 2);
            this.ctx.closePath();
        },

        loop(ts) { if (this.active) { this.render(ts); requestAnimationFrame(t => this.loop(t)); } },

        render(ts) {
            const { camera: c, targetCamera: tc } = this;
            c.x = global.lerp(c.x, tc.x, 0.15); c.y = global.lerp(c.y, tc.y, 0.15); c.zoom = global.lerp(c.zoom, tc.zoom, 0.15);
            let sx = 0, sy = 0;
            if (this.shakeIntensity > 0.1) {
                sx = (Math.random() - 0.5) * this.shakeIntensity;
                sy = (Math.random() - 0.5) * this.shakeIntensity;
                this.shakeIntensity *= 0.85;
            } else {
                this.shakeIntensity = 0;
            }

            const cw = this.canvas.width, ch = this.canvas.height;
            this.ctx.clearRect(0, 0, cw, ch);

            if (this.timeOfDay === 'Night') {
                const bg = this.ctx.createLinearGradient(0, 0, 0, ch);
                bg.addColorStop(0, '#05050a'); bg.addColorStop(1, '#111122');
                this.ctx.fillStyle = bg; this.ctx.fillRect(0, 0, cw, ch);
                if (!this.skyStars) this.skyStars = Array.from({ length: 150 }, () => ({ x: Math.random() * cw, y: Math.random() * ch, s: Math.random() * 1.5, o: Math.random() * Math.PI * 2 }));
                this.ctx.fillStyle = '#fff';
                this.skyStars.forEach(st => {
                    this.ctx.globalAlpha = 0.3 + (Math.sin(ts * 0.002 + st.o) + 1) * 0.35;
                    this.ctx.fillRect(st.x, st.y, st.s * 2, st.s * 2);
                });
                this.ctx.globalAlpha = 1;
            } else {
                const bg = this.ctx.createLinearGradient(0, 0, 0, ch);
                bg.addColorStop(0, '#38bdf8'); bg.addColorStop(1, '#e0f2fe');
                this.ctx.fillStyle = bg; this.ctx.fillRect(0, 0, cw, ch);
                if (!this.clouds) {
                    this.clouds = Array.from({ length: 8 }, () => ({ i: Math.floor(Math.random() * 6) + 1, x: Math.random() * cw, y: Math.random() * ch * 0.4, s: 0.01 + Math.random() * 0.02, sc: 0.5 + Math.random() * 1.5, a: 0.3 + Math.random() * 0.3 }));
                    this.clouds.forEach(cl => global.AssetManager.load(`imh/C${cl.i}.png`));
                }
                this.clouds.forEach(cl => {
                    const img = global.AssetManager.get(`imh/C${cl.i}.png`);
                    if (img?.width) {
                        const cx = (cl.x + ts * cl.s) % (cw + 600) - 300;
                        this.ctx.globalAlpha = cl.a; this.ctx.drawImage(img, cx, cl.y, img.width * cl.sc, img.height * cl.sc);
                    }
                });
                this.ctx.globalAlpha = 1;
            }

            this.ctx.save(); this.ctx.translate(sx, sy);

            const unW = CONFIG.TILE_WIDTH, unH = CONFIG.TILE_HEIGHT;
            for (let i = 0; i < 100; i++) {
                const speed = 0.03 + (i % 10) / 200;
                const phase = i % (Math.PI * 2);
                const timeFactor = ts * speed;
                this.particleOffsets[i] = {
                    rise: ((timeFactor + i * 100) % (unH * 1.5)),
                    spread: Math.sin(timeFactor * 0.02 + phase) * 0.3 + (((i % unW) - unW / 2) * 0.6 / unW)
                };
            }

            let q = [];
            const padX = CONFIG.TILE_WIDTH * c.zoom * 2, padY = CONFIG.TILE_HEIGHT * c.zoom * 2;
            const isVis = (gx, gy) => { const pos = this.gridToScreen(gx, gy); return pos.x >= -padX && pos.x <= cw + padX && pos.y >= -padY && pos.y <= ch + padY; };

            const visibleChunks = new Set();
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

            const hGrid = this.screenToGrid(this.mousePos.x - sx, this.mousePos.y - sy);
            this.hoveredTile = null;
            let bestZ = -Infinity;

            visibleChunks.forEach(cid => {
                for (let lx = 1; lx <= 10; lx++) {
                    for (let ly = 1; ly <= 10; ly++) {
                        const t = this.chunks[`${cid},${lx},${ly}`];
                        if (!t) continue;
                        if (Math.abs(t.gx - hGrid.gx) < 3 && Math.abs(t.gy - hGrid.gy) < 3) {
                            const pos = this.gridToScreen(t.gx, t.gy);
                            const w = CONFIG.TILE_WIDTH * c.zoom, h = CONFIG.TILE_HEIGHT * c.zoom;
                            const ty = pos.y + (t.offsetY || 0) * c.zoom;

                            this.createIsoPath(pos.x, ty, w, h);
                            if (this.ctx.isPointInPath(this.mousePos.x, this.mousePos.y)) {
                                const z = t.gx + t.gy;
                                if (z > bestZ) { bestZ = z; this.hoveredTile = t; }
                            }
                        }
                    }
                }
            });

            visibleChunks.forEach(cid => {
                const img = this.chunkImages[cid];
                if (img) {
                    const cfg = this.chunkConfigs[cid];
                    const basePos = this.gridToScreen(cfg.cx * 10, cfg.cy * 10);
                    const scale = c.zoom / 2.0;
                    const drawW = img.width * scale, drawH = img.height * scale;
                    const drawX = (basePos.x - (img.width / 2) * scale) | 0;
                    const drawY = (basePos.y - 100 * scale) | 0;
                    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
                }
            });


            visibleChunks.forEach(cid => {
                for (let lx = 1; lx <= 10; lx++) for (let ly = 1; ly <= 10; ly++) {
                    const t = this.chunks[`${cid},${lx},${ly}`];
                    if (t && isVis(t.gx, t.gy)) {
                        const isGlowing = this.state === 'SENSE_ACTIVE' && this.validMoves.some(mv => mv.key === `${t.chunkId},${t.lx},${t.ly}`);
                        const hasAssets = (t.assetUrl && !t.assetHidden) || t.qiData || t.assetType === 'W' || ['CityWall', 'CityTower', 'CityGate'].includes(t.assetType);
                        if (t === this.hoveredTile || isGlowing || hasAssets || this.showRegions || (this.regionAnimStart > 0 && ts - this.regionAnimStart < 800)) {
                            q.push({ type: 'tile_overlay', obj: t, gx: t.gx, gy: t.gy, chunkId: t.chunkId, z: t.gx + t.gy });
                        }
                    }
                }
            });

            Object.entries(this.npcs).forEach(([k, d]) => {
                const [cid, lx, ly] = k.split(',').map(Number);
                const cfg = this.chunkConfigs[cid];
                const gx = (cfg?.cx || 0) * 10 + lx - 1, gy = (cfg?.cy || 0) * 10 + ly - 1;
                if (visibleChunks.has(cid) && isVis(gx, gy)) {
                    q.push({ type: 'npc', obj: d, gx, gy, chunkId: cid, z: gx + gy + 0.1 });
                }
            });

            if (this.player?.lx) {
                const cfg = this.chunkConfigs[this.player.chunkId], gx = (cfg?.cx || 0) * 10 + this.player.lx - 1, gy = (cfg?.cy || 0) * 10 + this.player.ly - 1;
                if (visibleChunks.has(this.player.chunkId) && isVis(gx, gy)) {
                    q.push({ type: 'player', gx, gy, chunkId: this.player.chunkId, z: gx + gy + 0.1 });
                }
            }

            q.forEach(i => {
                i.animOffsetY = 0; i.animOpacity = 1;
                if (this.animatingChunks && this.animatingChunks[i.chunkId]) {
                    const elapsed = ts - this.animatingChunks[i.chunkId];
                    if (elapsed < 1000) i.skipDraw = true;
                    else {
                        let dropStart = 1000 + (i.type === 'tile' ? ((i.gx % 10) + (i.gy % 10)) * 40 : 800);
                        if (elapsed < dropStart) i.skipDraw = true;
                        else {
                            const progress = Math.min((elapsed - dropStart) / 500, 1);
                            const backEaseOut = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
                            i.animOffsetY = -600 * (1 - backEaseOut(progress)); i.animOpacity = Math.min(progress * 1.5, 1);
                        }
                    }
                }
            });

            if (this.animatingChunks) Object.entries(this.animatingChunks).forEach(([idStr, startTime]) => {
                const elapsed = ts - startTime;
                if (elapsed < 1500) {
                    const cfg = this.chunkConfigs[+idStr];
                    if (cfg) {
                        const w = CONFIG.TILE_WIDTH * c.zoom, h = CONFIG.TILE_HEIGHT * c.zoom;
                        this.ctx.save(); this.ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'; this.ctx.lineWidth = 1.5 * c.zoom;
                        this.ctx.globalAlpha = elapsed < 1000 ? 1 : 1 - ((elapsed - 1000) / 500);
                        for (let x = 0; x < 10; x++) for (let y = 0; y < 10; y++) { const pos = this.gridToScreen(cfg.cx * 10 + x, cfg.cy * 10 + y); this.createIsoPath(pos.x, pos.y, w, h); this.ctx.fill(); this.ctx.stroke(); }
                        this.ctx.restore();
                    }
                }
            });

            q.sort((a, b) => a.z - b.z).forEach(i => {
                if (i.skipDraw) return;
                if (i.type === 'tile_overlay') {
                    this.drawTileOverlay(i.obj, ts, i.animOffsetY, i.animOpacity);
                    this.drawRegionBorderForTile(i.obj, ts, i.animOffsetY, i.animOpacity);
                }
                else if (i.type === 'npc') this.drawPiece(i.gx, i.gy, CONFIG.getNPCAsset(i.obj.type, i.obj.stage), i.obj.color, i.animOffsetY, i.animOpacity);
                else { this.drawPiece(i.gx, i.gy, CONFIG.PLAYER_IMG, '#fff', i.animOffsetY, i.animOpacity); this.checkContextualUI(); }
            });
            this.drawRegions(ts);

            if (this.ghostChunk) {
                const { cx, cy } = this.ghostChunk, w = CONFIG.TILE_WIDTH * c.zoom, h = CONFIG.TILE_HEIGHT * c.zoom;
                this.ctx.save(); this.ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'; this.ctx.lineWidth = 1.5 * c.zoom;
                for (let x = 0; x < 10; x++) for (let y = 0; y < 10; y++) { const pos = this.gridToScreen(cx * 10 + x, cy * 10 + y); this.createIsoPath(pos.x, pos.y, w, h); this.ctx.fill(); this.ctx.stroke(); }
                const cp = this.gridToScreen(cx * 10 + 4.5, cy * 10 + 4.5);
                Object.assign(this.ctx, { fillStyle: '#fff', font: `bold ${32 * c.zoom}px var(--font-title)`, textAlign: 'center', textBaseline: 'middle', shadowColor: 'rgba(0,0,0,0.9)', shadowBlur: 10 });
                this.ctx.fillText(`${cx},${cy}`, cp.x, cp.y);
                this.ctx.restore();
            }

            if (this.timeOfDay === 'Night') { this.ctx.save(); this.ctx.fillStyle = 'rgba(10, 15, 35, 0.35)'; this.ctx.fillRect(-cw, -ch, cw * 3, ch * 3); this.ctx.restore(); }
            this.drawSolarSystem(ts); this.ctx.restore();
        },

        drawTileOverlay(t, ts, animOffsetY = 0, animOpacity = 1) {
            const c = this.ctx, cz = this.camera.zoom, pos = this.gridToScreen(t.gx, t.gy), w = CONFIG.TILE_WIDTH * cz, h = CONFIG.TILE_HEIGHT * cz, x = pos.x, y = pos.y + (t.offsetY || 0) * cz + animOffsetY;
            c.globalAlpha = animOpacity;
            const isLOD = cz < 0.7;

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
                            const wv = (Math.sin(el / 200) + 1) / 2;
                            this.createIsoPath(x, y, w, h); const gp = c.createRadialGradient(x, y + h / 2, 0, x, y + h / 2, w / 2);
                            gp.addColorStop(0, `rgba(251,191,36,${0.4 * a})`); gp.addColorStop(1, `rgba(251,191,36,${0.1 * a * wv})`);
                            c.fillStyle = gp; c.fill(); c.strokeStyle = `rgba(251,191,36,${0.8 * a})`; c.lineWidth = 2; c.stroke();
                        }
                    }
                }
            }
            this.createIsoPath(x, y, w, h);
            if (t === this.hoveredTile) {
                c.fillStyle = CONFIG.COLORS.HOVER_FILL; c.fill(); c.strokeStyle = CONFIG.COLORS.HOVER_STROKE; c.lineWidth = 2; c.stroke();
                c.save(); c.font = `bold ${13 * cz}px var(--font-data)`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 6; c.fillText(`${t.chunkId},${t.lx},${t.ly}`, x, y + h / 2); c.restore();
            }
            if (t.assetUrl && !t.assetHidden) {
                const img = global.AssetManager.getTinted(t.assetUrl, t.assetColor, isLOD);
                c.fillStyle = 'rgba(0,0,0,0.2)';
                c.beginPath();
                c.ellipse(x, y + h / 2, w * 0.35, h * 0.25, 0, 0, Math.PI * 2);
                c.fill();
                const iw = img?.width || img?.naturalWidth;
                const ih = img?.height || img?.naturalHeight;
                if (iw) {
                    const isStructure = ['CityWall', 'CityTower', 'CityGate'].includes(t.assetType);
                    const scfs = { H: 0.5, M: 0.8, T: 0.8, CityTower: 1.0, CityWall: 1.5, CityGate: 1.15 };
                    let sc = (w / iw) * (scfs[t.assetType] || 0.7);
                    let dw = iw * sc, dh = ih * sc, dx = 0, dy = (t.assetType === 'G') ? (y + h / 2 - dh / 2) : (y + h / 2 - dh + h * 0.35);
 
                    if (isStructure) {
                        dy = y + h * 0.55 - dh;
                        if (t.assetType === 'CityGate') {
                            dw = w * 2.2;
                            dh = ih * (dw / iw);
                            const isV = t.wallOrientation === 'V';
                            if (isV) {
                                dx = t.isGatePart1 ? (-w * 0.25) : (w * 0.25);
                                let dy_off = t.isGatePart1 ? (h * 0.25) : (-h * 0.25);
                                dy += dy_off;
                            } else {
                                dx = t.isGatePart1 ? (w * 0.25) : (-w * 0.25);
                                let dy_off = t.isGatePart1 ? (h * 0.25) : (-h * 0.25);
                                dy += dy_off;
                            }
                        }
                    } else if (t.assetType === 'Forest') {
                        dw = w * 0.7;
                        dh = ih * (dw / iw) * 0.75;
                        dx = 0;
                        dy = y + h * 0.85 - dh;
                    }

                    c.save();
                    if (isStructure && (t.assetType === 'CityWall' || t.assetType === 'CityGate')) {
                        const isV = t.wallOrientation === 'V';
                        const isGate = t.assetType === 'CityGate';
                        if (isGate && !t.isGatePart1) { c.restore(); return; }

                        let gridWidth = isGate ? w : (w * 0.5);
                        let paddingCompensation = 1.05;
                        let drawWidth = gridWidth * paddingCompensation;
                        let drawHeight = ih * (drawWidth / iw) * (isGate ? 0.6 : 1.0);

                        let baseX = x;
                        let baseY = y + h / 2;

                        if (isGate) {
                            if (isV) {
                                baseX += t.isGatePart1 ? (-w * 0.25) : (w * 0.25);
                                baseY += t.isGatePart1 ? (h * 0.25) : (-h * 0.25);
                            } else {
                                baseX += t.isGatePart1 ? (w * 0.25) : (-w * 0.25);
                                baseY += t.isGatePart1 ? (h * 0.25) : (-h * 0.25);
                            }
                        }

                        c.translate(baseX, baseY);
                        c.transform(1, isV ? -0.5 : 0.5, 0, 1, 0, 0);
                        c.drawImage(img, -drawWidth / 2, -drawHeight, drawWidth, drawHeight);
                    } else if (isStructure && t.assetType === 'CityTower') {
                        let tw = w * 0.75;
                        let th = ih * (tw / iw);
                        c.drawImage(img, x - tw / 2, y + h / 2 - th + h * 0.25, tw, th);
                    } else {
                        c.drawImage(img, x - dw / 2 + dx, dy, dw, dh);
                    }
                    c.restore();
                }
            }
            if (t.assetType === 'W' && !t.assetHidden) {
                c.save(); this.createIsoPath(x, y, w, h); c.clip();
                const b1 = 'rgba(30,144,255,0.6)', b2 = 'rgba(0,191,255,0.4)';
                if (isLOD) { c.fillStyle = b1; c.fill(); }
                else { const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, b1); g.addColorStop(1, b2); c.fillStyle = g; c.fill(); }
                c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1;
                if (!isLOD) {
                    for (let i = 0; i < 3; i++) {
                        const ox = Math.sin(ts / 800 + i) * 5, oy = Math.cos(ts / 1000 + i) * 2;
                        c.beginPath(); c.ellipse(x + ox, y + h / 2 + oy, w * 0.3, h * 0.15, 0, 0, Math.PI * 2); c.stroke();
                    }
                    const gl = c.createRadialGradient(x, y + h / 2, 0, x, y + h / 2, w / 2); gl.addColorStop(0, 'rgba(255,255,255,0.2)'); gl.addColorStop(1, 'transparent');
                    c.fillStyle = gl; c.fill();
                }
                c.restore();
            }

            if (t.qiData && !t.qiData.hidden) {
                const colors = { fire: '#ef4444', water: '#3b82f6', wind: '#6ee7b7', earth: '#b45309', wood: '#22c55e', thunder: '#a855f7', light: '#fef08a', dark: '#111827', void: '#c026d3', pure: '#ffffff' };
                const col = colors[t.qiData.element?.toLowerCase()] || '#ffffff';

                c.save();
                c.globalAlpha = Math.min(0.4 + t.qiData.density * 0.1, 1.0) * (0.3 + 0.7 * ((Math.sin(ts / (600 - Math.min(t.qiData.density * 30, 400)) + t.gx * 0.5 + t.gy * 0.5) + 1) / 2)) * animOpacity;
                this.createIsoPath(x, y, w, h);

                if (isLOD) c.fillStyle = col;
                else {
                    const sg = c.createRadialGradient(x, y + h / 2, 0, x, y + h / 2, w / 1.2);
                    sg.addColorStop(0, col); sg.addColorStop(0.3, col); sg.addColorStop(1, 'transparent');
                    c.fillStyle = sg;
                }

                c.globalCompositeOperation = (t.qiData.element === 'dark') ? 'source-over' : 'lighter'; c.fill(); c.restore();

                c.save(); c.globalAlpha = animOpacity * 0.8; c.fillStyle = col;
                const pCount = Math.min(t.qiData.density * (isLOD ? 1 : 3), isLOD ? 2 : 30);
                for (let i = 0; i < pCount; i++) {
                    const seed = (t.gx * 13 + t.gy * 37 + i * 17) % 100, pD = this.particleOffsets[seed];
                    c.beginPath(); c.arc(x + pD.spread * w, y + h / 2 + (t.offsetY || 0) * cz - pD.rise * cz, (0.5 + (seed % 1.5)) * cz, 0, Math.PI * 2); c.fill();
                }
                c.restore();
            }

            c.globalAlpha = 1;
        },

        drawRegionBorderForTile(t, ts, animOffsetY = 0, animOpacity = 1) {
            if (!this.regions.length) return;
            const el = ts - (this.regionAnimStart || 0);
            let gt = Math.min(el / 800, 1);
            if (!this.showRegions) { gt = 1 - gt; if (gt <= 0) return; } else if (gt <= 0) return;

            const cz = this.camera.zoom;
            const pos = this.gridToScreen(t.gx, t.gy);
            const w = CONFIG.TILE_WIDTH * cz;
            const h = CONFIG.TILE_HEIGHT * cz;
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
                        this.ctx.fillStyle = col;
                        this.createIsoPath(pos.x, y, w, h);
                        this.ctx.fill();

                        this.ctx.globalAlpha = 0.8 * gt * animOpacity;
                        this.ctx.strokeStyle = col;
                        this.ctx.lineWidth = 2 * cz;
                        this.ctx.beginPath();
                        if (t.gy === ry1) { this.ctx.moveTo(pos.x, y); this.ctx.lineTo(pos.x + w / 2, y + h / 2); }
                        if (t.gx === rx2) { this.ctx.moveTo(pos.x + w / 2, y + h / 2); this.ctx.lineTo(pos.x, y + h); }
                        if (t.gy === ry2) { this.ctx.moveTo(pos.x, y + h); this.ctx.lineTo(pos.x - w / 2, y + h / 2); }
                        if (t.gx === rx1) { this.ctx.moveTo(pos.x - w / 2, y + h / 2); this.ctx.lineTo(pos.x, y); }
                        this.ctx.stroke();
                        this.ctx.restore();
                    }
                });
            });
        },

        drawPiece(gx, gy, url, col, animOffsetY = 0, animOpacity = 1) {
            const c = this.ctx, cz = this.camera.zoom, isLOD = cz < 0.7, pos = this.gridToScreen(gx, gy);
            const t = Object.values(this.chunks).find(tile => tile.gx === gx && tile.gy === gy && !this.chunkConfigs[tile.chunkId]?.hidden);
            const oy = (t?.offsetY || 0) * cz, w = CONFIG.TILE_WIDTH * cz, h = CONFIG.TILE_HEIGHT * cz, cx = pos.x, cy = pos.y + h / 2 + oy + animOffsetY;
            c.globalAlpha = animOpacity;
            c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(cx, cy, w * 0.3, h * 0.25, 0, 0, Math.PI * 2); c.fill();
            const img = global.AssetManager.getTinted(url, col, isLOD); c.save();
            const iw = img?.width || img?.naturalWidth;
            const ih = img?.height || img?.naturalHeight;
            if (iw) {
                const isp = url === CONFIG.PLAYER_IMG; let ph = h * (isp ? 1.3 : 1.5), pw = ph * (iw / ih);
                if (pw > w * 0.8) { pw = w * 0.8; ph = pw * (ih / iw); }
                c.drawImage(img, cx - pw / 2, cy - ph + h * 0.4, pw, ph);
            }
            c.restore();
            c.globalAlpha = 1;
        },

        drawSolarSystem(ts) {
            const cv = global.$('iso-solar-canvas'); if (!cv) return;
            const c = cv.getContext('2d'), w = cv.width, h = cv.height, t = ts * 0.001;
            c.clearRect(0, 0, w, h);

            const nebula = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 1.5);
            nebula.addColorStop(0, 'rgba(25, 15, 40, 0.2)');
            nebula.addColorStop(0.5, 'rgba(10, 10, 20, 0.1)');
            nebula.addColorStop(1, 'transparent');
            c.fillStyle = nebula;
            c.fillRect(0, 0, w, h);

            this.stars ??= Array.from({ length: 80 }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 0.5 + Math.random() * 1.5,
                blinkSpeed: 0.2 + Math.random() * 1.5,
                offset: Math.random() * Math.PI * 2,
                color: Math.random() > 0.8 ? '#a5f3fc' : '#fff'
            }));
            this.stars.forEach(s => {
                const alpha = 0.2 + (Math.sin(t * s.blinkSpeed + s.offset) + 1) * 0.4;
                c.fillStyle = s.color;
                c.globalAlpha = alpha;
                c.beginPath(); c.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2); c.fill();
            });
            c.globalAlpha = 1.0;

            const cx = w / 2, cy = h / 2;
            const pulse = (Math.sin(t * 2) + 1) * 0.5;
            const coreSize = 12 + pulse * 2;

            const coreGlow = c.createRadialGradient(cx, cy, 0, cx, cy, 45 + pulse * 10);
            coreGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
            coreGlow.addColorStop(0.4, 'rgba(180, 83, 9, 0.2)');
            coreGlow.addColorStop(1, 'transparent');
            c.fillStyle = coreGlow;
            c.beginPath(); c.arc(cx, cy, 60, 0, Math.PI * 2); c.fill();

            c.fillStyle = '#fff';
            c.beginPath(); c.arc(cx, cy, coreSize * 0.7, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#fbbf24';
            c.beginPath(); c.arc(cx, cy, coreSize * 0.5, 0, Math.PI * 2); c.fill();

            const orbits = [
                { r: 55, rx: 1.5, ry: 0.4, speed: 0.3, color: '#f87171', size: 4 },
                { r: 85, rx: 1.6, ry: 0.45, speed: -0.2, color: '#60a5fa', size: 6, ring: true },
                { r: 120, rx: 1.7, ry: 0.5, speed: 0.12, color: '#34d399', size: 5 }
            ];

            orbits.forEach((o, i) => {
                const angle = t * o.speed + (i * Math.PI * 0.6);
                const px = cx + Math.cos(angle) * o.r * o.rx;
                const py = cy + Math.sin(angle) * o.r * o.ry;

                c.beginPath();
                c.ellipse(cx, cy, o.r * o.rx, o.r * o.ry, 0, 0, Math.PI * 2);
                c.strokeStyle = 'rgba(201, 168, 106, 0.15)';
                c.lineWidth = 1;
                c.stroke();

                const pg = c.createRadialGradient(px, py, 0, px, py, o.size * 3);
                pg.addColorStop(0, o.color + '66');
                pg.addColorStop(1, 'transparent');
                c.fillStyle = pg;
                c.beginPath(); c.arc(px, py, o.size * 3, 0, Math.PI * 2); c.fill();

                if (o.ring) {
                    c.beginPath();
                    c.ellipse(px, py, o.size * 2.2, o.size * 0.8, angle + 0.5, 0, Math.PI * 2);
                    c.strokeStyle = 'rgba(255,255,255,0.3)';
                    c.lineWidth = 1.5;
                    c.stroke();
                }

                c.fillStyle = o.color;
                c.beginPath(); c.arc(px, py, o.size, 0, Math.PI * 2); c.fill();

                c.fillStyle = 'rgba(255,255,255,0.4)';
                c.beginPath(); c.arc(px - o.size * 0.3, py - o.size * 0.3, o.size * 0.2, 0, Math.PI * 2); c.fill();
            });
        },

        drawRegions(ts) {
            if (!this.regions.length) return;
            let gt = Math.min((ts - (this.regionAnimStart || 0)) / 800, 1);
            if (!this.showRegions) gt = 1 - gt;
            if (gt <= 0.5) return;

            const h = CONFIG.TILE_HEIGHT * this.camera.zoom;
            this.regions.forEach(reg => {
                if (!reg.ranges?.length) return;
                let [tGX, tGY, cnt] = [0, 0, 0];
                reg.ranges.forEach(r => {
                    const cfg = this.chunkConfigs[r.cid];
                    if (cfg) { tGX += cfg.cx * 10 + (r.lx1 + r.lx2) / 2 - 1; tGY += cfg.cy * 10 + (r.ly1 + r.ly2) / 2 - 1; cnt++; }
                });
                if (!cnt) return;
                const pc = this.gridToScreen(tGX / cnt, tGY / cnt), px = pc.x, py = pc.y + h / 2, c = this.ctx, z = this.camera.zoom, tS = 32 * z;

                c.save(); Object.assign(c, { globalAlpha: (gt - 0.5) * 2, textAlign: 'center', textBaseline: 'middle', shadowColor: 'rgba(0,0,0,0.9)', shadowBlur: 6 * z });
                c.font = `bold ${tS}px Cinzel, serif`; c.fillStyle = reg.color || '#10b981'; c.fillText(reg.name, px, py - 20 * z);
                c.font = `bold ${12 * z}px var(--font-data)`; c.fillStyle = '#fff'; c.fillText(`AURA DENSITY: ${reg.impedance}`, px, py + tS * 0.4);
                c.restore();
            });
        }
    });
})(window);
