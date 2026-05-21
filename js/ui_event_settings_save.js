(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.bindSettingsForm = function (settingsBtn, settingsPopup, apiSettings, savedScale) {
        const F = ['settings-save', 'api-provider', 'gemini-config', 'openai-config', 'gemini-key', 'gemini-model', 'gemini-temp', 'gemini-temp-val', 'gemini-topp', 'gemini-topp-val', 'gemini-thinking-container', 'gemini-thinking', 'openai-base', 'openai-key', 'openai-model', 'openai-temp', 'openai-temp-val'].reduce((a, n) => (a[n] = $('iso-' + n), a), {});
        const scaleBtns = settingsPopup.querySelectorAll('.iso-scale-btn');
        let activeScale = savedScale;

        const updateProviderVisibility = () => {
            const p = F['api-provider'].value;
            F['gemini-config'].style.display = (p === 'gemini') ? 'block' : 'none';
            F['openai-config'].style.display = (p === 'openai') ? 'block' : 'none';
        };

        const updateGeminiThinkingLevels = () => {
            const m = F['gemini-model'].value, prev = F['gemini-thinking'].value || 'HIGH';
            if (m === 'gemma-4-31b-it') {
                F['gemini-thinking-container'].style.display = 'block';
                F['gemini-thinking'].innerHTML = `<option value="MINIMAL">Minimal</option><option value="HIGH">High</option>`;
            } else if (m.startsWith('gemini-')) {
                F['gemini-thinking-container'].style.display = 'block';
                F['gemini-thinking'].innerHTML = `<option value="OFF">Disabled</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>`;
            } else {
                F['gemini-thinking-container'].style.display = 'none';
                return;
            }
            if ([...F['gemini-thinking'].options].some(o => o.value === prev)) F['gemini-thinking'].value = prev;
        };

        const populateFormFields = () => {
            F['api-provider'].value = apiSettings.provider || 'none';
            const g = apiSettings.gemini || {}, o = apiSettings.openai || {};
            F['gemini-key'].value = g.apiKey || '';
            F['gemini-model'].value = g.model || 'gemini-3.5-flash';
            F['gemini-temp'].value = g.temperature !== undefined ? g.temperature : 0.7;
            F['gemini-temp-val'].textContent = F['gemini-temp'].value;
            F['gemini-topp'].value = g.topP !== undefined ? g.topP : 0.95;
            F['gemini-topp-val'].textContent = F['gemini-topp'].value;
            updateGeminiThinkingLevels();
            if (g.thinkingLevel) F['gemini-thinking'].value = g.thinkingLevel;
            F['openai-base'].value = o.baseUrl || '';
            F['openai-key'].value = o.apiKey || '';
            F['openai-model'].value = o.model || 'gpt-4o';
            F['openai-temp'].value = o.temperature !== undefined ? o.temperature : 0.7;
            F['openai-temp-val'].textContent = F['openai-temp'].value;
            activeScale = localStorage.getItem('iso_ui_scale') || 'mobile';
            scaleBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-scale') === activeScale));
            updateProviderVisibility();
        };

        F['api-provider'].onchange = updateProviderVisibility;
        F['gemini-model'].onchange = updateGeminiThinkingLevels;
        F['gemini-temp'].oninput = () => F['gemini-temp-val'].textContent = F['gemini-temp'].value;
        F['gemini-topp'].oninput = () => F['gemini-topp-val'].textContent = F['gemini-topp'].value;
        F['openai-temp'].oninput = () => F['openai-temp-val'].textContent = F['openai-temp'].value;
        scaleBtns.forEach(btn => btn.onclick = stopPropagation(() => {
            scaleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeScale = btn.getAttribute('data-scale');
        }));

        settingsBtn.onclick = stopPropagation(() => { populateFormFields(); settingsPopup.style.display = 'flex'; });

        F['settings-save'].onclick = stopPropagation(() => {
            document.body.classList.remove('ui-normal', 'ui-small', 'ui-mobile');
            document.body.classList.add(`ui-${activeScale}`);
            localStorage.setItem('iso_ui_scale', activeScale);
            apiSettings.provider = F['api-provider'].value;
            apiSettings.gemini = { apiKey: F['gemini-key'].value, model: F['gemini-model'].value, temperature: parseFloat(F['gemini-temp'].value), topP: parseFloat(F['gemini-topp'].value), thinkingLevel: F['gemini-thinking'].value };
            apiSettings.openai = { baseUrl: F['openai-base'].value, apiKey: F['openai-key'].value, model: F['openai-model'].value, temperature: parseFloat(F['openai-temp'].value) };
            localStorage.setItem('iso_api_settings', JSON.stringify(apiSettings));
            window.ApiSettings = apiSettings;
            if (typeof this.updateChatBarVisibility === 'function') this.updateChatBarVisibility();
            if (!localStorage.getItem('iso_world_state')) {
                const hasKey = (apiSettings.provider === 'gemini' && apiSettings.gemini.apiKey) || (apiSettings.provider === 'openai' && apiSettings.openai.apiKey);
                if (hasKey && $('iso-chat-input') && $('iso-chat-submit')) {
                    $('iso-chat-input').value = "Initialize a new Xianxia cultivation world with starting Grassland chunk.";
                    setTimeout(() => $('iso-chat-submit').click(), 100);
                }
            }
            settingsPopup.style.display = 'none';
        });
    };
})(window);
