(function (global) {
    if (!global.IsoGameEngine) return;
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$; const stopPropagation = global.stopPropagation;

    proto.bindUIActions = function (sp, copyToClip, bindClose) {
        const setupDetailTrigger = (cid, pid, closeId) => { if ($(cid) && $(pid)) { $(cid).onclick = stopPropagation(() => $(pid).style.display = 'flex'); bindClose(closeId, $(pid)); } };
        setupDetailTrigger('hp-bar-container', 'health-popup', 'health-popup-close');
        setupDetailTrigger('iso-solar-wrapper', 'astral-popup', 'astral-popup-close');

        this.ui.herbPanel = $('iso-herb-panel');
        this.ui.herbPanel.onclick = e => {
            if (e.target.closest('.iso-cycle-btn')) return this.cycleEntity();
            const b = e.target.closest('.iso-btn-action'); if (!b) return;
            this.actionActive = !this.actionActive; b.classList.toggle('active', this.actionActive);

            if (this.actionActive) {
                const verbs = { chop: 'chopping tree', gather: 'gathering herb', water: 'collecting water', mine: 'mining minerals', interact: 'observing beast' };
                let verb = verbs[b.id.split('-')[1]] || 'excavating soil';
                this.ui.popupText.textContent = `[SYSTEM] Entity is ${verb} at its location. Awaiting logic server response.`;
                this.ui.popup.classList.add('visible');
            } else { this.ui.popup.classList.remove('visible'); }
        };

        this.ui.popup = $('iso-ui-popup'); this.ui.popupText = $('popup-text');
        $('copy-btn').onclick = () => copyToClip(this.ui.popupText.textContent);

        const closeBook = () => $('iso-book-modal').classList.remove('visible');
        $('iso-book-close-bg').onclick = $('iso-book-close-btn').onclick = closeBook;
        $('iso-book-prev').onclick = () => { if (this.currentBookPage > 0) { this.currentBookPage--; this.renderBookPage(); } };
        $('iso-book-next').onclick = () => { if (this.currentBook && this.currentBookPage < this.currentBook.pages.length) { this.currentBookPage++; this.renderBookPage(); } };

        this.ui.msgContainer = $('iso-msg-container');
        const bc = $('btn-cultivate'), br = $('btn-rest');
        const updateCultState = () => {
            const c = this.cultivationState === 'CULTIVATING', r = this.cultivationState === 'RESTING';
            bc.classList.toggle('active', c); bc.classList.toggle('disabled', r);
            br.classList.toggle('active', r); br.classList.toggle('disabled', c);
        };

        bc.onclick = stopPropagation(() => {
            this.cultivationState = this.cultivationState === 'CULTIVATING' ? 'IDLE' : 'CULTIVATING'; updateCultState();
            if (this.cultivationState === 'CULTIVATING') {
                this.ui.popupText.textContent = "User has chosen to cultivate. Based on User talent, increase dantian progress.";
                this.ui.popup.classList.add('visible');
            } else this.ui.popup.classList.remove('visible');
        });

        br.onclick = stopPropagation(() => { this.cultivationState = this.cultivationState === 'RESTING' ? 'IDLE' : 'RESTING'; updateCultState(); });
    };
})(window);
