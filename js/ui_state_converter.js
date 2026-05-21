(function (global) {
    if (!global.IsoGameEngine) {
        console.error("IsoGameEngine not found when loading ui_state_converter.js");
        return;
    }
    const proto = global.IsoGameEngine.prototype;

    proto.convertWorldStateMapsToArrays = function (ws) {
        if (!ws) return ws;
        const mapToArray = (obj, keyField) => {
            if (!obj || typeof obj !== 'object') return [];
            return Object.entries(obj).map(([key, value]) => {
                return { [keyField]: key, ...value };
            });
        };
        const copy = JSON.parse(JSON.stringify(ws)); // Deep copy
        if (copy.chunks) copy.chunks = mapToArray(copy.chunks, 'chunkId');
        if (copy.specificWalls) copy.specificWalls = mapToArray(copy.specificWalls, 'coordinate');
        if (copy.towerStructures) copy.towerStructures = mapToArray(copy.towerStructures, 'coordinate');
        if (copy.gateStructures) copy.gateStructures = mapToArray(copy.gateStructures, 'coordinate');
        if (copy.entities) {
            const ent = copy.entities;
            if (ent.herbData) ent.herbData = mapToArray(ent.herbData, 'coordinate');
            if (ent.treeData) ent.treeData = mapToArray(ent.treeData, 'coordinate');
            if (ent.npcs) ent.npcs = mapToArray(ent.npcs, 'coordinate');
            if (ent.qiTileData) ent.qiTileData = mapToArray(ent.qiTileData, 'coordinate');
            if (ent.mineralData) ent.mineralData = mapToArray(ent.mineralData, 'coordinate');
            if (ent.guData) ent.guData = mapToArray(ent.guData, 'coordinate');
            if (ent.springData) ent.springData = mapToArray(ent.springData, 'coordinate');
            if (ent.soilData) ent.soilData = mapToArray(ent.soilData, 'coordinate');
            if (ent.forestData) ent.forestData = mapToArray(ent.forestData, 'coordinate');
        }
        return copy;
    };

    proto.convertWorldStateArraysToMaps = function (ws) {
        if (!ws) return ws;
        const arrayToMap = (arr, keyField) => {
            if (!Array.isArray(arr)) return arr;
            const obj = {};
            arr.forEach(item => {
                if (item && item[keyField] !== undefined) {
                    const key = item[keyField];
                    const copy = { ...item };
                    delete copy[keyField];
                    obj[key] = copy;
                }
            });
            return obj;
        };
        const copy = JSON.parse(JSON.stringify(ws)); // Deep copy
        if (copy.chunks) copy.chunks = arrayToMap(copy.chunks, 'chunkId');
        if (copy.specificWalls) copy.specificWalls = arrayToMap(copy.specificWalls, 'coordinate');
        if (copy.towerStructures) copy.towerStructures = arrayToMap(copy.towerStructures, 'coordinate');
        if (copy.gateStructures) copy.gateStructures = arrayToMap(copy.gateStructures, 'coordinate');
        if (copy.entities) {
            const ent = copy.entities;
            if (ent.herbData) ent.herbData = arrayToMap(ent.herbData, 'coordinate');
            if (ent.treeData) ent.treeData = arrayToMap(ent.treeData, 'coordinate');
            if (ent.npcs) ent.npcs = arrayToMap(ent.npcs, 'coordinate');
            if (ent.qiTileData) ent.qiTileData = arrayToMap(ent.qiTileData, 'coordinate');
            if (ent.mineralData) ent.mineralData = arrayToMap(ent.mineralData, 'coordinate');
            if (ent.guData) ent.guData = arrayToMap(ent.guData, 'coordinate');
            if (ent.springData) ent.springData = arrayToMap(ent.springData, 'coordinate');
            if (ent.soilData) ent.soilData = arrayToMap(ent.soilData, 'coordinate');
            if (ent.forestData) ent.forestData = arrayToMap(ent.forestData, 'coordinate');
        }
        return copy;
    };
})(window);
