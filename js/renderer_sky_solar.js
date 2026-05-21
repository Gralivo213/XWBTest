(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.drawSolarSystem = function (ts) {
        const cv = global.$('iso-solar-canvas'); if (!cv) return;
        const c = cv.getContext('2d'), w = cv.width, h = cv.height, t = ts * 0.001;
        c.clearRect(0, 0, w, h);

        const nebula = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 1.5);
        nebula.addColorStop(0, 'rgba(25, 15, 40, 0.2)'); nebula.addColorStop(0.5, 'rgba(10, 10, 20, 0.1)'); nebula.addColorStop(1, 'transparent');
        c.fillStyle = nebula; c.fillRect(0, 0, w, h);

        this.stars ??= Array.from({ length: 80 }, () => ({
            x: Math.random() * w, y: Math.random() * h, size: 0.5 + Math.random() * 1.5,
            blinkSpeed: 0.2 + Math.random() * 1.5, offset: Math.random() * Math.PI * 2, color: Math.random() > 0.8 ? '#a5f3fc' : '#fff'
        }));
        this.stars.forEach(s => {
            c.fillStyle = s.color; c.globalAlpha = 0.2 + (Math.sin(t * s.blinkSpeed + s.offset) + 1) * 0.4;
            c.beginPath(); c.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2); c.fill();
        });
        c.globalAlpha = 1.0;

        const cx = w / 2, cy = h / 2, pulse = (Math.sin(t * 2) + 1) * 0.5, coreSize = 12 + pulse * 2;
        const coreGlow = c.createRadialGradient(cx, cy, 0, cx, cy, 45 + pulse * 10);
        coreGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)'); coreGlow.addColorStop(0.4, 'rgba(180, 83, 9, 0.2)'); coreGlow.addColorStop(1, 'transparent');
        c.fillStyle = coreGlow; c.beginPath(); c.arc(cx, cy, 60, 0, Math.PI * 2); c.fill();

        c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, coreSize * 0.7, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fbbf24'; c.beginPath(); c.arc(cx, cy, coreSize * 0.5, 0, Math.PI * 2); c.fill();

        const orbits = [
            { r: 55, rx: 1.5, ry: 0.4, speed: 0.3, color: '#f87171', size: 4 },
            { r: 85, rx: 1.6, ry: 0.45, speed: -0.2, color: '#60a5fa', size: 6, ring: true },
            { r: 120, rx: 1.7, ry: 0.5, speed: 0.12, color: '#34d399', size: 5 }
        ];

        orbits.forEach((o, i) => {
            const angle = t * o.speed + (i * Math.PI * 0.6), px = cx + Math.cos(angle) * o.r * o.rx, py = cy + Math.sin(angle) * o.r * o.ry;
            c.beginPath(); c.ellipse(cx, cy, o.r * o.rx, o.r * o.ry, 0, 0, Math.PI * 2);
            c.strokeStyle = 'rgba(201, 168, 106, 0.15)'; c.lineWidth = 1; c.stroke();

            const pg = c.createRadialGradient(px, py, 0, px, py, o.size * 3);
            pg.addColorStop(0, o.color + '66'); pg.addColorStop(1, 'transparent');
            c.fillStyle = pg; c.beginPath(); c.arc(px, py, o.size * 3, 0, Math.PI * 2); c.fill();

            if (o.ring) {
                c.beginPath(); c.ellipse(px, py, o.size * 2.2, o.size * 0.8, angle + 0.5, 0, Math.PI * 2);
                c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1.5; c.stroke();
            }
            c.fillStyle = o.color; c.beginPath(); c.arc(px, py, o.size, 0, Math.PI * 2); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(px - o.size * 0.3, py - o.size * 0.3, o.size * 0.2, 0, Math.PI * 2); c.fill();
        });
    };

    proto.drawRegions = function (ts) {
        if (!this.regions.length) return;
        let gt = Math.min((ts - (this.regionAnimStart || 0)) / 800, 1);
        if (!this.showRegions) gt = 1 - gt;
        if (gt <= 0.5) return;

        const h = global.CONFIG.TILE_HEIGHT * this.camera.zoom;
        this.regions.forEach(reg => {
            if (!reg.ranges?.length) return;
            let [tGX, tGY, cnt] = [0, 0, 0];
            reg.ranges.forEach(r => {
                if (this.chunkConfigs[r.cid]?.hidden) return;
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
    };
})(window);
