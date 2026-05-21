(function (global) {
    const IsoGameEngine = global.IsoGameEngine;
    Object.assign(IsoGameEngine.prototype, {
        parseMapData(jsonString) {
            try {
                let data;
                try { data = JSON.parse(jsonString); } catch (pe) {
                    console.warn("JSON parse failed, attempting fallback cleanup", pe);
                    data = JSON.parse(jsonString.replace(/\{\{<H>\}\}/g, '').replace(/\{\{<\/H>\}\}/g, '').replace(/<\/H>\}\}/g, '').replace(/\{\{<H>/g, ''));
                }
                this.parseHiddenMarkers(data);
                this.mapLoadTime = performance.now();
                this.initParserState(data);
                if (data.player) {
                    this.player = data.player;
                    if (data.player.name) {
                        this.playerName = data.player.name;
                        const pEl = global.$('profile-p-name');
                        if (pEl) pEl.innerHTML = `<strong>Name:</strong> ${this.playerName}`;
                    }
                }
                if (data.relations) this.relations = data.relations;
                if (data.time) {
                    this.time = data.time; this.timeOfDay = data.time.cycle || 'Day';
                    this.updateClockUI();
                }
                if (data.dantianProgress !== undefined) {
                    this.dantianProgress = data.dantianProgress; this.updateDantianUI();
                }
                if (data.realm) { this.realm = data.realm; this.updateRealmUI(); }
                if (data.lifespan) {
                    this.lifespan = data.lifespan;
                    const lsEl = global.$('iso-lifespan-val');
                    if (lsEl) lsEl.textContent = this.lifespan + ' Years';
                }
                this.parseStatsAndInventory(data);
                this.parseChunksData(data);
                if (typeof this.parseStructures === 'function') this.parseStructures(data);
                if (typeof this.parseEntities === 'function') this.parseEntities(data);
                if (typeof this.parsePlayerPositionAndCamera === 'function') this.parsePlayerPositionAndCamera(data);
                if (typeof this.checkContextualUI === 'function') this.checkContextualUI();
                setTimeout(() => { Object.keys(this.chunkConfigs).forEach(cid => this.flattenChunk(+cid)); }, 150);
            } catch (e) { console.error("Map Parse Error:", e); }
        },
        initParserState(data) {
            this.inventory = Array(24).fill(null);
            this.missions = { main: {}, side: {} }; this.craftRecipes = [];
            this.skills = { active: [], passive: [] }; this.wallStructures = data.wallStructures || [];
            this.specificWalls = data.specificWalls || {}; this.chunks = {}; this.chunkConfigs = {};
            this.activeChunkId = 1; this.isDragging = false; this.dragStart = { x: 0, y: 0 };
            ['herb', 'tree', 'spring', 'soil', 'gu', 'mineral', 'qiTile', 'forest'].forEach(k => this[`${k}Data`] = {});
        },
        parseStatsAndInventory(data) {
            if (data.stats) {
                const s = data.stats;
                this.health = s.health || 100; this.maxHealth = s.maxHealth || 100;
                this.stamina = s.will || 100; this.maxStamina = s.maxWill || 100;
                this.qi = s.qi || 100; this.maxQi = s.maxQi || 100;
                this.mood = s.mood || 100; this.maxMood = s.maxMood || 100;
                this.sanity = s.sanity || 100; this.maxSanity = s.maxSanity || 100;
                const srt = global.$('iso-spirit-root-text');
                if (srt) srt.textContent = s.spiritRoot || '';
                const uiStats = { ...s };
                ['health', 'maxHealth', 'will', 'maxWill', 'qi', 'maxQi', 'mood', 'maxMood', 'sanity', 'maxSanity', 'spiritRoot'].forEach(k => delete uiStats[k]);
                this.updateStatsUI(uiStats); this.updateStatusUI();
            }
            if (data.inventory) {
                data.inventory.forEach((item, i) => { if (i < 24) this.inventory[i] = item; });
                this.updateInventoryUI();
            }
            if (data.craftRecipes) this.craftRecipes = data.craftRecipes;
            if (data.skills) this.skills = data.skills;
            if (data.missions) { this.missions = data.missions; this.updateMissionUI(); }
            if (data.regions) this.regions = data.regions;
        },
        parseChunksData(data) {
            let currentMax = 0, prevMaxChunk = 0;
            try { prevMaxChunk = parseInt(localStorage.getItem('iso_max_chunk')) || 0; } catch (e) {}
            if (!this.animatingChunks) this.animatingChunks = {};
            const getChunkPrefix = type => type.startsWith('City') ? 'CityT' : (type.startsWith('DT') ? 'DustyT' : (type.startsWith('MT') ? 'MagmaT' : (type.startsWith('F') ? 'FrostT' : (type.startsWith('S') ? 'SandT' : (type.startsWith('ForestT') ? 'ForestT' : 'GrassT')))));
            if (data.chunks) {
                Object.entries(data.chunks).forEach(([idStr, cfg]) => {
                    const id = +idStr; currentMax = Math.max(currentMax, id);
                    this.generateChunk(id, cfg.cx, cfg.cy);
                    this.chunkConfigs[id] = { ...this.chunkConfigs[id], cx: cfg.cx, cy: cfg.cy, type: cfg.type, hidden: cfg.hidden || false };
                    if (['G1', 'G2', 'G3', 'G4', 'DT1', 'DT2', 'DT3', 'DT4', 'F1', 'F2', 'F3', 'F4', 'S1', 'S2', 'S3', 'S4', 'MT1', 'MT2', 'MT3', 'MT4', 'CityT1', 'ForestT1', 'ForestT2'].includes(cfg.type)) {
                        global.AssetManager.load(`${global.CONFIG.IMG_BASE}${getChunkPrefix(cfg.type)}${cfg.type.charAt(cfg.type.length - 1)}.png`);
                    }
                    if (id > prevMaxChunk) this.animatingChunks[id] = performance.now();
                });
            }
            if (currentMax < prevMaxChunk) prevMaxChunk = 0;
            try { localStorage.setItem('iso_max_chunk', currentMax); } catch (e) {}
        }
    });
})(window);
