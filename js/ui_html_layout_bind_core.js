(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$; const $$ = global.$$; const stopPropagation = global.stopPropagation;

    proto.bindUI = function () {
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

        if (typeof this.bindUIActions === 'function') this.bindUIActions(sp, copyToClip, bindClose);
        if (typeof this.bindChatUI === 'function') this.bindChatUI();
        if (typeof this.updateChatBarVisibility === 'function') this.updateChatBarVisibility();
        this.setupInventory();
    };
})(window);
