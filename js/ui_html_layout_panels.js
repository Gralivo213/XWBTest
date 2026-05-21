(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.getPanelsLayoutHtml = function () {
        return `
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

            <div class="iso-action-bar">
                <div class="iso-chat-bar-container" id="iso-chat-bar-container" style="display:none;">
                    <input type="text" id="iso-chat-input" class="iso-chat-input" placeholder="Enter action (e.g., Go East, Cultivate)...">
                    <button type="button" id="iso-chat-submit" class="iso-chat-submit" title="Send Action">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </div>
                <div class="iso-action-buttons">
                    <div class="iso-float-btn" id="iso-sense-btn" title="Sense Aura"><span class="material-symbols-outlined">visibility</span></div>
                    <div class="iso-float-btn" id="iso-region-btn" title="Toggle Regions"><span class="material-symbols-outlined">map</span></div>
                    <div class="iso-float-btn" id="iso-mission-btn" title="Missions"><span class="material-symbols-outlined">assignment</span></div>
                    <div class="iso-float-btn chunk-gen-btn" id="iso-chunk-btn" style="display:none" title="Generate New Chunk"><span class="material-symbols-outlined">add_location_alt</span></div>
                </div>
            </div>

            <div class="iso-mission-panel" id="iso-mission-panel">
                <div class="iso-stat-close" id="mission-close">✕</div>
                <div class="mission-section"><h2 class="mission-section-title">Mission Records</h2><div id="unified-mission-list" class="mission-list"></div></div>
            </div>
            <div class="iso-herb-panel" id="iso-herb-panel"></div>
        `;
    };
})(window);
