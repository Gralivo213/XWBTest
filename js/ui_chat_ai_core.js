(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_chat_ai_core.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.showGameMessage = function (text) {
        const container = $('iso-msg-container');
        if (!container) return;
        const msg = document.createElement('div');
        msg.className = 'iso-msg-box';
        msg.style.cssText = 'pointer-events:auto; position:relative; padding-right:30px;';
        msg.innerHTML = `<span></span><span style="position:absolute; top:5px; right:10px; cursor:pointer; font-size:18px; color:#ef4444; font-weight:bold; user-select:none;">&times;</span>`;
        msg.firstChild.textContent = text;
        msg.lastChild.onclick = stopPropagation(() => {
            msg.classList.remove('visible');
            setTimeout(() => msg.remove(), 500);
        });
        container.appendChild(msg);
        msg.offsetHeight; // Force reflow
        msg.classList.add('visible');
    };

    proto.updateChatBarVisibility = function () {
        const chatContainer = $('iso-chat-bar-container');
        if (!chatContainer) return;
        const apiSettings = window.ApiSettings || {};
        const provider = apiSettings.provider;
        const hasKey = (provider === 'gemini' && apiSettings.gemini?.apiKey) ||
                       (provider === 'openai' && apiSettings.openai?.apiKey);
        chatContainer.style.display = hasKey ? 'flex' : 'none';
    };

    // Load system prompt on init
    global.systemPrompt = "";
    const fallbackPrompt = global.HEAVENLY_DAO_PROMPT;
    if (window.location.protocol === 'file:') {
        global.systemPrompt = fallbackPrompt;
        console.log("Xianxia Game Engine: Loaded via file:// protocol. Using precompiled system prompt directly.");
    } else {
        fetch('system_prompt.txt')
            .then(res => {
                if (res.ok) return res.text();
                throw new Error("System prompt status " + res.status);
            })
            .then(txt => { global.systemPrompt = txt; })
            .catch(err => {
                console.warn("Failed to load system prompt, using fallback", err);
                global.systemPrompt = fallbackPrompt;
            });
    }

    // Initialize Visibility Check on boot
    setTimeout(() => {
        proto.updateChatBarVisibility();
    }, 100);
})(window);
