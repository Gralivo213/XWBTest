(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.attachSettingsEvents = function () {
        let savedScale = localStorage.getItem('iso_ui_scale');
        const migrationKey = 'iso_ui_scale_migrated_v2';
        if (!localStorage.getItem(migrationKey) || !savedScale) {
            savedScale = 'mobile';
            localStorage.setItem('iso_ui_scale', 'mobile');
            localStorage.setItem(migrationKey, 'true');
        }
        document.body.classList.add(`ui-${savedScale}`);

        let apiSettings = {
            provider: 'none',
            gemini: { apiKey: '', model: 'gemini-3.5-flash', temperature: 0.7, topP: 0.95, thinkingLevel: 'OFF' },
            openai: { baseUrl: '', apiKey: '', model: 'gpt-4o', temperature: 0.7 }
        };
        try {
            const stored = localStorage.getItem('iso_api_settings');
            if (stored) apiSettings = JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse API settings", e);
        }
        window.ApiSettings = apiSettings;

        const settingsBtn = $('iso-settings-btn');
        const settingsPopup = $('iso-settings-popup');
        if (settingsBtn && settingsPopup) {
            const closeBtn = $('iso-settings-popup-close-btn');
            const closeBg = $('iso-settings-popup-close-bg');
            const cancelBtn = $('iso-settings-cancel');
            const resetBtn = $('iso-settings-reset');
            
            const hidePopup = () => { settingsPopup.style.display = 'none'; };
            if (closeBtn) closeBtn.onclick = stopPropagation(hidePopup);
            if (closeBg) closeBg.onclick = stopPropagation(hidePopup);
            if (cancelBtn) cancelBtn.onclick = stopPropagation(hidePopup);

            if (resetBtn) {
                resetBtn.onclick = stopPropagation(() => {
                    if (confirm("Are you sure you want to clear the local game state? This will reset the cultivation realm and initiate a new state.")) {
                        localStorage.removeItem('iso_world_state');
                        localStorage.removeItem('iso_max_chunk');
                        localStorage.removeItem('iso_world_history');
                        try {
                            sessionStorage.removeItem('PersistentVisualCache');
                        } catch (e) {}
                        location.reload();
                    }
                });
            }

            if (typeof this.bindSettingsForm === 'function') {
                this.bindSettingsForm(settingsBtn, settingsPopup, apiSettings, savedScale);
            }
        }
    };
})(window);
