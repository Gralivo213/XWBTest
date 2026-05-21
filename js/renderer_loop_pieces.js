(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.collectRenderQueue = function (visibleChunks, ts) {
        const q = [], c = this.camera, cw = this.canvas.width, ch = this.canvas.height;
        const padX = global.CONFIG.TILE_WIDTH * c.zoom * 2, padY = global.CONFIG.TILE_HEIGHT * c.zoom * 2;
        const isVis = (gx, gy) => {
            const pos = this.gridToScreen(gx, gy);
            return pos.x >= -padX && pos.x <= cw + padX && pos.y >= -padY && pos.y <= ch + padY;
        };

        visibleChunks.forEach(cid => {
            for (let lx = 1; lx <= 10; lx++) {
                for (let ly = 1; ly <= 10; ly++) {
                    const t = this.chunks[`${cid},${lx},${ly}`];
                    if (t && isVis(t.gx, t.gy)) {
                        const isGlowing = this.state === 'SENSE_ACTIVE' && this.validMoves.some(mv => mv.key === `${t.chunkId},${t.lx},${t.ly}`);
                        const hasAssets = (t.assetUrl && !t.assetHidden) || t.qiData || t.assetType === 'W' || ['CityWall', 'CityTower', 'CityGate'].includes(t.assetType);
                        if (t === this.hoveredTile || isGlowing || hasAssets || this.showRegions || (this.regionAnimStart > 0 && ts - this.regionAnimStart < 800)) {
                            q.push({ type: 'tile_overlay', obj: t, gx: t.gx, gy: t.gy, chunkId: t.chunkId, z: t.gx + t.gy });
                        }
                    }
                }
            }
        });

        let hasActive = false;
        if (this.animatingChunks) {
            for (const sTime of Object.values(this.animatingChunks)) { if (ts - sTime < 2300) { hasActive = true; break; } }
        }
        const startDelay = hasActive ? 2300 : 300;

        const getInterp = (pStr, defKey) => {
            let pts = (pStr || defKey).split('|').map(s => s.trim());
            const N = pts.length;
            if (N === 0) return null;

            const resolvedSteps = [];
            const cdStart = pts[0].split(',').map(Number);
            if (cdStart.length < 3) return null;
            const cfgStart = this.chunkConfigs[cdStart[0]];
            if (!cfgStart) return null;

            let currentGx = cfgStart.cx * 10 + cdStart[1] - 1;
            let currentGy = cfgStart.cy * 10 + cdStart[2] - 1;
            resolvedSteps.push({ gx: currentGx, gy: currentGy, cid: cdStart[0] });

            for (let i = 1; i < N; i++) {
                const cd = pts[i].split(',').map(Number);
                if (cd.length < 3) return null;
                const cfg = this.chunkConfigs[cd[0]];
                if (!cfg) return null;
                const targetGx = cfg.cx * 10 + cd[1] - 1;
                const targetGy = cfg.cy * 10 + cd[2] - 1;

                while (currentGx !== targetGx) {
                    currentGx += Math.sign(targetGx - currentGx);
                    resolvedSteps.push({ gx: currentGx, gy: currentGy, cid: cd[0] });
                }
                while (currentGy !== targetGy) {
                    currentGy += Math.sign(targetGy - currentGy);
                    resolvedSteps.push({ gx: currentGx, gy: currentGy, cid: cd[0] });
                }
            }

            const M = resolvedSteps.length;
            if (M === 1) return resolvedSteps[0];

            const stepDuration = 500;
            const totalDuration = (M - 1) * stepDuration;

            const p = Math.min(1, Math.max(0, (ts - (this.mapLoadTime || 0) - startDelay) / totalDuration));
            if (p >= 1) return resolvedSteps[M - 1];

            const segmentCount = M - 1;
            const floatIdx = p * segmentCount;
            let idx = Math.floor(floatIdx);
            let segmentP = floatIdx - idx;
            if (idx >= segmentCount) {
                idx = segmentCount - 1;
                segmentP = 1.0;
            }

            let segmentP_adj = 1.0;
            if (segmentP < 0.7) {
                const t = segmentP / 0.7;
                segmentP_adj = t * t * (3 - 2 * t);
            }

            const step1 = resolvedSteps[idx];
            const step2 = resolvedSteps[idx + 1];

            return {
                gx: global.lerp(step1.gx, step2.gx, segmentP_adj),
                gy: global.lerp(step1.gy, step2.gy, segmentP_adj),
                cid: segmentP_adj < 0.5 ? step1.cid : step2.cid
            };
        };

        Object.entries(this.npcs).forEach(([k, d]) => {
            if (d.hidden) return;
            const pos = getInterp(d.tilePath, k);
            if (pos && visibleChunks.has(pos.cid) && isVis(pos.gx, pos.gy)) {
                q.push({ type: 'npc', obj: d, gx: pos.gx, gy: pos.gy, chunkId: pos.cid, z: pos.gx + pos.gy + 0.1 });
            }
        });

        if (this.player) {
            const pos = getInterp(this.player.tilePath, `${this.player.chunkId},${this.player.lx},${this.player.ly}`);
            if (pos && isVis(pos.gx, pos.gy)) q.push({ type: 'player', gx: pos.gx, gy: pos.gy, chunkId: pos.cid, z: pos.gx + pos.gy + 0.1 });
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
                        i.animOffsetY = -600 * (1 - (1 + 2.70158 * Math.pow(progress - 1, 3) + 1.70158 * Math.pow(progress - 1, 2))); i.animOpacity = Math.min(progress * 1.5, 1);
                    }
                }
            }
        });
        return q;
    };

    proto.renderQueueItems = function (q, ts) {
        q.sort((a, b) => a.z - b.z).forEach(i => {
            if (i.skipDraw) return;
            if (i.type === 'tile_overlay') {
                this.drawTileOverlay(i.obj, ts, i.animOffsetY, i.animOpacity); this.drawRegionBorderForTile(i.obj, ts, i.animOffsetY, i.animOpacity);
            } else if (i.type === 'npc') {
                this.drawPiece(i.gx, i.gy, global.CONFIG.getNPCAsset(i.obj.type, i.obj.stage, i.obj.name), i.obj.color, i.animOffsetY, i.animOpacity);
            } else {
                this.drawPiece(i.gx, i.gy, global.CONFIG.PLAYER_IMG, '#fff', i.animOffsetY, i.animOpacity); this.checkContextualUI();
            }
        });
    };
})(window);
