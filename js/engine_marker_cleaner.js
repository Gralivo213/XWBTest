(function (global) {
    const IsoGameEngine = global.IsoGameEngine;

    Object.assign(IsoGameEngine.prototype, {
        parseHiddenMarkers(data) {
            let currentlyHidden = false;
            
            const markRecursiveHidden = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(item => {
                        if (item && typeof item === 'object') {
                            item.hidden = true;
                            markRecursiveHidden(item);
                        }
                    });
                } else if (obj && typeof obj === 'object') {
                    obj.hidden = true;
                    Object.values(obj).forEach(val => {
                        if (val && typeof val === 'object') {
                            val.hidden = true;
                            markRecursiveHidden(val);
                        }
                    });
                }
            };

            const cleanedRoot = {};
            Object.entries(data).forEach(([key, val]) => {
                let k = key;
                if (k.includes('{{<H>')) {
                    currentlyHidden = true;
                    k = k.replace('{{<H>', '');
                }
                if (currentlyHidden && val && typeof val === 'object') {
                    markRecursiveHidden(val);
                }
                if (k.includes('</H>}}')) {
                    currentlyHidden = false;
                    k = k.replace('</H>}}', '');
                }
                cleanedRoot[k] = val;
            });
            
            Object.keys(data).forEach(k => delete data[k]);
            Object.assign(data, cleanedRoot);

            if (data.chunks) {
                const cleanedChunks = {};
                let chunkHidden = false;
                Object.entries(data.chunks).forEach(([key, val]) => {
                    let k = key;
                    if (k.includes('{{<H>')) {
                        chunkHidden = true;
                        k = k.replace('{{<H>', '');
                    }
                    if (chunkHidden || val.hidden) {
                        val.hidden = true;
                    }
                    if (k.includes('</H>}}')) {
                        chunkHidden = false;
                        k = k.replace('</H>}}', '');
                    }
                    cleanedChunks[k] = val;
                });
                data.chunks = cleanedChunks;
            }

            if (data.entities) {
                ['herbData', 'treeData', 'npcs', 'qiTileData', 'mineralData', 'guData', 'springData', 'soilData', 'forestData'].forEach(field => {
                    if (data.entities[field]) {
                        const cleaned = {};
                        let fieldHidden = false;
                        Object.entries(data.entities[field]).forEach(([key, val]) => {
                            let k = key;
                            if (k.includes('{{<H>')) {
                                fieldHidden = true;
                                k = k.replace('{{<H>', '');
                            }
                            if (fieldHidden || val.hidden) {
                                val.hidden = true;
                            }
                            if (k.includes('</H>}}')) {
                                fieldHidden = false;
                                k = k.replace('</H>}}', '');
                            }
                            cleaned[k] = val;
                        });
                        data.entities[field] = cleaned;
                    }
                });
            }
        }
    });
})(window);
