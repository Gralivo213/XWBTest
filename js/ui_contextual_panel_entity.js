(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const CONFIG = global.CONFIG;
    
    proto.checkEntityContextual = function (forcedKey = null) {
        const k = forcedKey || `${this.player.chunkId},${this.player.lx},${this.player.ly}`;
        if (k !== this.lastUIKey) {
            this.viewingSenseResults = false;
            this.currentEntityIndex = 0;
        }

        let entities = [];
        if (this.viewingSenseResults) {
            entities = this.currentTileEntities;
        } else {
            this.entityDataSources.forEach(([type, store]) => {
                if (type === 'B' || type === 'npcs') {
                    Object.entries(this.npcs).forEach(([nk, nd]) => {
                        if (nd.hidden) return;
                        const pathStr = nd.tilePath || nk;
                        let matchesKey = pathStr.split('|').map(s => s.trim()).some(part => part === k);
                        if (matchesKey) {
                            entities.push({ type: nd.type || 'B', data: nd });
                        }
                    });
                } else {
                    if (store[k] && !store[k].hidden) entities.push({ type: type, data: store[k] });
                }
            });
            if (this.gateStructures[k] && !this.gateStructures[k].hidden) entities.push({ type: 'GATE', data: this.gateStructures[k] });
            else if (this.towerStructures[k] && !this.towerStructures[k].hidden) entities.push({ type: 'TOWER', data: this.towerStructures[k] });
            else if (this.specificWalls[k] && !this.specificWalls[k].hidden) entities.push({ type: 'WALL', data: this.specificWalls[k] });
        }

        if (k === this.lastUIKey && this.actionActive === this.lastActionState && this.currentTileEntities.length === entities.length && this.currentEntityIndex === this.lastEntityIndex) return;

        this.lastUIKey = k;
        this.lastActionState = this.actionActive;
        if (!this.viewingSenseResults) this.currentTileEntities = entities;
        this.lastEntityIndex = this.currentEntityIndex;

        if (entities.length > 0) {
            const current = entities[this.currentEntityIndex] || entities[0], { data: d, type: ty } = current;
            const isBeast = ty === 'B' || (CONFIG.NPC_BASE_MAP && CONFIG.NPC_BASE_MAP[ty]?.endsWith('Evo'));
            const colors = { H: '#10b981', T: '#fbbf24', W: '#3b82f6', S: '#a855f7', G: '#f43f5e', MI: '#eab308', B: '#f87171', IG: '#f87171', WALL: '#94a3b8', TOWER: '#cbd5e1', GATE: '#f8fafc' };
            const cCol = colors[ty] || (isBeast ? '#f87171' : '#f8fafc');
            
            let pts = d.name?.split('|').map(x => x.trim()) || ['Unknown'], age = pts[0], n = pts[1] || pts[0], s = CONFIG.SYMBOL_MAP[pts[2] || (ty === 'H' ? 'Spirit' : (ty === 'T' ? 'Wood' : (ty === 'W' ? 'Water' : (ty === 'S' ? 'Earth' : (isBeast ? 'Pets' : 'Poison')))))] || pts[2];
            if (['W', 'S', 'G', 'MI', 'IG', 'WALL', 'TOWER', 'GATE'].includes(ty) || isBeast) {
                n = d.name || (ty === 'WALL' ? 'City Wall' : ty === 'TOWER' ? 'Corner Watchtower' : ty === 'GATE' ? 'City Gate' : 'Beast');
                s = { W: 'water_drop', S: 'landscape', G: 'bug_report', MI: 'layers', IG: 'shield_person', WALL: 'shadow', TOWER: 'fort', GATE: 'door_front' }[ty] || 'pets';
            }

            const act = isBeast ? ['interact', 'Observe Beast', 'visibility'] : (ty === 'IG' ? ['talk', 'Talk to Guard', 'chat_bubble'] : { H: ['gather', 'Harvest Flora', 'front_hand'], T: ['chop', 'Fell Timber', 'hardware'], W: ['water', 'Collect Water', 'water_bottle'], S: ['excavate', 'Excavate Soil', 'rebase'], G: ['capture', 'Refine Gu', 'pest_control'], MI: ['mine', 'Mine Mineral', 'hardware'], TOWER: ['garrison', 'Enter Tower', 'visibility'] }[ty]);

            let extraInfo = '';
            if (['WALL', 'TOWER', 'GATE'].includes(ty)) {
                extraInfo = `<div class="herb-subtitle">Quality: ${d.quality || 'Stone'} | HP: ${d.hp || '100/100'}</div>
                             <div class="herb-subtitle" style="color: #fbbf24; font-size:12px;">Dir: ${d.direction || 'N'}</div>`;
                if (ty === 'GATE') extraInfo += `<div class="herb-subtitle" style="color:#60a5fa">State: ${d.state || 'Closed'}</div>`;
            } else if (isBeast || ty === 'IG') {
                const npcAge = d.age || age;
                extraInfo = `<div class="herb-subtitle">Age: ${npcAge} | Realm: ${d.realm || 'Mortal'}</div>`;
                if (d.stage) {
                    extraInfo += `<div class="herb-subtitle" style="color:#fbbf24">Evolution Stage: ${d.stage} / 5</div>`;
                }
                if (d.personality && d.personality.length > 0) {
                    extraInfo += `<div class="npc-tags">
                        ${d.personality.map(p => `<div class="npc-tag" style="background:${p.color || '#666'}; border-color:${p.color || '#fff'}; opacity:${0.3 + ((p.influence || 5) / 10) * 0.7};">${p.tag}</div>`).join('')}
                    </div>`;
                }
                extraInfo += `<div class="herb-subtitle" style="color:#d1d5db; margin-top:5px;">Race: ${d.race || (isBeast ? 'Beast' : 'Human')} | Tile: ${k}</div>`;
            } else if (!['W', 'S', 'G', 'MI'].includes(ty)) {
                extraInfo = `<div class="herb-subtitle">Age: ${age} Cycles</div>`;
            } else if (ty === 'G') {
                extraInfo = `<div class="herb-subtitle">Type: ${d.type}</div>`;
            } else if (ty === 'MI') {
                extraInfo = `<div class="herb-subtitle">Type: ${d.type} | Purity: ${d.purity} | Amount: ${d.amount}</div>`;
            }

            this.ui.herbPanel.innerHTML = `${entities.length > 1 ? `<div class="iso-cycle-btn" title="Cycle Entities"><span class="material-symbols-outlined">sync</span><span class="cycle-count">${this.currentEntityIndex + 1}/${entities.length}</span></div>` : ''}<div class="herb-header"><div class="herb-title"><span class="material-symbols-outlined" style="font-size:28px;color:${cCol}">${s}</span>${n}</div>${extraInfo}</div><div class="herb-lore">"${d.description || d.lore || 'Ancient energies pulse within.'}"</div>${d.obtainable ? `<div style="margin-top:5px"><span style="font-family:var(--font-title);font-size:14px;color:var(--gold-primary)">Yields:</span><div class="obtain-list">${d.obtainable.split(',').map(x => `<span class="obtain-item">${x.trim()}</span>`).join('')}</div></div>` : ''}${d.requirement ? `<div style="margin-top:5px"><span style="font-family:var(--font-title);font-size:14px;color:#ef4444">Requirement:</span><div style="font-family:var(--font-data);font-size:14px;color:#fff;background:rgba(239,68,68,0.1);padding:4px 8px;border-radius:4px;border:1px solid rgba(239,68,68,0.2)">${d.requirement}</div></div>` : ''}${ty === 'H' && d.rank ? `<div style="font-family:var(--font-data);font-size:15px;color:#a1a1aa">Quality Rank: <strong style="color:#fff">${d.rank}</strong></div>` : ''}${act ? `<div class="iso-btn-action ${this.actionActive ? 'active' : ''}" id="action-${act[0]}"><span class="material-symbols-outlined" style="font-size:20px">${act[2]}</span><span class="iso-btn-text">${act[1]}</span></div>` : ''}`;
            this.ui.herbPanel.classList.add('visible');
        } else {
            this.ui.herbPanel.classList.remove('visible');
            if (this.ui.popup) this.ui.popup.classList.remove('visible');
        }
    };
})(window);
