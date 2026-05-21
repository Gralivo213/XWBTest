(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.drawSkyBackground = function (ts, cw, ch) {
        const c = this.ctx;
        if (this.timeOfDay === 'Night') {
            const bg = c.createLinearGradient(0, 0, 0, ch);
            bg.addColorStop(0, '#05050a'); bg.addColorStop(1, '#111122');
            c.fillStyle = bg; c.fillRect(0, 0, cw, ch);
            this.skyStars ??= Array.from({ length: 150 }, () => ({
                x: Math.random() * cw, y: Math.random() * ch, s: Math.random() * 1.5, o: Math.random() * Math.PI * 2
            }));
            c.fillStyle = '#fff';
            this.skyStars.forEach(st => {
                c.globalAlpha = 0.3 + (Math.sin(ts * 0.002 + st.o) + 1) * 0.35;
                c.fillRect(st.x, st.y, st.s * 2, st.s * 2);
            });
            c.globalAlpha = 1;
        } else {
            const bg = c.createLinearGradient(0, 0, 0, ch);
            bg.addColorStop(0, '#38bdf8'); bg.addColorStop(1, '#e0f2fe');
            c.fillStyle = bg; c.fillRect(0, 0, cw, ch);
            this.clouds ??= Array.from({ length: 8 }, () => ({
                i: Math.floor(Math.random() * 6) + 1, x: Math.random() * cw, y: Math.random() * ch * 0.4,
                s: 0.01 + Math.random() * 0.02, sc: 0.5 + Math.random() * 1.5, a: 0.3 + Math.random() * 0.3
            }));
            this.clouds.forEach(cl => global.AssetManager.load(`${global.CONFIG.IMG_BASE}C${cl.i}.png`));
            this.clouds.forEach(cl => {
                const img = global.AssetManager.get(`${global.CONFIG.IMG_BASE}C${cl.i}.png`);
                if (img?.width) {
                    const cx = (cl.x + ts * cl.s) % (cw + 600) - 300;
                    c.globalAlpha = cl.a; c.drawImage(img, cx, cl.y, img.width * cl.sc, img.height * cl.sc);
                }
            });
            c.globalAlpha = 1;
        }
    };
})(window);
