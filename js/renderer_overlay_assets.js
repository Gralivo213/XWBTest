(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.drawTileAssetImage = function (t, x, y, w, h, cz, isLOD) {
        const c = this.ctx, img = global.AssetManager.getTinted(t.assetUrl, t.assetColor, isLOD);
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x, y + h / 2, w * 0.35, h * 0.25, 0, 0, Math.PI * 2); c.fill();
        const iw = img?.width || img?.naturalWidth, ih = img?.height || img?.naturalHeight;
        if (!iw) return;
        const isStr = ['CityWall', 'CityTower', 'CityGate'].includes(t.assetType);
        const scfs = { H: 0.5, M: 0.8, T: 0.8, CityTower: 1.0, CityWall: 1.5, CityGate: 1.15 };
        let sc = (w / iw) * (scfs[t.assetType] || 0.7);
        let dw = iw * sc, dh = ih * sc, dx = 0, dy = (t.assetType === 'G') ? (y + h / 2 - dh / 2) : (y + h / 2 - dh + h * 0.35);

        if (isStr) {
            dy = y + h * 0.55 - dh;
            if (t.assetType === 'CityGate') {
                dw = w * 2.2; dh = ih * (dw / iw);
                const isV = t.wallOrientation === 'V';
                dx = (isV ? (t.isGatePart1 ? -w * 0.25 : w * 0.25) : (t.isGatePart1 ? w * 0.25 : -w * 0.25));
                dy += (t.isGatePart1 ? h * 0.25 : -h * 0.25);
            }
        } else if (t.assetType === 'Forest') {
            dw = w * 0.7; dh = ih * (dw / iw) * 0.75; dy = y + h * 0.85 - dh;
        }

        c.save();
        if (isStr && (t.assetType === 'CityWall' || t.assetType === 'CityGate')) {
            const isV = t.wallOrientation === 'V', isGate = t.assetType === 'CityGate';
            if (isGate && !t.isGatePart1) { c.restore(); return; }
            let dW = (isGate ? w : w * 0.5) * 1.05, dH = ih * (dW / iw) * (isGate ? 0.6 : 1.0);
            let bX = x, bY = y + h / 2;
            if (isGate) {
                bX += (isV ? (t.isGatePart1 ? -w * 0.25 : w * 0.25) : (t.isGatePart1 ? w * 0.25 : -w * 0.25));
                bY += (t.isGatePart1 ? h * 0.25 : -h * 0.25);
            }
            c.translate(bX, bY); c.transform(1, isV ? -0.5 : 0.5, 0, 1, 0, 0);
            c.drawImage(img, -dW / 2, -dH, dW, dH);
        } else if (isStr && t.assetType === 'CityTower') {
            let tw = w * 0.75, th = ih * (tw / iw);
            c.drawImage(img, x - tw / 2, y + h / 2 - th + h * 0.25, tw, th);
        } else {
            c.drawImage(img, x - dw / 2 + dx, dy, dw, dh);
        }
        c.restore();
    };

    proto.drawTileWater = function (t, x, y, w, h, ts, isLOD) {
        const c = this.ctx; c.save(); this.createIsoPath(x, y, w, h); c.clip();
        const b1 = 'rgba(30,144,255,0.6)', b2 = 'rgba(0,191,255,0.4)';
        if (isLOD) { c.fillStyle = b1; c.fill(); }
        else {
            const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, b1); g.addColorStop(1, b2); c.fillStyle = g; c.fill();
        }
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
    };

    proto.drawTileQi = function (t, x, y, w, h, ts, animOpacity, cz, isLOD) {
        const c = this.ctx, colors = { fire: '#ef4444', water: '#3b82f6', wind: '#6ee7b7', earth: '#b45309', wood: '#22c55e', thunder: '#a855f7', light: '#fef08a', dark: '#111827', void: '#c026d3', pure: '#ffffff' };
        const col = colors[t.qiData.element?.toLowerCase()] || '#ffffff';
        c.save();
        c.globalAlpha = Math.min(0.4 + t.qiData.density * 0.1, 1.0) * (0.3 + 0.7 * ((Math.sin(ts / (600 - Math.min(t.qiData.density * 30, 400)) + t.gx * 0.5 + t.gy * 0.5) + 1) / 2)) * animOpacity;
        this.createIsoPath(x, y, w, h);
        if (isLOD) c.fillStyle = col;
        else {
            const sg = c.createRadialGradient(x, y + h / 2, 0, x, y + h / 2, w / 1.2);
            sg.addColorStop(0, col); sg.addColorStop(0.3, col); sg.addColorStop(1, 'transparent'); c.fillStyle = sg;
        }
        c.globalCompositeOperation = (t.qiData.element === 'dark') ? 'source-over' : 'lighter'; c.fill(); c.restore();

        c.save(); c.globalAlpha = animOpacity * 0.8; c.fillStyle = col;
        const pCount = Math.min(t.qiData.density * (isLOD ? 1 : 3), isLOD ? 2 : 30);
        for (let i = 0; i < pCount; i++) {
            const seed = (t.gx * 13 + t.gy * 37 + i * 17) % 100, pD = this.particleOffsets[seed];
            c.beginPath(); c.arc(x + pD.spread * w, y + h / 2 - pD.rise * cz, (0.5 + (seed % 1.5)) * cz, 0, Math.PI * 2); c.fill();
        }
        c.restore();
    };
})(window);
