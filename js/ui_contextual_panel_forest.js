(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.checkForestContextual = function (forcedKey = null) {
        const k = forcedKey || `${this.player.chunkId},${this.player.lx},${this.player.ly}`;
        const bits = k.split(',').map(Number);
        const t = this.getTile(bits[0], bits[1], bits[2]);
        if (t?.assetHidden) t.assetHidden = false;

        let forestEntity = null;
        const pKey = `${this.player.chunkId},${this.player.lx},${this.player.ly}`;
        const pTile = this.getTile(this.player.chunkId, this.player.lx, this.player.ly);
        if (this.forestData && this.forestData[pKey]) {
            forestEntity = this.forestData[pKey];
        } else if (pTile && pTile.forestBaseKey && this.forestData && this.forestData[pTile.forestBaseKey]) {
            forestEntity = this.forestData[pTile.forestBaseKey];
        }

        if (forestEntity) {
            const col = '#22c55e';
            const fName = forestEntity.name || 'Mysterious Forest';
            const fBeasts = forestEntity.beasts || 'None';
            const fHerbs = forestEntity.herbs || 'None';
            const fQi = forestEntity.qi !== undefined ? forestEntity.qi : 0;
            
            let qiZonesText = '';
            if (fQi === 0) qiZonesText = '1-2 Qi zones';
            else if (fQi >= 1 && fQi <= 10) qiZonesText = `${fQi * 5} Qi zones`;
            else qiZonesText = `${fQi} (Custom)`;

            this.ui.herbPanel.innerHTML = `
                <div class="herb-header">
                    <div class="herb-title">
                        <span class="material-symbols-outlined" style="font-size:28px;color:${col}">forest</span>
                        ${fName}
                    </div>
                    <div class="herb-subtitle" style="color:#d1d5db; margin-top:5px; line-height:1.4;">
                        <strong>Beasts:</strong> ${fBeasts}<br>
                        <strong>Herbs:</strong> ${fHerbs}<br>
                        <strong>QI Density:</strong> Scale ${fQi} (${qiZonesText})
                    </div>
                </div>
                <div class="herb-lore" style="margin-top:8px;">"A dense, whispering forest where ancient Qi gathers and dangerous beasts roam."</div>
                <div class="iso-btn-action" id="action-enter-forest" style="margin-top:12px; height:40px; border-color:${col}; display:flex; align-items:center; justify-content:center;">
                    <span class="material-symbols-outlined" style="font-size:20px;color:${col}">login</span>
                    <span class="iso-btn-text" style="color:${col}; margin-left:6px;">ENTER FOREST</span>
                </div>
            `;
            this.ui.herbPanel.classList.add('visible');
            
            const enterBtn = document.getElementById('action-enter-forest');
            if (enterBtn) {
                enterBtn.onclick = stopPropagation(() => {
                    this.ui.popupText.textContent = `[SYSTEM] Entering the forest: ${fName}. Awaiting logic server response.`;
                    this.ui.popup.classList.add('visible');
                });
            }
            return true;
        }
        return false;
    };
})(window);
