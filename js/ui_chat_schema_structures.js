(function (global) {
    const Str = { type: "string" };

    global.xianxiaSchemaParts = global.xianxiaSchemaParts || {};

    global.xianxiaSchemaParts.wallStructures = {
        type: "array",
        items: {
            type: "object",
            properties: { range: Str, quality: Str, condition: Str, hp: Str, direction: Str },
            required: ["range"]
        }
    };

    global.xianxiaSchemaParts.specificWalls = {
        type: "array",
        items: {
            type: "object",
            properties: { coordinate: Str, condition: Str, quality: Str, hp: Str, direction: Str },
            required: ["coordinate", "condition", "quality", "hp", "direction"]
        }
    };

    global.xianxiaSchemaParts.towerStructures = {
        type: "array",
        items: {
            type: "object",
            properties: { coordinate: Str, hp: Str, condition: Str, quality: Str },
            required: ["coordinate", "hp", "condition", "quality"]
        }
    };

    global.xianxiaSchemaParts.gateStructures = {
        type: "array",
        items: {
            type: "object",
            properties: { coordinate: Str, direction: Str, quality: Str, hp: Str, state: Str },
            required: ["coordinate", "direction", "quality", "hp", "state"]
        }
    };
})(window);
