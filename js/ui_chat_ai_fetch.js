(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    
    proto.fetchAIResponse = async function (actionText, currentWorldStatePayloadStr, apiSettings, historyList) {
        const sysPrompt = global.systemPrompt || global.HEAVENLY_DAO_PROMPT;
        const directive = "CRITICAL DIRECTIVE: You MUST respond with a single JSON object containing two fields: 'narrative' and 'worldState'. Implementing a chunk, region, 2 mobs, 3 herbs, 4 trees is mandatory. Actively populate the world! Spawn new beasts, trees, minerals, or herbs.";
        
        const historyStr = (historyList && historyList.length > 0) 
            ? JSON.stringify(historyList, null, 2) 
            : "None (Initial Map Generation)";

        console.log("==================== API REQUEST SENT ====================\n" +
            `Timestamp: ${new Date().toISOString()}\nAction Input: ${actionText}\nAPI Provider: ${apiSettings.provider}\n` +
            (apiSettings.provider === 'gemini' ? 
                `Gemini Model: ${apiSettings.gemini?.model}\nGemini Temp: ${apiSettings.gemini?.temperature}\nGemini Thinking: ${apiSettings.gemini?.thinkingLevel}` : 
                `OpenAI Base URL: ${apiSettings.openai?.baseUrl}\nOpenAI Model: ${apiSettings.openai?.model}\nOpenAI Temp: ${apiSettings.openai?.temperature}`) +
            `\nWorld State payload size: ${currentWorldStatePayloadStr.length} characters\n` +
            `Map History size: ${historyList ? historyList.length : 0} turns\n` +
            `System Prompt:\n${sysPrompt}\n\nUser Input:\nGame History (Past Turns):\n${historyStr}\n\nCurrent World State JSON:\n${currentWorldStatePayloadStr}\n\nPlayer Action:\n${actionText}\n` +
            "==========================================================");

        let rawResponseText = "", provider = apiSettings.provider;

        if (provider === 'gemini') {
            const { apiKey, model, temperature, topP, thinkingLevel } = apiSettings.gemini;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{
                    role: "user",
                    parts: [
                        { text: sysPrompt }, 
                        { text: "Game History (Past Turns):\n" + historyStr }, 
                        { text: "Current World State JSON:\n" + currentWorldStatePayloadStr }, 
                        { text: "Player Action:\n" + actionText }, 
                        { text: directive }
                    ]
                }],
                generationConfig: { temperature, topP, responseMimeType: "application/json", responseSchema: global.xianxiaResponseSchema }
            };
            if ((model === 'gemma-4-31b-it' || model.startsWith('gemini-')) && thinkingLevel !== 'OFF') {
                payload.generationConfig.thinkingConfig = { thinkingLevel };
            }
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`Gemini API Error (${res.status}): ${await res.text()}`);
            rawResponseText = await res.text();
            
        } else if (provider === 'openai') {
            const { baseUrl = 'https://api.openai.com/v1', apiKey, model, temperature } = apiSettings.openai;
            const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
            const payload = {
                model, messages: [
                    { role: "system", content: sysPrompt }, 
                    { role: "user", content: `Game History (Past Turns):\n${historyStr}\n\nCurrent World State JSON:\n${currentWorldStatePayloadStr}\n\nPlayer Action:\n${actionText}\n\n${directive}` }
                ],
                temperature, response_format: { type: "json_schema", json_schema: { name: "XianxiaWorldResponse", schema: global.xianxiaResponseSchema } }
            };
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`OpenAI API Error (${res.status}): ${await res.text()}`);
            rawResponseText = await res.text();
        } else throw new Error("No API provider configured.");

        console.log("==================== RAW AI RESPONSE RECEIVED ====================\n" +
            `Timestamp: ${new Date().toISOString()}\n${rawResponseText}\n` +
            "====================================================================");
        
        return rawResponseText;
    };
})(window);
