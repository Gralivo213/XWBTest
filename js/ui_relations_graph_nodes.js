(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.drawRelationsNodes = function (svg, nodesWrap, cx, cy, W, H) {
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
    };
})(window);
