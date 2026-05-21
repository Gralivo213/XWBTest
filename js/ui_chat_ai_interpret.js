(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;

    proto.interpretAIResponse = function (rawResponseText) {
        let interpretedText = rawResponseText, data = null;
        try { data = JSON.parse(rawResponseText); } catch (e) {}

        let narrative = "", jsonContent = null;
        if (data) {
            if (data.candidates?.[0]?.content?.parts) {
                interpretedText = data.candidates[0].content.parts.map(p => p.text).join('\n');
            } else if (data.choices?.[0]?.message?.content) {
                interpretedText = data.choices[0].message.content;
            }
            try {
                const parsed = JSON.parse(interpretedText);
                if (parsed && parsed.narrative !== undefined) {
                    narrative = parsed.narrative;
                    jsonContent = parsed.worldState;
                }
            } catch (e) {}
        }

        if (!jsonContent) {
            const stateStart = interpretedText.indexOf('<WorldState>'), stateEnd = interpretedText.indexOf('</WorldState>');
            if (stateStart !== -1 && stateEnd !== -1) {
                narrative = interpretedText.substring(0, stateStart).trim() + "\n" + interpretedText.substring(stateEnd + 13).trim();
                try { jsonContent = JSON.parse(interpretedText.substring(stateStart + 12, stateEnd).trim()); } catch (e) {}
            } else {
                const mdJsonStart = interpretedText.indexOf('```json');
                if (mdJsonStart !== -1) {
                    const afterStart = interpretedText.substring(mdJsonStart + 7), mdJsonEnd = afterStart.indexOf('```');
                    if (mdJsonEnd !== -1) {
                        try {
                            jsonContent = JSON.parse(afterStart.substring(0, mdJsonEnd).trim());
                            narrative = interpretedText.replace(/```json[\s\S]*?```/g, '').trim();
                        } catch (e) {}
                    }
                }
            }
        }

        if (!narrative && !jsonContent && data?.narrative) {
            narrative = data.narrative;
            jsonContent = data.worldState;
        }

        return { narrative, jsonContent, interpretedText };
    };
})(window);
