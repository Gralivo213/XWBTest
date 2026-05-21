(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_sense_aura.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;
    const $ = global.$;

    proto.triggerShake = function () {
        this.shakeIntensity = 15;
    };

    proto.triggerSense = function () {
        if (!this.player || this.state === 'SENSE_ACTIVE') return;
        this.stamina = Math.max(0, this.stamina - 5);
        this.updateStatusUI();
        const b = $('iso-sense-btn');
        if (b) {
            b.classList.add('active');
            setTimeout(() => b.classList.remove('active'), 1000);
        }
        [this.state, this.animStartTime, this.validMoves] = ['SENSE_ACTIVE', performance.now(), []];
        const { lx, ly, chunkId } = this.player;

        Object.values(this.chunks).forEach(t => {
            if (t.chunkId === chunkId) {
                const d = this.dist(t.lx, t.ly, lx, ly);
                if (d <= 3) this.validMoves.push({ key: `${t.chunkId},${t.lx},${t.ly}`, tile: t, dist: d });
            }
        });

        const entities = [];
        this.entityDataSources.forEach(([type, store]) => {
            Object.entries(store).forEach(([k, d]) => {
                const [cid, tlx, tly] = k.split(',').map(Number);
                if (cid === chunkId) {
                    const dist = this.dist(tlx, tly, lx, ly);
                    if (dist <= 3) entities.push({ type, data: d, dist });
                }
            });
        });

        this.currentTileEntities = entities.sort((a, b) => a.dist - b.dist);
        this.currentEntityIndex = 0;
        this.lastEntityIndex = -1;
        this.viewingSenseResults = true;
        this.lastUIKey = `${chunkId},${lx},${ly}`;
        this.checkContextualUI();

        this.triggerShake();
        setTimeout(() => { if (this.state === 'SENSE_ACTIVE') this.state = 'IDLE'; }, 3000);
    };

    proto.cycleEntity = function () {
        if (this.currentTileEntities.length <= 1) return;
        const panel = this.ui.herbPanel;
        if (panel) {
            panel.classList.add('swapping-out');
            setTimeout(() => {
                this.currentEntityIndex = (this.currentEntityIndex + 1) % this.currentTileEntities.length;
                this.checkContextualUI();
                panel.classList.remove('swapping-out');
                panel.classList.add('swapping-in');
                setTimeout(() => panel.classList.remove('swapping-in'), 600);
            }, 300);
        }
    };
})(window);
