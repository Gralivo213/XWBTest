(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.createUI = function () {
        [
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' },
            { src: 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js' }
        ].forEach(a => {
            const el = document.createElement(a.src ? 'script' : 'link');
            Object.assign(document.head.appendChild(el), a);
        });

        const makeHudBar = (id, label, cls) => `<div class="bar-row ${cls}" id="${id}-bar-container" style="cursor:pointer;" title="${label} Status"><span class="bar-label">${label}</span><div class="bar-track"><div class="bar-fill" id="${id}-bar-fill" style="width:100%"><div class="bar-shimmer"></div></div><div class="bar-glow" id="${id}-bar-glow" style="left:calc(100% - 2px)"></div></div><span class="bar-val" id="${id}-val">100</span></div>`;
        const makeSysPop = (id, title, bd, sd, desc, details) => `<div class="iso-ui-popup" id="${id}-popup" style="top:50%;left:50%;transform:translate(-50%,-50%);flex-direction:column;align-items:flex-start;width:400px;border-color:${bd};z-index:9999;display:none;background:rgba(20,10,10,0.98);box-shadow:0 0 50px rgba(0,0,0,0.9), inset 0 0 20px ${sd};"><h3 style="color:${bd};margin:0 0 10px 0;font-family:var(--font-title);font-size:28px;">${title}</h3><p style="color:#d1d5db;font-family:var(--font-data);margin-top:0;font-size:16px;">${desc}</p><div style="width:100%;height:1px;background:rgba(239,68,68,0.3);margin:10px 0;"></div><div style="color:#fff;font-family:var(--font-data);font-size:16px;line-height:1.6;width:100%;">${details}</div><button class="iso-btn-action" id="${id}-popup-close" style="width:100px;height:40px;align-self:flex-end;margin-top:20px;border-color:${bd};"><span class="iso-btn-text" style="font-size:14px;color:${bd};">CLOSE</span></button></div>`;

        const coreH = typeof this.getCoreLayoutHtml === 'function' ? this.getCoreLayoutHtml(makeHudBar) : '';
        const panelsH = typeof this.getPanelsLayoutHtml === 'function' ? this.getPanelsLayoutHtml() : '';
        const popupsH = typeof this.getPopupsLayoutHtml === 'function' ? this.getPopupsLayoutHtml(makeSysPop) : '';

        document.body.insertAdjacentHTML('beforeend', coreH + panelsH + popupsH);
        this.bindUI();
    };

    proto.getCoreLayoutHtml = function (makeHudBar) {
        return `
            <div class="iso-vignette"></div>
            <div class="iso-book-modal" id="iso-book-modal">
                <div class="iso-book-backdrop" id="iso-book-close-bg"></div>
                <div class="iso-book-body">
                    <div class="iso-book-close-btn" id="iso-book-close-btn">✕</div>
                    <div class="iso-book-arrow left" id="iso-book-prev">❮</div>
                    <div class="iso-book-arrow right" id="iso-book-next">❯</div>
                    <div class="iso-book-pages" id="iso-book-pages"></div>
                </div>
            </div>
            <div class="iso-top-ui">
                <div class="hud-root" role="region" aria-label="Character status bars">
                    <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
                    <div class="bottom-accent"></div>
                    <div class="hud-inner">
                        <div class="sanity-wrap" id="hud-sanity-diamond" style="cursor:pointer;" title="Open Stats Menu">
                            <div class="sanity-outer-ring"></div>
                            <div class="sanity-outer"><div class="sanity-liquid" id="sanity-fill" style="height:100%"></div></div>
                            <div class="sanity-value"><span class="sanity-num" id="sanity-val">100</span><span class="sanity-lbl">Sanity</span></div>
                            <div class="sanity-connector"><div class="connector-line"></div><div class="connector-diamond"></div></div>
                        </div>
                        <div class="bars-stack">
                            ${makeHudBar('hp', 'Health', 'health')} ${makeHudBar('qi', 'Qi', 'qi')}
                            <div class="divider"></div>
                            ${makeHudBar('stamina', 'Will', 'will')} ${makeHudBar('mood', 'Mood', 'mood')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
})(window);
