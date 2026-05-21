(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.bindChatUI = function () {
        const chatSubmit = $('iso-chat-submit');
        const chatInput = $('iso-chat-input');

        if (chatSubmit && chatInput) {
            chatInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    chatSubmit.click();
                }
            };

            chatSubmit.onclick = stopPropagation(async () => {
                const actionText = chatInput.value.trim();
                if (!actionText) return;

                chatInput.disabled = true;
                chatSubmit.disabled = true;
                const prevPlaceholder = chatInput.placeholder;
                chatInput.placeholder = "Invoking Heaven and Earth...";

                try {
                    const apiSettings = window.ApiSettings || {};
                    const currentWorldState = localStorage.getItem('iso_world_state') || "";
                    let currentPayloadStr = "";
                    if (currentWorldState) {
                        try {
                            const parsed = JSON.parse(currentWorldState);
                            const converted = proto.convertWorldStateMapsToArrays(parsed);
                            currentPayloadStr = JSON.stringify(converted, null, 2);
                        } catch (e) {
                            console.error("Failed to convert state to array-based state for LLM payload:", e);
                            currentPayloadStr = currentWorldState;
                        }
                    }

                    // Retrieve existing present map history
                    let history = [];
                    try {
                        const storedHistory = localStorage.getItem('iso_world_history');
                        if (storedHistory) {
                            history = JSON.parse(storedHistory);
                        }
                    } catch (e) {
                        console.error("Failed to parse world history:", e);
                    }

                    const rawResponseText = await proto.fetchAIResponse(actionText, currentPayloadStr, apiSettings, history);
                    const { narrative, jsonContent, interpretedText } = proto.interpretAIResponse(rawResponseText);

                    if (jsonContent) {
                        const convertedMaps = proto.convertWorldStateArraysToMaps(jsonContent);
                        const newJsonStr = JSON.stringify(convertedMaps);
                        localStorage.setItem('iso_world_state', newJsonStr);
                        if (typeof window.UpdateMap === 'function') window.UpdateMap(newJsonStr);

                        // Save this turn (action + resulting worldState) to map history
                        try {
                            history.push({
                                turn: history.length + 1,
                                action: actionText,
                                worldState: jsonContent
                            });
                            localStorage.setItem('iso_world_history', JSON.stringify(history));
                        } catch (e) {
                            console.error("Failed to save world history:", e);
                        }

                        chatInput.value = "";
                    } else {
                        proto.showGameMessage("Simulator warning: Could not extract updated state from simulator response.");
                    }

                    if (narrative || (!jsonContent && rawResponseText)) {
                        proto.showGameMessage(narrative.trim() || interpretedText.trim());
                    }

                } catch (err) {
                    console.error("AI simulation failed", err);
                    proto.showGameMessage(`Simulation failure: ${err.message}`);
                } finally {
                    chatInput.disabled = false;
                    chatSubmit.disabled = false;
                    chatInput.placeholder = prevPlaceholder;
                    chatInput.focus();
                }
            });
        }
    };
})(window);
