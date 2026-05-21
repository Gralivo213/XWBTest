(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_hud_controllers.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.updateDantianUI = function () {
        const fill = $('dantian-fill');
        if (fill) fill.style.height = `${this.dantianProgress}%`;
    };

    proto.updateRealmUI = function () {
        const el = $('iso-realm-text');
        if (el) el.textContent = this.realm;
    };

    proto.updateStatsUI = function (stats) {
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
    };

    proto.updateStatusUI = function () {
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
    };

    proto.updateClockUI = function () {
        const p = n => String(n).padStart(2, '0');
        const d = $('clock-day'), m = $('clock-month'), y = $('clock-year');
        if (d) d.textContent = p(this.time.day);
        if (m) m.textContent = p(this.time.month);
        if (y) y.textContent = this.time.year;
    };

    proto.updateMissionUI = function () {
        const container = $('unified-mission-list');
        if (!container) return;

        const allMissions = [
            ...Object.entries(this.missions.main).map(([id, m]) => ({ ...m, id, sort: 1 })),
            ...Object.entries(this.missions.side).map(([id, m]) => ({ ...m, id, sort: 2 }))
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
    };
})(window);
