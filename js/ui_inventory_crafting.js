(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;
    const stopPropagation = global.stopPropagation;

    proto.craftItem = function (code) {
        const recipe = this.craftRecipes.find(r => r.code === code);
        if (!recipe) return;

        const reqs = [];
        const matches = [...recipe.recipe.matchAll(/(\d+)x\s+[^#]*?(#[A-Z0-9_]+)/gi)];
        for (const m of matches) reqs.push({ count: parseInt(m[1]), code: m[2] });

        let canCraft = true;
        const invCounts = {};
        this.inventory.forEach(item => { if (item && item.code) invCounts[item.code] = (invCounts[item.code] || 0) + 1; });

        for (const req of reqs) {
            if ((invCounts[req.code] || 0) < req.count) { canCraft = false; break; }
        }

        if (!canCraft) {
            this.ui.popupText.textContent = `[SYSTEM] Insufficient materials to craft ${recipe.name}.`;
            this.ui.popup.classList.add('visible');
            setTimeout(() => this.ui.popup.classList.remove('visible'), 3000);
            return;
        }

        for (const req of reqs) {
            let toConsume = req.count;
            for (let i = 0; i < this.inventory.length; i++) {
                if (toConsume <= 0) break;
                if (this.inventory[i] && this.inventory[i].code === req.code) {
                    this.inventory[i] = null;
                    toConsume--;
                }
            }
        }

        const emptySlot = this.inventory.findIndex(i => i === null);
        if (emptySlot !== -1) {
            const newCode = '#I' + Math.floor(Math.random() * 10000) + '_' + Date.now().toString().slice(-4);
            this.inventory[emptySlot] = { code: newCode, name: recipe.name, description: recipe.desc, symbol: recipe.symbol };
            this.ui.popupText.textContent = `[SYSTEM] Successfully crafted ${recipe.name}! Update AI Context.`;

            let invStr = `AI TASK: I have successfully crafted "[ ${recipe.name} ]". The required materials were consumed. Please update your lore knowledge and replace my <Inventory> block in index.html with the following updated code to permanently save my progress:\n\n<Inventory>\n`;
            this.inventory.forEach(item => {
                if (item && item.code) {
                    invStr += `    <Item(${item.code})>\n        Name : ${item.name}\n        Description : ${item.description}\n        Symbol : ${item.symbol}\n    </Item(${item.code})>\n`;
                }
            });
            invStr += "</Inventory>";

            $('save-code-text').textContent = invStr;
            $('save-code-popup').style.display = 'flex';
        } else {
            this.ui.popupText.textContent = `[SYSTEM] Crafted ${recipe.name}, but inventory is full! Item dropped.`;
        }

        this.ui.popup.classList.add('visible');
        setTimeout(() => this.ui.popup.classList.remove('visible'), 3000);
        this.updateInventoryUI();
        this.renderCraftingUI();
    };

    proto.renderCraftingUI = function () {
        const c = $('iso-item-content'); if (!c) return;
        if (!this.craftRecipes || this.craftRecipes.length === 0) {
            c.innerHTML = '<p style="margin-top:50px; color:#888; font-size:18px;">No crafting recipes available.</p>';
            return;
        }
        let html = '<div class="iso-craft-list">';
        this.craftRecipes.forEach(cr => {
            const displayRecipe = cr.recipe.replace(/\s*\([^)]*\)/g, '');
            html += `<div class="iso-craft-item">
                <div class="iso-craft-header">
                    <span class="iso-craft-name">${cr.name}</span>
                    <span class="iso-craft-type">${cr.type}</span>
                </div>
                <div class="iso-craft-desc">"${cr.desc}"</div>
                <div class="iso-craft-req"><strong>Req:</strong> ${cr.req}</div>
                <div class="iso-craft-recipe"><strong>Recipe:</strong> ${displayRecipe}</div>
                <button class="iso-btn-action craft-btn-exec" data-code="${cr.code}" style="margin-top:12px; height:36px; padding:0;"><span class="iso-btn-text" style="font-size:14px; letter-spacing:2px;">CRAFT</span></button>
            </div>`;
        });
        html += '</div>';
        c.innerHTML = html;

        c.querySelectorAll('.craft-btn-exec').forEach(btn => {
            btn.onclick = stopPropagation(() => this.craftItem(btn.dataset.code));
        });
    };
})(window);
