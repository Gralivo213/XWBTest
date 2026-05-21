(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_inventory_menu_core.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const $$ = global.$$;
    const stopPropagation = global.stopPropagation;
    const CONFIG = global.CONFIG;

    proto.showItemDetails = function (i) {
        const craftTab = document.querySelector('.iso-craft-tab');
        const detailsHeader = document.querySelector('.iso-details-header');
        if (craftTab && craftTab.textContent.trim() === 'DETAILS') {
            craftTab.textContent = 'CRAFT';
            if (detailsHeader) detailsHeader.textContent = 'Item Details';
        }
        const c = $('iso-item-content'); if (!c) return;
        c.innerHTML = i ? `<h2>${i.name}</h2><div class="iso-details-icon"><span class="material-symbols-outlined" style="font-size:64px;color:#10b981">${CONFIG.SYMBOL_MAP[i.symbol] || 'inventory_2'}</span></div><p>"${i.description || 'No description available.'}"</p><div class="iso-details-btn-row"><button class="iso-btn-action" style="flex:1"><span class="iso-btn-text">USE</span></button><button class="iso-btn-action" style="flex:1"><span class="iso-btn-text">DROP</span></button></div>` : '<span class="material-symbols-outlined" style="font-size:80px;margin-bottom:20px;opacity:0.1;color:var(--gold-primary)">inventory_2</span><p style="font-size:20px;letter-spacing:1px;color:#888;">Select an item from your inventory or equipment to view its properties and lore.</p>';
    };

    proto.updateInventoryUI = function () {
        const setSlot = (el, it) => {
            if (!el) return;
            el.innerHTML = it ? `<span class="material-symbols-outlined" style="font-size:32px;color:var(--gold-primary)">${CONFIG.SYMBOL_MAP[it.symbol] || 'inventory_2'}</span>` : '';
            el.onclick = stopPropagation(() => this.showItemDetails(it));
        };
        $$('.iso-inv-slot').forEach((s, i) => setSlot(s, this.inventory[i]));
        ['head', 'torso', 'legs', 'weapon', 'accessory', 'feet'].forEach(k => setSlot(document.querySelector(`.iso-eq-slot[title="${k[0].toUpperCase() + k.slice(1)}"]`), this.equipment[k]));
    };

    proto.setupInventory = function () {
        this.updateInventoryUI();
        const craftTab = document.querySelector('.iso-craft-tab');
        const detailsHeader = document.querySelector('.iso-details-header');
        if (craftTab && detailsHeader) {
            craftTab.onclick = stopPropagation(() => {
                const isCrafting = craftTab.textContent.trim() === 'CRAFT';
                craftTab.textContent = isCrafting ? 'DETAILS' : 'CRAFT';
                detailsHeader.textContent = isCrafting ? 'Crafting Menu' : 'Item Details';
                if (isCrafting) this.renderCraftingUI();
                else this.showItemDetails(null);
            });
        }
        if (typeof this.setupSkillsUI === 'function') {
            this.setupSkillsUI();
        }
    };
})(window);
