(function (global) {
    const Str = { type: "string" };
    const Int = { type: "integer" };
    const Bool = { type: "boolean" };

    global.xianxiaSchemaParts = global.xianxiaSchemaParts || {};

    global.xianxiaSchemaParts.entities = {
        type: "object",
        properties: {
            herbData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, description: Str, rank: Str, color: Str, hidden: Bool, obtainable: Str, requirement: Str },
                    required: ["coordinate", "name", "description"]
                }
            },
            treeData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, description: Str, color: Str, hidden: Bool, obtainable: Str, requirement: Str },
                    required: ["coordinate", "name", "description"]
                }
            },
            npcs: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        coordinate: Str, type: Str, stage: Int, lx: Int, ly: Int, chunkId: Int,
                        direction: { type: "string", enum: ["N", "S", "E", "W"] }, name: Str,
                        age: Str, realm: Str, race: Str, description: Str, tilePath: Str, hidden: Bool,
                        personality: { type: "array", items: { type: "object", properties: { tag: Str, color: Str, influence: Int }, required: ["tag", "color", "influence"] } }
                    },
                    required: ["coordinate", "type", "stage", "lx", "ly", "chunkId", "direction", "name"]
                }
            },
            qiTileData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, type: Str, description: Str },
                    required: ["coordinate", "name", "type", "description"]
                }
            },
            mineralData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, type: Str, purity: Str, amount: Int, description: Str, hidden: Bool },
                    required: ["coordinate", "name", "type", "purity", "amount", "description"]
                }
            },
            guData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, type: Str, description: Str, hidden: Bool },
                    required: ["coordinate", "name", "type", "description"]
                }
            },
            springData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, description: Str, hidden: Bool },
                    required: ["coordinate", "name", "description"]
                }
            },
            soilData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, description: Str, hidden: Bool },
                    required: ["coordinate", "name", "description"]
                }
            },
            forestData: {
                type: "array",
                items: {
                    type: "object",
                    properties: { coordinate: Str, name: Str, beasts: Str, herbs: Str, qi: Int, hidden: Bool },
                    required: ["coordinate", "name", "beasts", "herbs", "qi"]
                }
            }
        },
        required: ["herbData", "treeData", "npcs", "qiTileData", "mineralData", "guData", "springData", "soilData", "forestData"]
    };
})(window);
