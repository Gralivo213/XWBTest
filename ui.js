(function (global) {
    const IsoGameEngine = global.IsoGameEngine;
    const CONFIG = global.CONFIG;
    const $ = global.$;
    const $$ = global.$$;
    const stopPropagation = global.stopPropagation;

    Object.assign(IsoGameEngine.prototype, {
        createUI() {
            [
                { t: 'link', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap' },
                { t: 'link', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' },
                { t: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js' }
            ].forEach(a => {
                const el = document.createElement(a.t);
                delete a.t;
                Object.assign(document.head.appendChild(el), a);
            });

            const makeHudBar = (id, label, cls) => `
                <div class="bar-row ${cls}" id="${id}-bar-container" style="cursor:pointer;" title="${label} Status">
                    <span class="bar-label">${label}</span>
                    <div class="bar-track">
                        <div class="bar-fill" id="${id}-bar-fill" style="width:100%"><div class="bar-shimmer"></div></div>
                        <div class="bar-glow" id="${id}-bar-glow" style="left:calc(100% - 2px)"></div>
                    </div>
                    <span class="bar-val" id="${id}-val">100</span>
                </div>`;

            const makeSystemPopup = (id, title, bd, sd, desc, details) => `
                <div class="iso-ui-popup" id="${id}-popup" style="top:50%;left:50%;transform:translate(-50%,-50%);flex-direction:column;align-items:flex-start;width:400px;border-color:${bd};z-index:9999;display:none;background:rgba(20,10,10,0.98);box-shadow:0 0 50px rgba(0,0,0,0.9), inset 0 0 20px ${sd};">
                    <h3 style="color:${bd};margin:0 0 10px 0;font-family:var(--font-title);font-size:28px;">${title}</h3>
                    <p style="color:#d1d5db;font-family:var(--font-data);margin-top:0;font-size:16px;">${desc}</p>
                    <div style="width:100%;height:1px;background:rgba(239,68,68,0.3);margin:10px 0;"></div>
                    <div style="color:#fff;font-family:var(--font-data);font-size:16px;line-height:1.6;width:100%;">${details}</div>
                    <button class="iso-btn-action" id="${id}-popup-close" style="width:100px;height:40px;align-self:flex-end;margin-top:20px;border-color:${bd};"><span class="iso-btn-text" style="font-size:14px;color:${bd};">CLOSE</span></button>
                </div>`;

            document.body.insertAdjacentHTML('beforeend', `
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

<div class="iso-clock-panel">
    <div class="iso-clock-panel-ornament top-left"></div><div class="iso-clock-panel-ornament bottom-right"></div>
    <div class="iso-solar-container" id="iso-solar-wrapper" style="cursor:pointer;" title="Astral Alignment">
        <canvas id="iso-solar-canvas" width="400" height="120" style="width:100%;height:100%;pointer-events:none;"></canvas>
    </div>
    <div style="width: 100%; text-align: center; background: rgba(0,0,0,0.5); border: 1px solid rgba(243, 207, 122, 0.2); padding: 6px 0; border-radius: 3px; box-shadow: inset 0 0 10px rgba(0,0,0,0.8);">
        <span style="font-family: var(--font-data); font-size: 11px; color: #8a7a5f; text-transform: uppercase; letter-spacing: 2px;">Lifespan: </span>
        <span id="iso-lifespan-val" style="font-family: var(--font-title); font-size: 16px; color: #f87171; font-weight: bold; text-shadow: 0 0 8px rgba(248,113,113,0.4);">100 Years</span>
    </div>
    <div class="iso-date-row">
        ${['Day:15', 'Month:03', 'Year:218'].map(d => { let [l, v] = d.split(':'); return `<div class="iso-date-box"><span class="iso-date-label">${l}</span><span class="iso-date-value" id="clock-${l.toLowerCase()}">${v}</span></div>`; }).join('')}
    </div>
</div>

${[['sense', 'visibility', 25, 95, 'Sense Aura'], ['region', 'map', 95, 25, 'Toggle Regions'], ['mission', 'assignment', 25, 25, 'Missions']].map(([id, i, b, l, t]) => `<div class="iso-float-btn" id="iso-${id}-btn" style="bottom:${b}px;left:${l}px" title="${t}"><span class="material-symbols-outlined">${i}</span></div>`).join('')}

<div class="iso-mission-panel" id="iso-mission-panel">
    <div class="iso-stat-close" id="mission-close">✕</div>
    <div class="mission-section"><h2 class="mission-section-title">Mission Records</h2><div id="unified-mission-list" class="mission-list"></div></div>
</div>

<div class="iso-herb-panel" id="iso-herb-panel"></div>

<div class="iso-ui-popup" id="iso-ui-popup">
    <span id="popup-text" style="flex:1;line-height:1.4">Waiting for input...</span>
    <button class="iso-float-btn" id="copy-btn" style="position:relative;width:40px;height:40px;bottom:0;left:0"><span class="material-symbols-outlined" style="font-size:18px">content_copy</span></button>
</div>

<div class="iso-msg-container" id="iso-msg-container"></div>

<div class="iso-stat-popup" id="iso-stat-popup">
    <div class="iso-stat-close" id="stat-close">✕</div>
    <div class="iso-stat-header">
        ${['Character', 'Inventory', 'Cultivation', 'Skill'].map((t, i) => `<div class="iso-stat-section ${i ? '' : 'active'}">${t}</div>`).join('')}
    </div>
    <div class="iso-stat-body active">
        <div style="display:flex;gap:50px;height:100%">
            <div style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:25px;display:flex;flex-direction:column;justify-content:space-between;">
                <div class="profile-details-wrap">
                    <h2 style="font-family:var(--font-title);color:var(--gold-primary);margin-top:0">Soul Profile</h2>
                    <p id="profile-p-name"><strong>Name:</strong> Wandering Cultivator</p><p><strong>Title:</strong> Unknown</p><p><strong>Realm:</strong> Qi Condensation (Layer 1)</p>
                </div>
                <button id="btn-relations" class="iso-btn-action" style="margin-top:20px;height:40px;padding:0;"><span class="iso-btn-text" style="font-size:14px;letter-spacing:2px;">RELATIONS</span></button>
            </div>
            <div style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:25px">
                <h2 style="font-family:var(--font-title);color:var(--gold-primary);margin-top:0">Affiliations</h2>
                <p><strong>Alignment:</strong> Neutral</p><p><strong>Faction:</strong> None</p><p><strong>Reputation:</strong> 0</p>
            </div>
        </div>
    </div>
    <div class="iso-stat-body">
        <div class="iso-inventory-container">
            <div class="iso-inventory-left">
                <div class="iso-equipment-panel">${['Head', 'Torso', 'Legs', 'Weapon', 'Accessory', 'Feet'].map(slot => `<div class="iso-eq-slot" title="${slot}"></div>`).join('')}</div>
                <div class="iso-inventory-grid-panel"><div class="iso-inventory-grid">${Array.from({ length: 24 }).map((_, i) => `<div class="iso-inv-slot" data-index="${i}"></div>`).join('')}</div></div>
            </div>
            <div class="iso-inventory-right">
                <div class="iso-item-details">
                    <div class="iso-details-header">Item Details</div>
                    <div id="iso-item-content"><span class="material-symbols-outlined">inventory_2</span><p>Select an item from your inventory or equipment to view its properties and lore.</p></div>
                </div>
                <div class="iso-craft-tab">CRAFT</div>
            </div>
        </div>
    </div>
    <div class="iso-stat-body">
        <div style="display:flex;justify-content:center;align-items:center;gap:60px;transform:translateY(0%)">
            <div id="btn-cultivate" class="iso-cult-btn" style="text-align:center;cursor:pointer;transition:.3s"><h3 style="font-family:var(--font-title);color:var(--gold-primary);margin:0;font-size:32px;text-shadow:0 0 10px rgba(251,191,36,0.5)">Cultivate</h3></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:15px">
                <div style="position:relative;width:220px;height:220px;display:flex;align-items:center;justify-content:center">
                    <img src="imh/Dantian.png" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 25px var(--gold-glow));animation:pulse 4s infinite ease-in-out">
                    <div id="dantian-fill" style="position:absolute;bottom:0;left:0;width:100%;height:0%;background:linear-gradient(to top, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.4));mix-blend-mode:color-dodge;pointer-events:none;transition:height 1.5s cubic-bezier(0.4, 0, 0.2, 1);box-shadow: 0 -5px 15px var(--gold-primary)"></div>
                </div>
                <div id="iso-realm-text" style="font-family:var(--font-title);color:var(--gold-primary);font-size:24px;text-align:center;text-shadow:0 0 10px var(--gold-glow)">Unknown</div>
                <div id="iso-spirit-root-text" style="font-family:var(--font-korean);color:#d1d5db;font-size:20px;text-align:center;max-width:400px;min-height:20px;text-shadow:0 2px 4px #000;margin-top:5px;"></div>
            </div>
            <div id="btn-rest" class="iso-cult-btn" style="text-align:center;cursor:pointer;transition:.3s"><h3 style="font-family:var(--font-title);color:var(--gold-primary);margin:0;font-size:32px;text-shadow:0 0 10px rgba(251,191,36,0.5)">Rest</h3></div>
        </div>
        <div id="iso-stats-box" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;margin-top:40px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:25px;box-shadow:inset 0 0 30px rgba(0,0,0,0.8);"></div>
    </div>
    <div class="iso-stat-body">
        <div style="display:flex; justify-content:space-between; align-items:stretch; height:100%; width:100%; gap:20px;">
            <div class="iso-btn-action" id="btn-primary-skill" style="width:65px; height:100%; writing-mode:vertical-rl; text-orientation:upright; padding:20px 0; flex-shrink:0;"><span class="iso-btn-text" style="letter-spacing:10px; font-family:var(--font-data); font-weight:bold;">[Primary]</span></div>
            <div id="skill-content-center" style="flex:1; display:flex; align-items:center; justify-content:center; border:1px solid rgba(251,191,36,0.1); background:rgba(0,0,0,0.3); border-radius:4px; box-sizing:border-box; transition:0.3s;"><span style="font-family:var(--font-title); color:rgba(255,255,255,0.1); font-size:28px; letter-spacing:5px;">Technique Center</span></div>
            <div class="iso-btn-action" id="btn-passive-skill" style="width:65px; height:100%; writing-mode:vertical-rl; text-orientation:upright; padding:20px 0; flex-shrink:0;"><span class="iso-btn-text" style="letter-spacing:10px; font-family:var(--font-data); font-weight:bold;">[Passive]</span></div>
        </div>
    </div>
</div>

<div class="iso-relations-popup" id="iso-relations-popup" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(4, 5, 8, 0.98); z-index:11000; justify-content:center; align-items:center; backdrop-filter:blur(12px); font-family:var(--font-data);">
    <div class="iso-relations-backdrop" id="relations-close-bg" style="position:absolute; width:100%; height:100%;"></div>
    <div class="iso-relations-body" style="position:relative; width:92vw; max-width:1300px; height:88vh; max-height:850px; background:rgba(10, 14, 20, 0.96); border:2px solid var(--gold-primary); border-radius:4px; box-shadow:0 0 60px rgba(0,0,0,0.9), inset 0 0 50px rgba(251,191,36,0.15); display:flex; flex-direction:column; overflow:hidden; z-index:11005;">
        <div class="wuxia-screen-corner corner-top-left"></div><div class="wuxia-screen-corner corner-top-right"></div><div class="wuxia-screen-corner corner-bottom-left"></div><div class="wuxia-screen-corner corner-bottom-right"></div>
        <div class="iso-stat-close" id="relations-close" style="top:20px; right:25px;">✕</div>
        <div class="relations-title-bar" style="height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:1px double rgba(251, 191, 36, 0.4); background:rgba(0,0,0,0.65); padding-top:5px; z-index:10;">
            <h2 style="font-family:var(--font-title); color:var(--gold-primary); margin:0; letter-spacing:6px; font-size:26px; text-transform:uppercase; text-shadow:0 0 15px var(--gold-glow); font-weight:bold;">Manifest of Karma & Relations</h2>
            <div style="font-family:var(--font-korean); font-size:14px; color:#8a7a5f; margin-top:2px; letter-spacing:1px; text-shadow:1px 1px 0px #000;">因果法网 • The silk thread of fate binds the mortal and immortal realms alike.</div>
        </div>
        <div class="relations-graph-area" id="relations-graph-area" style="flex:1; position:relative; overflow:hidden;">
            <div class="wuxia-ink-bg"></div>
            <svg id="relations-svg-lines" style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none; z-index:1;"></svg>
            <div id="relations-nodes-wrap" style="position:absolute; width:100%; height:100%; top:0; left:0; z-index:2;"></div>
            <div class="wuxia-relations-tooltip" id="wuxia-relations-tooltip"><h4 id="tooltip-title">Spiritual Resonance</h4><p id="tooltip-desc">Focus divine sense on a karma node to reveal their story.</p></div>
        </div>
    </div>
</div>

<div class="iso-float-btn chunk-gen-btn" id="iso-chunk-btn" style="bottom:165px;left:25px;display:none" title="Generate New Chunk"><span class="material-symbols-outlined">add_location_alt</span></div>
<div class="iso-ui-popup" id="chunk-gen-popup" style="bottom:20px;right:20px;left:auto;flex-direction:column;align-items:flex-start;width:350px;border-color:var(--gold-primary);z-index:9000;">
    <span id="chunk-popup-text" style="width:100%;line-height:1.4;color:#10b981;"></span>
    <div style="display:flex;gap:10px;width:100%;justify-content:flex-end;margin-top:10px;"><button class="iso-float-btn" id="chunk-copy-btn" style="position:relative;width:40px;height:40px;bottom:0;left:0" title="Copy"><span class="material-symbols-outlined" style="font-size:18px">content_copy</span></button></div>
</div>

<div class="iso-ui-popup" id="save-code-popup" style="top:50%;left:50%;transform:translate(-50%,-50%);flex-direction:column;align-items:flex-start;width:600px;border-color:var(--gold-primary);z-index:9999;display:none;background:rgba(10,15,20,0.98);box-shadow:0 0 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(251,191,36,0.2);">
    <h3 style="color:var(--gold-primary);margin:0 0 10px 0;font-family:var(--font-title);font-size:28px;">Update AI Context</h3>
    <p style="color:#d1d5db;font-family:var(--font-data);margin-top:0;font-size:16px;">Copy the text below and paste it into the AI prompt to update your world:</p>
    <span id="save-code-text" style="width:100%;line-height:1.4;color:#10b981;white-space:pre-wrap;max-height:50vh;overflow-y:auto;font-family:monospace;background:rgba(0,0,0,0.5);padding:15px;border:1px solid rgba(255,255,255,0.1);border-radius:4px;user-select:all;"></span>
    <div style="display:flex;gap:15px;width:100%;justify-content:flex-end;margin-top:20px;">
        <button class="iso-btn-action" id="save-code-copy" style="width:140px;height:45px;"><span class="iso-btn-text" style="font-size:15px">COPY TEXT</span></button>
        <button class="iso-btn-action" id="save-code-close" style="width:120px;height:45px;"><span class="iso-btn-text" style="font-size:15px">CLOSE</span></button>
    </div>
</div>

${makeSystemPopup('health', 'Physical Vessel', '#ef4444', 'rgba(239,68,68,0.2)', 'The state of your mortal body and bloodline.', '• Blood Vitality: Stable<br>• Meridian Flow: Unobstructed<br>• Hidden Injuries: None detected')}
${makeSystemPopup('astral', 'Astral Alignment', '#38bdf8', 'rgba(56,189,248,0.2)', 'Observation of the heavenly bodies and celestial Qi.', '• Dominant Element: Water / Ice<br>• Celestial Phenomena: Calm<br>• Yin-Yang Balance: Leaning towards Yin (Night)')}

<div id="iso-rotator-ui" style="position:fixed; top:20px; left:20px; width:220px; background:rgba(0,0,0,0.85); border:1px solid var(--gold-primary); border-radius:8px; padding:15px; z-index:10000; color:#fff; font-family:var(--font-data); display:none; flex-direction:column; gap:10px; box-shadow:0 0 20px rgba(0,0,0,0.5);">
    <div style="font-family:var(--font-title); color:var(--gold-primary); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-bottom:5px;">STRUCTURE ROTATOR</div>
    <div style="font-size:11px; color:#888;" id="rotator-target-info">No Target Selected</div>
    ${[['sc', 'Scale', 0.1, 3, 0.05, 1, '1.0'], ['ox', 'Off X', -100, 100, 1, 0, '0'], ['oy', 'Off Y', -100, 100, 1, 0, '0'], ['rt', 'Rot', -180, 180, 1, 0, '0']].map(([i, l, m, M, s, v, t]) => `<div class="rot-row">${l}: <input type="range" id="rot-${i}" min="${m}" max="${M}" step="${s}" value="${v}"><span id="val-${i}">${t}</span></div>`).join('')}
    <div class="rot-row">Flip: <input type="checkbox" id="rot-fl"></div>
    <div style="margin-top:10px; padding:8px; background:rgba(0,0,0,0.5); border-radius:4px; font-family:monospace; font-size:10px; color:#10b981; word-break:break-all;" id="rotator-output"></div>
</div>`);

            // Unified close binder
            const bindClose = (btnId, panel) => { if ($(btnId)) $(btnId).onclick = stopPropagation(() => panel.style.display = 'none'); };

            const sp = $('iso-stat-popup'), bds = $$('.iso-stat-body'), tbs = $$('.iso-stat-section'), relPopup = $('iso-relations-popup');

            $('hud-sanity-diamond').onclick = stopPropagation(() => { sp.classList.add('visible'); if (relPopup) relPopup.style.display = 'none'; });
            bindClose('stat-close', sp);
            $('stat-close').addEventListener('click', stopPropagation(() => sp.classList.remove('visible')));

            tbs.forEach((t, i) => t.onclick = stopPropagation(() => {
                tbs.forEach((x, j) => { x.classList.toggle('active', j === i); bds[j].classList.toggle('active', j === i); });
            }));

            if ($('btn-relations') && relPopup) {
                $('btn-relations').onclick = stopPropagation(() => { sp.classList.remove('visible'); relPopup.style.display = 'flex'; this.renderRelationsGraph(); });
            }

            bindClose('relations-close', relPopup);
            $('relations-close-bg').onclick = stopPropagation(() => relPopup.style.display = 'none');
            window.addEventListener('resize', () => { if (relPopup && relPopup.style.display === 'flex') this.renderRelationsGraph(); });

            this.ui.regionBtn = $('iso-region-btn');
            this.ui.regionBtn.onclick = () => {
                this.showRegions = !this.showRegions;
                this.ui.regionBtn.classList.toggle('active', this.showRegions);
                this.regionAnimStart = performance.now();
            };

            this.ui.missionBtn = $('iso-mission-btn'); this.ui.missionPanel = $('iso-mission-panel');
            this.ui.missionBtn.onclick = stopPropagation(() => this.ui.missionPanel.classList.toggle('visible'));
            $('mission-close').onclick = stopPropagation(() => this.ui.missionPanel.classList.remove('visible'));
            $('iso-sense-btn').onclick = () => this.triggerSense();

            $('iso-chunk-btn').onclick = stopPropagation(() => {
                if ($('iso-chunk-btn').classList.contains('disabled-btn')) return;
                this.chunkPlacementMode = !this.chunkPlacementMode;
                document.body.classList.toggle('hide-main-ui', this.chunkPlacementMode);
                this.ghostChunk = null; $('chunk-gen-popup').classList.remove('visible');
            });

            const copyToClip = txt => {
                const t = document.createElement("textarea"); t.value = txt; t.style.cssText = "position:fixed;left:-9999px";
                document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
            };

            $('chunk-copy-btn').onclick = () => {
                copyToClip($('chunk-popup-text').textContent);
                $('chunk-gen-popup').classList.remove('visible'); this.chunkPlacementMode = false;
                document.body.classList.remove('hide-main-ui'); $('iso-chunk-btn').classList.add('disabled-btn');
            };

            $('save-code-copy').onclick = () => {
                copyToClip($('save-code-text').textContent);
                const btnText = $('save-code-copy').querySelector('.iso-btn-text');
                btnText.textContent = 'COPIED!'; setTimeout(() => btnText.textContent = 'COPY TEXT', 2000);
            };
            $('save-code-close').onclick = () => $('save-code-popup').style.display = 'none';

            // Consolidated trigger setup
            const setupDetailTrigger = (cid, pid, closeId) => { if ($(cid) && $(pid)) { $(cid).onclick = stopPropagation(() => $(pid).style.display = 'flex'); bindClose(closeId, $(pid)); } };
            setupDetailTrigger('hp-bar-container', 'health-popup', 'health-popup-close');
            setupDetailTrigger('iso-solar-wrapper', 'astral-popup', 'astral-popup-close');

            this.ui.herbPanel = $('iso-herb-panel');
            this.ui.herbPanel.onclick = e => {
                if (e.target.closest('.iso-cycle-btn')) return this.cycleEntity();
                const b = e.target.closest('.iso-btn-action');
                if (!b) return;
                this.actionActive = !this.actionActive; b.classList.toggle('active', this.actionActive);

                if (this.actionActive) {
                    const verbs = { chop: 'chopping tree', gather: 'gathering herb', water: 'collecting water', mine: 'mining minerals', interact: 'observing beast' };
                    let verb = verbs[b.id.split('-')[1]] || 'excavating soil';
                    this.ui.popupText.textContent = `[SYSTEM] Entity is ${verb} at its location. Awaiting logic server response.`;
                    this.ui.popup.classList.add('visible');
                } else {
                    this.ui.popup.classList.remove('visible');
                }
            };

            this.ui.popup = $('iso-ui-popup'); this.ui.popupText = $('popup-text');
            $('copy-btn').onclick = () => copyToClip(this.ui.popupText.textContent);

            const closeBook = () => $('iso-book-modal').classList.remove('visible');
            $('iso-book-close-bg').onclick = $('iso-book-close-btn').onclick = closeBook;
            $('iso-book-prev').onclick = () => { if (this.currentBookPage > 0) { this.currentBookPage--; this.renderBookPage(); } };
            $('iso-book-next').onclick = () => { if (this.currentBook && this.currentBookPage < this.currentBook.pages.length) { this.currentBookPage++; this.renderBookPage(); } };

            this.ui.msgContainer = $('iso-msg-container');
            const bc = $('btn-cultivate'), br = $('btn-rest');

            const updateCultState = () => {
                const c = this.cultivationState === 'CULTIVATING', r = this.cultivationState === 'RESTING';
                bc.classList.toggle('active', c); bc.classList.toggle('disabled', r);
                br.classList.toggle('active', r); br.classList.toggle('disabled', c);
            };

            bc.onclick = stopPropagation(() => {
                this.cultivationState = this.cultivationState === 'CULTIVATING' ? 'IDLE' : 'CULTIVATING';
                updateCultState();
                if (this.cultivationState === 'CULTIVATING') {
                    this.ui.popupText.textContent = "User has chosen to cultivate. Based on User talent, increase dantian progress.";
                    this.ui.popup.classList.add('visible');
                } else this.ui.popup.classList.remove('visible');
            });

            br.onclick = stopPropagation(() => { this.cultivationState = this.cultivationState === 'RESTING' ? 'IDLE' : 'RESTING'; updateCultState(); });
            this.setupInventory();
        },

        attachEvents() {
            window.addEventListener('resize', () => this.resize());
            this.canvas.addEventListener('mousedown', e => {
                if (e.button === 0 && !this.chunkPlacementMode) {
                    if (this.hoveredTile) {
                        const k = `${this.hoveredTile.chunkId},${this.hoveredTile.lx},${this.hoveredTile.ly}`;
                        this.checkContextualUI(k);
                    }
                }
                if (e.button === 2) {
                    if (this.chunkPlacementMode || this.ghostChunk) {
                        this.chunkPlacementMode = false;
                        document.body.classList.remove('hide-main-ui');
                        $('chunk-gen-popup').classList.remove('visible');
                        $('iso-chunk-btn').classList.remove('disabled-btn');
                        this.ghostChunk = null;
                    }
                    return;
                }
                if (e.button === 0 && this.chunkPlacementMode && this.ghostChunk && !this.ghostChunk.locked) {
                    this.ghostChunk.locked = true;
                    $('chunk-popup-text').textContent = `User is creating a new chunk. This means user has completed atleast 1 Main story mission of the chunk. Proccede to generate a New Chunk In the ${this.ghostChunk.cx},${this.ghostChunk.cy} of the Chunk ${this.ghostChunk.sourceId}`;
                    $('chunk-gen-popup').classList.add('visible');
                    return;
                }
                this.lastMouse = { x: e.clientX, y: e.clientY };
                if (!e.button) this.isDragging = true;
            });
            window.addEventListener('mouseup', () => this.isDragging = false);
            window.addEventListener('mousemove', e => {
                this.mousePos = { x: e.clientX, y: e.clientY };
                if (this.chunkPlacementMode && this.player && (!this.ghostChunk || !this.ghostChunk.locked)) {
                    const mg = this.screenToGrid(e.clientX, e.clientY);
                    const mx = Math.floor(mg.gx / 10), my = Math.floor(mg.gy / 10);

                    let bestDist = Infinity, sourceCfg = null, sourceId = null;
                    Object.entries(this.chunkConfigs).forEach(([id, cfg]) => {
                        const d = this.dist(mx, my, cfg.cx, cfg.cy);
                        if (d < bestDist) { bestDist = d; sourceCfg = cfg; sourceId = id; }
                    });

                    if (sourceCfg) {
                        const cx = sourceCfg.cx, cy = sourceCfg.cy;
                        const dx = mg.gx - (cx * 10 + 4.5), dy = mg.gy - (cy * 10 + 4.5);
                        let dir = '', tcx = cx, tcy = cy;
                        if (Math.abs(dx) > Math.abs(dy)) { if (dx > 0) { dir = 'East'; tcx = cx + 1; } else { dir = 'West'; tcx = cx - 1; } }
                        else { if (dy > 0) { dir = 'South'; tcy = cy + 1; } else { dir = 'North'; tcy = cy - 1; } }

                        const isOccupied = Object.values(this.chunkConfigs).some(cfg => cfg.cx === tcx && cfg.cy === tcy && !cfg.hidden);
                        if (tcx >= 1 && tcy >= 1 && tcx <= 10 && tcy <= 10 && !isOccupied) {
                            this.ghostChunk = { cx: tcx, cy: tcy, dir, sourceId, locked: false };
                        } else {
                            this.ghostChunk = null;
                        }
                    }
                }
                if (this.isDragging && (!this.chunkPlacementMode || (this.ghostChunk && this.ghostChunk.locked))) {
                    const dx = e.clientX - this.lastMouse.x, dy = e.clientY - this.lastMouse.y;
                    this.targetCamera.x += dx; this.targetCamera.y += dy; this.camera.x += dx * 0.8; this.camera.y += dy * 0.8;
                    this.lastMouse = { x: e.clientX, y: e.clientY };
                    this.setMoving();
                }
            });
            this.canvas.addEventListener('wheel', e => {
                e.preventDefault();
                this.targetCamera.zoom = Math.min(Math.max(this.targetCamera.zoom - e.deltaY * 0.001, 0.5), 3.0);
                this.setMoving();
            }, { passive: false });
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        },

        resize() { if (this.canvas) { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; } },

        updateDantianUI() {
            const fill = $('dantian-fill');
            if (fill) fill.style.height = `${this.dantianProgress}%`;
        },

        updateRealmUI() {
            const el = $('iso-realm-text');
            if (el) el.textContent = this.realm;
        },

        updateStatsUI(stats) {
            const box = $('iso-stats-box');
            if (!box) return;
            box.innerHTML = Object.entries(stats).map(([key, val]) => `
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:110px;background:rgba(251,191,36,0.05);border:1px solid var(--gold-dark);padding:4px 8px;border-radius:4px;font-family:var(--font-data);color:var(--gold-primary);text-transform:uppercase;font-size:12px;text-align:center;font-weight:bold;text-shadow:1px 1px 2px #000;">${key}</div>
                    <div style="flex:1;height:14px;background:rgba(255,255,255,0.05);border-radius:6px;position:relative;overflow:hidden;box-shadow:inset 0 0 5px rgba(0,0,0,0.8);">
                        <div style="width:${Math.min((val / 500) * 100, 100)}%;height:100%;background:linear-gradient(90deg, rgba(180,83,9,0.8), var(--gold-primary));border-radius:6px 2px 6px 2px;clip-path:polygon(0 0, 96% 10%, 100% 50%, 94% 90%, 0 100%);box-shadow: 0 0 8px var(--gold-glow);"></div>
                    </div>
                    <div style="font-family:var(--font-data);color:#fff;font-weight:bold;min-width:35px;text-align:right;">${val}</div>
                </div>
            `).join('');
        },

        updateStatusUI() {
            const syncBar = (barId, val, maxVal, isPercent = false) => {
                const pct = Math.max(0, Math.min(100, (val / (maxVal || 1)) * 100));
                const fill = $(`${barId}-bar-fill`);
                if (fill) fill.style.width = `${pct}%`;
                const glow = $(`${barId}-bar-glow`);
                if (glow) glow.style.left = `calc(${pct}% - 2px)`;
                const text = $(`${barId}-val`);
                if (text) text.textContent = isPercent ? `${Math.round(pct)}%` : Math.round(val);
            };
            [
                { barId: 'hp', val: this.health, max: this.maxHealth },
                { barId: 'qi', val: this.qi, max: this.maxQi },
                { barId: 'stamina', val: this.stamina, max: this.maxStamina, percent: true },
                { barId: 'mood', val: this.mood, max: this.maxMood, percent: true }
            ].forEach(({ barId, val, max, percent }) => syncBar(barId, val, max, percent));

            const se = $('sanity-fill'); if (se) se.style.height = `${Math.max(0, Math.min(100, (this.sanity / (this.maxSanity || 1)) * 100))}%`;
            const sv = $('sanity-val'); if (sv) sv.textContent = Math.round(this.sanity);
        },

        updateClockUI() {
            const p = n => String(n).padStart(2, '0');
            const d = $('clock-day'), m = $('clock-month'), y = $('clock-year');
            if (d) d.textContent = p(this.time.day);
            if (m) m.textContent = p(this.time.month);
            if (y) y.textContent = this.time.year;
        },

        triggerShake() { this.shakeIntensity = 15; },

        triggerSense() {
            if (!this.player || this.state === 'SENSE_ACTIVE') return;
            this.stamina = Math.max(0, this.stamina - 5); this.updateStatusUI();
            const b = $('iso-sense-btn'); b.classList.add('active'); setTimeout(() => b.classList.remove('active'), 1000);
            [this.state, this.animStartTime, this.validMoves] = ['SENSE_ACTIVE', performance.now(), []];
            const { lx, ly, chunkId } = this.player;

            Object.values(this.chunks).forEach(t => {
                if (t.chunkId === chunkId) {
                    const d = this.dist(t.lx, t.ly, lx, ly);
                    if (d <= 3) this.validMoves.push({ key: `${t.chunkId},${t.lx},${t.ly}`, tile: t, dist: d });
                }
            });

            const entities = [];
            this.entityDataSources.forEach(([type, store]) => {
                Object.entries(store).forEach(([k, d]) => {
                    const [cid, tlx, tly] = k.split(',').map(Number);
                    if (cid === chunkId) {
                        const dist = this.dist(tlx, tly, lx, ly);
                        if (dist <= 3) entities.push({ type, data: d, dist });
                    }
                });
            });

            this.currentTileEntities = entities.sort((a, b) => a.dist - b.dist);
            this.currentEntityIndex = 0;
            this.lastEntityIndex = -1;
            this.viewingSenseResults = true;
            this.lastUIKey = `${chunkId},${lx},${ly}`;
            this.checkContextualUI();

            this.triggerShake();
            setTimeout(() => { if (this.state === 'SENSE_ACTIVE') this.state = 'IDLE'; }, 3000);
        },

        cycleEntity() {
            if (this.currentTileEntities.length <= 1) return;
            const panel = this.ui.herbPanel;
            panel.classList.add('swapping-out');
            setTimeout(() => {
                this.currentEntityIndex = (this.currentEntityIndex + 1) % this.currentTileEntities.length;
                this.checkContextualUI();
                panel.classList.remove('swapping-out');
                panel.classList.add('swapping-in');
                setTimeout(() => panel.classList.remove('swapping-in'), 600);
            }, 300);
        },

        checkContextualUI(forcedKey = null) {
            if (!this.player || !this.ui.herbPanel) return;
            const k = forcedKey || `${this.player.chunkId},${this.player.lx},${this.player.ly}`;
            const bits = k.split(',').map(Number);
            const t = this.getTile(bits[0], bits[1], bits[2]);
            if (t?.assetHidden) t.assetHidden = false;

            // Check if player is standing on a Forest card tile (base or back tile)
            let forestEntity = null;
            const pKey = `${this.player.chunkId},${this.player.lx},${this.player.ly}`;
            const pTile = this.getTile(this.player.chunkId, this.player.lx, this.player.ly);
            let forestKey = pKey;
            if (this.forestData && this.forestData[pKey]) {
                forestEntity = this.forestData[pKey];
            } else if (pTile && pTile.forestBaseKey && this.forestData && this.forestData[pTile.forestBaseKey]) {
                forestEntity = this.forestData[pTile.forestBaseKey];
                forestKey = pTile.forestBaseKey;
            }

            if (forestEntity) {
                const col = '#22c55e';
                const fName = forestEntity.name || 'Mysterious Forest';
                const fBeasts = forestEntity.beasts || 'None';
                const fHerbs = forestEntity.herbs || 'None';
                const fQi = forestEntity.qi !== undefined ? forestEntity.qi : 0;
                
                let qiZonesText = '';
                if (fQi === 0) qiZonesText = '1-2 Qi zones';
                else if (fQi >= 1 && fQi <= 10) qiZonesText = `${fQi * 5} Qi zones`;
                else qiZonesText = `${fQi} (Custom)`;

                this.ui.herbPanel.innerHTML = `
                    <div class="herb-header">
                        <div class="herb-title">
                            <span class="material-symbols-outlined" style="font-size:28px;color:${col}">forest</span>
                            ${fName}
                        </div>
                        <div class="herb-subtitle" style="color:#d1d5db; margin-top:5px; line-height:1.4;">
                            <strong>Beasts:</strong> ${fBeasts}<br>
                            <strong>Herbs:</strong> ${fHerbs}<br>
                            <strong>QI Density:</strong> Scale ${fQi} (${qiZonesText})
                        </div>
                    </div>
                    <div class="herb-lore" style="margin-top:8px;">"A dense, whispering forest where ancient Qi gathers and dangerous beasts roam."</div>
                    <div class="iso-btn-action" id="action-enter-forest" style="margin-top:12px; height:40px; border-color:${col}; display:flex; align-items:center; justify-content:center;">
                        <span class="material-symbols-outlined" style="font-size:20px;color:${col}">login</span>
                        <span class="iso-btn-text" style="color:${col}; margin-left:6px;">ENTER FOREST</span>
                    </div>
                `;
                this.ui.herbPanel.classList.add('visible');
                
                const enterBtn = document.getElementById('action-enter-forest');
                if (enterBtn) {
                    enterBtn.onclick = stopPropagation(() => {
                        this.ui.popupText.textContent = `[SYSTEM] Entering the forest: ${fName}. Awaiting logic server response.`;
                        this.ui.popup.classList.add('visible');
                    });
                }
                return;
            }

            if (k !== this.lastUIKey) {
                this.viewingSenseResults = false;
                this.currentEntityIndex = 0;
            }

            let entities = [];
            if (this.viewingSenseResults) {
                entities = this.currentTileEntities;
            } else {
                this.entityDataSources.forEach(([type, store]) => {
                    if (type === 'B' || type === 'npcs') {
                        Object.entries(this.npcs).forEach(([nk, nd]) => {
                            if (nd.hidden) return;
                            let matchesKey = nk.split('|').map(s => s.trim()).some(part => part === k);
                            if (matchesKey) {
                                entities.push({ type: nd.type || 'B', data: nd });
                            }
                        });
                    } else {
                        if (store[k] && !store[k].hidden) entities.push({ type: type, data: store[k] });
                    }
                });
                if (this.gateStructures[k] && !this.gateStructures[k].hidden) entities.push({ type: 'GATE', data: this.gateStructures[k] });
                else if (this.towerStructures[k] && !this.towerStructures[k].hidden) entities.push({ type: 'TOWER', data: this.towerStructures[k] });
                else if (this.specificWalls[k] && !this.specificWalls[k].hidden) entities.push({ type: 'WALL', data: this.specificWalls[k] });
            }

            if (k === this.lastUIKey && this.actionActive === this.lastActionState && this.currentTileEntities.length === entities.length && this.currentEntityIndex === this.lastEntityIndex) return;

            this.lastUIKey = k;
            this.lastActionState = this.actionActive;
            if (!this.viewingSenseResults) this.currentTileEntities = entities;
            this.lastEntityIndex = this.currentEntityIndex;

            if (entities.length > 0) {
                const current = entities[this.currentEntityIndex] || entities[0], { data: d, type: ty } = current;
                const isBeastType = ty === 'B' || (global.CONFIG.NPC_BASE_MAP && global.CONFIG.NPC_BASE_MAP[ty]?.endsWith('Evo'));
                const colors = { H: '#10b981', T: '#fbbf24', W: '#3b82f6', S: '#a855f7', G: '#f43f5e', MI: '#eab308', B: '#f87171', IG: '#f87171', WALL: '#94a3b8', TOWER: '#cbd5e1', GATE: '#f8fafc' };
                const cCol = colors[ty] || (isBeastType ? '#f87171' : '#f8fafc');
                
                let pts = d.name?.split('|').map(x => x.trim()) || ['Unknown'], age = pts[0], n = pts[1] || pts[0], s = CONFIG.SYMBOL_MAP[pts[2] || (ty === 'H' ? 'Spirit' : (ty === 'T' ? 'Wood' : (ty === 'W' ? 'Water' : (ty === 'S' ? 'Earth' : (isBeastType ? 'Pets' : 'Poison')))))] || pts[2];
                if (['W', 'S', 'G', 'MI', 'IG', 'WALL', 'TOWER', 'GATE'].includes(ty) || isBeastType) {
                    n = d.name || (ty === 'WALL' ? 'City Wall' : ty === 'TOWER' ? 'Corner Watchtower' : ty === 'GATE' ? 'City Gate' : 'Beast');
                    s = { W: 'water_drop', S: 'landscape', G: 'bug_report', MI: 'layers', IG: 'shield_person', WALL: 'shadow', TOWER: 'fort', GATE: 'door_front' }[ty] || 'pets';
                }

                const act = isBeastType ? ['interact', 'Observe Beast', 'visibility'] : (ty === 'IG' ? ['talk', 'Talk to Guard', 'chat_bubble'] : { H: ['gather', 'Harvest Flora', 'front_hand'], T: ['chop', 'Fell Timber', 'hardware'], W: ['water', 'Collect Water', 'water_bottle'], S: ['excavate', 'Excavate Soil', 'rebase'], G: ['capture', 'Refine Gu', 'pest_control'], MI: ['mine', 'Mine Mineral', 'hardware'], TOWER: ['garrison', 'Enter Tower', 'visibility'] }[ty]);

                let extraInfo = '';
                if (['WALL', 'TOWER', 'GATE'].includes(ty)) {
                    extraInfo = `<div class="herb-subtitle">Quality: ${d.quality || 'Stone'} | HP: ${d.hp || '100/100'}</div>
                                 <div class="herb-subtitle" style="color: #fbbf24; font-size:12px;">Dir: ${d.direction || 'N'}</div>`;
                    if (ty === 'GATE') extraInfo += `<div class="herb-subtitle" style="color:#60a5fa">State: ${d.state || 'Closed'}</div>`;
                } else if (isBeastType || ty === 'IG') {
                    const npcAge = d.age || age;
                    extraInfo = `<div class="herb-subtitle">Age: ${npcAge} | Realm: ${d.realm || 'Mortal'}</div>`;
                    if (d.stage) {
                        extraInfo += `<div class="herb-subtitle" style="color:#fbbf24">Evolution Stage: ${d.stage} / 5</div>`;
                    }
                    if (d.personality && d.personality.length > 0) {
                        extraInfo += `<div class="npc-tags">
                            ${d.personality.map(p => `<div class="npc-tag" style="background:${p.color || '#666'}; border-color:${p.color || '#fff'}; opacity:${0.3 + ((p.influence || 5) / 10) * 0.7};">${p.tag}</div>`).join('')}
                        </div>`;
                    }
                    extraInfo += `<div class="herb-subtitle" style="color:#d1d5db; margin-top:5px;">Race: ${d.race || (isBeastType ? 'Beast' : 'Human')} | Tile: ${k}</div>`;
                } else if (!['W', 'S', 'G', 'MI'].includes(ty)) {
                    extraInfo = `<div class="herb-subtitle">Age: ${age} Cycles</div>`;
                } else if (ty === 'G') {
                    extraInfo = `<div class="herb-subtitle">Type: ${d.type}</div>`;
                } else if (ty === 'MI') {
                    extraInfo = `<div class="herb-subtitle">Type: ${d.type} | Purity: ${d.purity} | Amount: ${d.amount}</div>`;
                }

                this.ui.herbPanel.innerHTML = `${entities.length > 1 ? `<div class="iso-cycle-btn" title="Cycle Entities"><span class="material-symbols-outlined">sync</span><span class="cycle-count">${this.currentEntityIndex + 1}/${entities.length}</span></div>` : ''}<div class="herb-header"><div class="herb-title"><span class="material-symbols-outlined" style="font-size:28px;color:${cCol}">${s}</span>${n}</div>${extraInfo}</div><div class="herb-lore">"${d.description || d.lore || 'Ancient energies pulse within.'}"</div>${d.obtainable ? `<div style="margin-top:5px"><span style="font-family:var(--font-title);font-size:14px;color:var(--gold-primary)">Yields:</span><div class="obtain-list">${d.obtainable.split(',').map(x => `<span class="obtain-item">${x.trim()}</span>`).join('')}</div></div>` : ''}${d.requirement ? `<div style="margin-top:5px"><span style="font-family:var(--font-title);font-size:14px;color:#ef4444">Requirement:</span><div style="font-family:var(--font-data);font-size:14px;color:#fff;background:rgba(239,68,68,0.1);padding:4px 8px;border-radius:4px;border:1px solid rgba(239,68,68,0.2)">${d.requirement}</div></div>` : ''}${ty === 'H' && d.rank ? `<div style="font-family:var(--font-data);font-size:15px;color:#a1a1aa">Quality Rank: <strong style="color:#fff">${d.rank}</strong></div>` : ''}${act ? `<div class="iso-btn-action ${this.actionActive ? 'active' : ''}" id="action-${act[0]}"><span class="material-symbols-outlined" style="font-size:20px">${act[2]}</span><span class="iso-btn-text">${act[1]}</span></div>` : ''}`;
                this.ui.herbPanel.classList.add('visible');
            } else {
                this.ui.herbPanel.classList.remove('visible');
                if (this.ui.popup) this.ui.popup.classList.remove('visible');
            }
        },

        openBook(code) {
            const skill = [...(this.skills.active || []), ...(this.skills.passive || [])].find(s => s.code === code);
            if (!skill) return;
            this.currentBook = skill;
            this.currentBookPage = 0;
            this.renderBookPage();
            $('iso-book-modal').classList.add('visible');
        },

        renderBookPage() {
            const skill = this.currentBook;
            const container = $('iso-book-pages');
            const prev = $('iso-book-prev');
            const next = $('iso-book-next');

            prev.style.display = this.currentBookPage > 0 ? 'block' : 'none';
            next.style.display = this.currentBookPage < skill.pages.length ? 'block' : 'none';

            if (this.currentBookPage === 0) {
                container.innerHTML = `
                    <div class="book-title-page">
                        <div class="book-rank">${skill.rank}</div>
                        <h1>${skill.name}</h1>
                        <div class="book-meta"><span>Type:</span> ${skill.type.toUpperCase()} | <span>Method:</span> ${skill.method.toUpperCase()}</div>
                        <div class="book-req"><span>Requirement:</span> ${skill.req}</div>
                        <div class="book-desc">${skill.description}</div>
                    </div>`;
            } else {
                const pageIdx = this.currentBookPage - 1;
                const pageData = skill.pages[pageIdx];

                if (!pageData) {
                    container.innerHTML = `<div class="book-page-content blank">Blank Page</div>`;
                    return;
                }

                let prog = 0;
                if (pageIdx < skill.progressPageIdx) prog = 100;
                else if (pageIdx === skill.progressPageIdx) prog = skill.progressVal;

                const isLocked = pageData.locked || (pageIdx > 0 && skill.pages[pageIdx - 1] && (pageIdx - 1) >= skill.progressPageIdx && skill.progressVal < 100);

                if (isLocked) {
                    container.innerHTML = `
                        <div class="book-page-content locked">
                            <span class="material-symbols-outlined lock-icon">lock</span>
                            <div class="lock-text">Page Locked.<br>Comprehend previous pages to unlock.</div>
                        </div>`;
                } else {
                    const reqHtml = pageData.req ? `<div class="book-page-req"><span>Condition:</span> ${pageData.req}</div>` : '';
                    container.innerHTML = `
                        <div class="book-page-content">
                            <h2 class="book-page-title">Chapter ${this.currentBookPage}</h2>
                            ${reqHtml}
                            <div class="book-page-text">${pageData.text}</div>
                            ${pageIdx <= skill.progressPageIdx ? `
                            <div class="book-progress-container">
                                <div class="book-progress-bar" style="width: ${prog}%"></div>
                                <div class="book-progress-text">Comprehension: ${prog}%</div>
                            </div>` : ''}
                        </div>`;
                }
            }
        },

        renderRelationsGraph() {
            const popup = $('iso-relations-popup');
            if (!popup || popup.style.display === 'none') return;

            const graphArea = $('relations-graph-area');
            const svg = $('relations-svg-lines');
            const nodesWrap = $('relations-nodes-wrap');
            if (!graphArea || !svg || !nodesWrap) return;

            svg.innerHTML = '';
            nodesWrap.innerHTML = '';

            const prevParticles = graphArea.querySelectorAll('.qi-particle');
            prevParticles.forEach(p => p.remove());
            for (let k = 0; k < 18; k++) {
                const particle = document.createElement('div');
                particle.className = 'qi-particle';
                particle.style.left = `${5 + Math.random() * 90}%`;
                particle.style.top = `${10 + Math.random() * 80}%`;
                particle.style.animationDelay = `${Math.random() * 6}s`;
                particle.style.animationDuration = `${6 + Math.random() * 6}s`;
                graphArea.appendChild(particle);
            }

            const rect = graphArea.getBoundingClientRect();
            const W = rect.width || window.innerWidth * 0.9;
            const H = rect.height || window.innerHeight * 0.85 - 60;
            const cx = W / 2, cy = H / 2;

            nodesWrap.insertAdjacentHTML('beforeend', `
                <div class="wuxia-bagua-bg">
                    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                        <circle cx="50" cy="50" r="48" fill="#080a0e" stroke="var(--gold-primary)" stroke-width="1.5" />
                        <path d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2 Z" fill="rgba(251, 191, 36, 0.85)" />
                        <circle cx="50" cy="26" r="7" fill="rgba(251, 191, 36, 0.85)" />
                        <circle cx="50" cy="74" r="7" fill="#080a0e" />
                        <circle cx="50" cy="26" r="2.5" fill="#080a0e" />
                        <circle cx="50" cy="74" r="2.5" fill="rgba(251, 191, 36, 0.85)" />
                    </svg>
                </div>
                <div class="wuxia-bagua-outer"></div>
                <div class="player-center-node" style="position:absolute; left: ${cx}px; top: ${cy}px; transform: translate(-50%, -50%); z-index: 10; display:flex; flex-direction:column; align-items:center;">
                    <div style="position:relative; width: 84px; height: 84px; display:flex; justify-content:center; align-items:center;">
                        <div style="position:absolute; width: 100%; height: 100%; border: 2.5px solid var(--gold-primary); border-radius: 50%; box-shadow: 0 0 30px var(--gold-glow), inset 0 0 15px var(--gold-glow); animation: border-pulse 5s infinite ease-in-out;"></div>
                        <div style="width: 70px; height: 70px; border: 1.5px solid var(--gold-dark); border-radius: 50%; background: #07090d; display:flex; justify-content:center; align-items:center; overflow:hidden; z-index: 10;">
                            <img src="imh/P1.png" style="width:78%; height:78%; object-fit:contain; filter:drop-shadow(0 0 10px var(--gold-primary));">
                        </div>
                    </div>
                    <div style="margin-top: 12px; padding: 4px 16px; background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(10,12,18,0.95) 20%, rgba(10,12,18,0.95) 80%, rgba(0,0,0,0) 100%); border-left: 2px solid var(--gold-primary); border-right: 2px solid var(--gold-primary); color: #fff; font-family: var(--font-title); font-size: 15px; font-weight: bold; letter-spacing: 2px; text-shadow: 0 0 8px var(--gold-glow); white-space:nowrap;">
                        ${this.playerName || "Wandering Cultivator"}
                    </div>
                </div>`);

            const categorized = { friends: [], family: [], subordinates: [], disciples: [], enemy: [], lovers: [] };
            const relationsList = this.relations || [];
            relationsList.sort((a, b) => (a.Number ?? a.number ?? 999) - (b.Number ?? b.number ?? 999));

            relationsList.forEach(rel => {
                const type = (rel.type || rel.Type || "").toLowerCase().trim();
                if (type === 'friends' || type === 'friend') categorized.friends.push(rel);
                else if (type === 'family') categorized.family.push(rel);
                else if (type === 'disciples' || type === 'disciple') categorized.disciples.push(rel);
                else if (type === 'enemy' || type === 'enemies') categorized.enemy.push(rel);
                else if (type === 'subordinates' || type === 'subordinate') categorized.subordinates.push(rel);
                else if (type === 'lover' || type === 'lovers') categorized.lovers.push(rel);
            });

            const categories = [
                { key: 'friends', label: 'Friends', x: cx - W * 0.22, y: cy - H * 0.28, side: 'left', color: '#38bdf8' },
                { key: 'family', label: 'Family', x: cx - W * 0.32, y: cy, side: 'left', color: '#f97316' },
                { key: 'subordinates', label: 'Subordinates', x: cx - W * 0.22, y: cy + H * 0.28, side: 'left', color: '#10b981' },
                { key: 'disciples', label: 'Disciples', x: cx + W * 0.22, y: cy - H * 0.28, side: 'right', color: '#fbbf24' },
                { key: 'enemy', label: 'Enemy', x: cx + W * 0.32, y: cy, side: 'right', color: '#ef4444' },
                { key: 'lovers', label: 'Lover', x: cx + W * 0.22, y: cy + H * 0.28, side: 'right', color: '#ec4899' }
            ];

            categories.forEach(cat => {
                const list = categorized[cat.key] || [];
                const hasRelations = list.length > 0;
                const strokeOpacity = hasRelations ? 0.6 : 0.15;
                const strokeDash = hasRelations ? "none" : "4,4";

                svg.insertAdjacentHTML('beforeend', `
                    <line x1="${cx}" y1="${cy}" x2="${cat.x}" y2="${cat.y}" stroke="${cat.color}" stroke-width="4.5" style="opacity: ${strokeOpacity * 0.3}; filter: blur(3.5px);" />
                    <line x1="${cx}" y1="${cy}" x2="${cat.x}" y2="${cat.y}" stroke="${cat.color}" stroke-width="1.8" class="${hasRelations ? 'meridian-line-flow' : ''}" style="opacity: ${strokeOpacity}; stroke-dasharray: ${strokeDash};" />`);

                nodesWrap.insertAdjacentHTML('beforeend', `
                    <div class="category-header-node wuxia-talisman" style="position:absolute; left: ${cat.x}px; top: ${cat.y}px; transform: translate(-50%, -50%); z-index: 5; border-color: ${cat.color}; color: ${cat.color};">
                        <span>${cat.label}</span>
                        ${hasRelations ? `<span style="font-size: 10px; color: #a1a1aa; margin-left: 5px; opacity:0.85;">(${list.length})</span>` : ''}
                    </div>`);

                list.forEach((rel, i) => {
                    let npcX = cat.side === 'left' ? cat.x - 125 - (i * 95) : cat.x + 125 + (i * 95);
                    let npcY = cat.y;

                    svg.insertAdjacentHTML('beforeend', `
                        <line x1="${cat.x}" y1="${cat.y}" x2="${npcX}" y2="${npcY}" stroke="${cat.color}" stroke-width="2.5" style="opacity: 0.18; filter: blur(2px);" />
                        <line x1="${cat.x}" y1="${cat.y}" x2="${npcX}" y2="${npcY}" stroke="${cat.color}" stroke-width="0.8" style="opacity: 0.6;" />`);

                    const gender = (rel.Gender || rel.gender || "M").toUpperCase();
                    const avatarImg = gender === 'M' ? 'imh/MaleNPCProf.png' : 'imh/FemaleNPCProf.png';
                    const relationSummary = rel.Relation || rel.relation || '';
                    const npcName = rel.Name || rel.name || 'Unknown';

                    nodesWrap.insertAdjacentHTML('beforeend', `
                        <div class="npc-relation-card wuxia-soul-token" 
                             data-name="${npcName}" 
                             data-type="${cat.label}" 
                             data-relation="${relationSummary}"
                             data-color="${cat.color}"
                             style="position:absolute; left: ${npcX}px; top: ${npcY}px; transform: translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; z-index: 6;">
                            <div class="token-avatar-ring" style="width: 50px; height: 50px; border: 2.5px solid ${cat.color}; background: #080a0e; display:flex; justify-content:center; align-items:center; overflow:hidden; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.75);">
                                <img src="${avatarImg}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='imh/P1.png';">
                            </div>
                            <div style="position:relative; width: 2px; height: 10px; background: ${cat.color}; display:flex; justify-content:center; align-items:center;">
                                <div style="position:absolute; width: 4px; height: 4px; background:#fff; border-radius:50%; border:1px solid ${cat.color}; top:3px;"></div>
                            </div>
                            <div style="min-width: 72px; max-width: 90px; padding: 3px 6px; background: linear-gradient(135deg, #151820 0%, #06090e 100%); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 2px; text-align:center; color:#f3f4f6; font-family:var(--font-korean); font-size: 11px; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; box-shadow: 0 3px 6px rgba(0,0,0,0.5);">
                                ${npcName}
                            </div>
                        </div>`);
                });
            });

            const tokens = nodesWrap.querySelectorAll('.wuxia-soul-token');
            const tooltip = $('wuxia-relations-tooltip');
            const toolTitle = $('tooltip-title');
            const toolDesc = $('tooltip-desc');

            tokens.forEach(tok => {
                tok.onmouseenter = () => {
                    const name = tok.getAttribute('data-name');
                    const type = tok.getAttribute('data-type');
                    const relation = tok.getAttribute('data-relation');
                    const color = tok.getAttribute('data-color');
                    if (tooltip && toolTitle && toolDesc) {
                        toolTitle.textContent = `${name} (${type})`;
                        toolTitle.style.color = color;
                        toolDesc.textContent = relation || "No karma connection recorded.";
                        tooltip.classList.add('visible');
                    }
                };
                tok.onmouseleave = () => { if (tooltip) tooltip.classList.remove('visible'); };
            });
        },

        showItemDetails(i) {
            const craftTab = document.querySelector('.iso-craft-tab');
            const detailsHeader = document.querySelector('.iso-details-header');
            if (craftTab && craftTab.textContent.trim() === 'DETAILS') {
                craftTab.textContent = 'CRAFT';
                if (detailsHeader) detailsHeader.textContent = 'Item Details';
            }
            const c = $('iso-item-content'); if (!c) return;
            c.innerHTML = i ? `<h2>${i.name}</h2><div class="iso-details-icon"><span class="material-symbols-outlined" style="font-size:64px;color:#10b981">${CONFIG.SYMBOL_MAP[i.symbol] || 'inventory_2'}</span></div><p>"${i.description || 'No description available.'}"</p><div class="iso-details-btn-row"><button class="iso-btn-action" style="flex:1"><span class="iso-btn-text">USE</span></button><button class="iso-btn-action" style="flex:1"><span class="iso-btn-text">DROP</span></button></div>` : '<span class="material-symbols-outlined" style="font-size:80px;margin-bottom:20px;opacity:0.1;color:var(--gold-primary)">inventory_2</span><p style="font-size:20px;letter-spacing:1px;color:#888;">Select an item from your inventory or equipment to view its properties and lore.</p>';
        },

        craftItem(code) {
            const recipe = this.craftRecipes.find(r => r.code === code);
            if (!recipe) return;

            const reqs = [];
            const matches = [...recipe.recipe.matchAll(/(\d+)x\s+[^#]*?(#[A-Z0-9_]+)/gi)];
            for (const m of matches) reqs.push({ count: parseInt(m[1]), code: m[2] });

            let canCraft = true;
            const invCounts = {};
            this.inventory.forEach(item => { if (item && item.code) invCounts[item.code] = (invCounts[item.code] || 0) + 1; });

            for (const req of reqs) {
                if ((invCounts[req.code] || 0) < req.count) { canCraft = false; break; }
            }

            if (!canCraft) {
                this.ui.popupText.textContent = `[SYSTEM] Insufficient materials to craft ${recipe.name}.`;
                this.ui.popup.classList.add('visible');
                setTimeout(() => this.ui.popup.classList.remove('visible'), 3000);
                return;
            }

            for (const req of reqs) {
                let toConsume = req.count;
                for (let i = 0; i < this.inventory.length; i++) {
                    if (toConsume <= 0) break;
                    if (this.inventory[i] && this.inventory[i].code === req.code) {
                        this.inventory[i] = null;
                        toConsume--;
                    }
                }
            }

            const emptySlot = this.inventory.findIndex(i => i === null);
            if (emptySlot !== -1) {
                const newCode = '#I' + Math.floor(Math.random() * 10000) + '_' + Date.now().toString().slice(-4);
                this.inventory[emptySlot] = { code: newCode, name: recipe.name, description: recipe.desc, symbol: recipe.symbol };
                this.ui.popupText.textContent = `[SYSTEM] Successfully crafted ${recipe.name}! Update AI Context.`;

                let invStr = `AI TASK: I have successfully crafted "[ ${recipe.name} ]". The required materials were consumed. Please update your lore knowledge and replace my <Inventory> block in index.html with the following updated code to permanently save my progress:\n\n<Inventory>\n`;
                this.inventory.forEach(item => {
                    if (item && item.code) {
                        invStr += `    <Item(${item.code})>\n        Name : ${item.name}\n        Description : ${item.description}\n        Symbol : ${item.symbol}\n    </Item(${item.code})>\n`;
                    }
                });
                invStr += "</Inventory>";

                $('save-code-text').textContent = invStr;
                $('save-code-popup').style.display = 'flex';
            } else {
                this.ui.popupText.textContent = `[SYSTEM] Crafted ${recipe.name}, but inventory is full! Item dropped.`;
            }

            this.ui.popup.classList.add('visible');
            setTimeout(() => this.ui.popup.classList.remove('visible'), 3000);
            this.updateInventoryUI();
            this.renderCraftingUI();
        },

        renderCraftingUI() {
            const c = $('iso-item-content'); if (!c) return;
            if (!this.craftRecipes || this.craftRecipes.length === 0) {
                c.innerHTML = '<p style="margin-top:50px; color:#888; font-size:18px;">No crafting recipes available.</p>';
                return;
            }
            let html = '<div class="iso-craft-list">';
            this.craftRecipes.forEach(cr => {
                const displayRecipe = cr.recipe.replace(/\s*\([^)]*\)/g, '');
                html += `<div class="iso-craft-item">
                    <div class="iso-craft-header">
                        <span class="iso-craft-name">${cr.name}</span>
                        <span class="iso-craft-type">${cr.type}</span>
                    </div>
                    <div class="iso-craft-desc">"${cr.desc}"</div>
                    <div class="iso-craft-req"><strong>Req:</strong> ${cr.req}</div>
                    <div class="iso-craft-recipe"><strong>Recipe:</strong> ${displayRecipe}</div>
                    <button class="iso-btn-action craft-btn-exec" data-code="${cr.code}" style="margin-top:12px; height:36px; padding:0;"><span class="iso-btn-text" style="font-size:14px; letter-spacing:2px;">CRAFT</span></button>
                </div>`;
            });
            html += '</div>';
            c.innerHTML = html;

            c.querySelectorAll('.craft-btn-exec').forEach(btn => {
                btn.onclick = stopPropagation(() => this.craftItem(btn.dataset.code));
            });
        },

        updateMissionUI() {
            const container = $('unified-mission-list');
            if (!container) return;

            const mainMissions = this.missions?.main ? Object.entries(this.missions.main) : [];
            const sideMissions = this.missions?.side ? Object.entries(this.missions.side) : [];

            const allMissions = [
                ...mainMissions.map(([id, m]) => ({ ...m, id, sort: 1 })),
                ...sideMissions.map(([id, m]) => ({ ...m, id, sort: 2 }))
            ].sort((a, b) => a.sort - b.sort);

            container.innerHTML = allMissions.map(m => {
                const isMS = m.tag?.toUpperCase() === 'MS';
                return `
                    <div class="mission-card">
                        <div class="mission-card-header">
                            <div class="mission-tag ${isMS ? 'tag-ms' : 'tag-sq'}">${isMS ? 'MAIN STORY' : 'SIDE QUEST'}</div>
                            <span class="mission-title">${m.title}</span>
                            <span class="mission-difficulty">${m.reward?.includes('(') ? m.reward.split('(')[1].replace(')', '') : 'E'}</span>
                        </div>
                        <div class="mission-card-body">
                            <p class="mission-desc">${m.desc}</p>
                            <div class="mission-meta"><strong>Req:</strong> ${m.req}</div>
                            <div class="mission-meta"><strong>Reward:</strong> ${m.reward?.split('(')[0] || 'None'}</div>
                            <div class="mission-meta"><strong>Limit:</strong> ${m.time}</div>
                        </div>
                    </div>`;
            }).join('');
        },

        updateInventoryUI() {
            const setSlot = (el, it) => {
                if (!el) return;
                el.innerHTML = it ? `<span class="material-symbols-outlined" style="font-size:32px;color:var(--gold-primary)">${CONFIG.SYMBOL_MAP[it.symbol] || 'inventory_2'}</span>` : '';
                el.onclick = stopPropagation(() => this.showItemDetails(it));
            };
            $$('.iso-inv-slot').forEach((s, i) => setSlot(s, this.inventory[i]));
            ['head', 'torso', 'legs', 'weapon', 'accessory', 'feet'].forEach(k => setSlot(document.querySelector(`.iso-eq-slot[title="${k[0].toUpperCase() + k.slice(1)}"]`), this.equipment[k]));
        },

        setupInventory() {
            this.updateInventoryUI();
            const craftTab = document.querySelector('.iso-craft-tab');
            const detailsHeader = document.querySelector('.iso-details-header');
            if (craftTab && detailsHeader) {
                craftTab.onclick = stopPropagation(() => {
                    const isCrafting = craftTab.textContent.trim() === 'CRAFT';
                    craftTab.textContent = isCrafting ? 'DETAILS' : 'CRAFT';
                    detailsHeader.textContent = isCrafting ? 'Crafting Menu' : 'Item Details';
                    if (isCrafting) this.renderCraftingUI();
                    else this.showItemDetails(null);
                });
            }

            const pBtn = $('btn-primary-skill');
            const paBtn = $('btn-passive-skill');
            const center = $('skill-content-center');

            const renderSkillUI = (type) => {
                const isPrimary = type === 'primary';
                const crystalColor = isPrimary ? '#3b82f6' : '#10b981';
                const shadowColor = isPrimary ? 'rgba(59, 130, 246, 0.8)' : 'rgba(16, 185, 129, 0.8)';
                const title = isPrimary ? 'Primary Abilities' : 'Passive Traits';
                const skillsList = isPrimary ? (this.skills?.active || []) : (this.skills?.passive || []);

                const gridHtml = `<div style="display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:repeat(4, 1fr); gap:10px; padding:15px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; height:100%;">${Array(16).fill(0).map((_, i) => {
                    const sk = skillsList[i];
                    return sk ? `<div class="skill-book-slot filled" data-code="${sk.code}"><div class="skill-book-rank rank-${sk.rank.charAt(0)}">${sk.rank}</div><div class="skill-book-title">${sk.name}</div></div>`
                        : `<div class="skill-book-slot empty" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:4px; aspect-ratio:1; box-shadow:inset 0 0 10px rgba(0,0,0,0.8);"></div>`;
                }).join('')}</div>`;

                const boxesHtml = `<div style="display:flex; flex-direction:column; gap:15px; justify-content:center;">${Array(5).fill('<div style="width:45px; height:45px; background:rgba(0,0,0,0.6); border:1px solid ' + crystalColor + '; border-radius:4px; box-shadow:inset 0 0 10px ' + shadowColor + '"></div>').join('')}</div>`;

                center.innerHTML = `
                    <div style="display:flex; width:100%; height:100%; padding:20px; gap:30px; box-sizing:border-box;">
                        <div style="flex:4; display:flex; flex-direction:column; height:100%;">
                            <h3 style="font-family:var(--font-title); color:${crystalColor}; margin:0 0 15px 0; text-align:center; letter-spacing:2px; text-shadow:0 0 10px ${shadowColor};">${title}</h3>
                            ${gridHtml}
                        </div>
                        <div style="flex:6; display:flex; align-items:center; justify-content:center; gap:40px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid rgba(255,255,255,0.05); padding:20px;">
                            ${boxesHtml}
                            <div style="position:relative; width:120px; height:200px; display:flex; align-items:center; justify-content:center;">
                                <div style="position:absolute; width:180%; height:180%; background:radial-gradient(circle, ${crystalColor} 0%, transparent 60%); mix-blend-mode:screen; opacity:0.6;"></div>
                                <div style="position:absolute; width:100%; height:100%; box-shadow:0 0 60px 20px ${shadowColor}; border-radius:50%; z-index:1;"></div>
                                <div style="width:70px; height:160px; background:linear-gradient(135deg, #ffffff 0%, ${crystalColor} 50%, #000000 100%); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); box-shadow:inset 0 0 20px #fff; z-index:2; position:relative;">
                                    <div style="position:absolute; top:0; left:25%; width:50%; height:100%; background:rgba(255,255,255,0.3); transform:skewX(-20deg);"></div>
                                </div>
                            </div>
                            ${boxesHtml}
                        </div>
                    </div>`;

                center.querySelectorAll('.skill-book-slot.filled').forEach(slot => {
                    slot.onclick = stopPropagation(() => this.openBook(slot.dataset.code));
                });
            };

            if (pBtn && paBtn && center) {
                pBtn.onclick = stopPropagation(() => renderSkillUI('primary'));
                paBtn.onclick = stopPropagation(() => renderSkillUI('passive'));
            }
        }
    });
})(window);
