(function (global) {
    const Str = { type: "string" };
    const Int = { type: "integer" };
    const Bool = { type: "boolean" };

    global.xianxiaSchemaParts = global.xianxiaSchemaParts || {};

    global.xianxiaSchemaParts.inventory = {
        type: "array",
        items: {
            type: "object",
            properties: { code: Str, name: Str, description: Str, symbol: Str },
            required: ["code", "name", "description"]
        }
    };

    global.xianxiaSchemaParts.skills = {
        type: "object",
        properties: {
            active: { type: "array", items: { type: "object", properties: { name: Str, description: Str }, required: ["name", "description"] } },
            passive: { type: "array", items: { type: "object", properties: { name: Str, description: Str }, required: ["name", "description"] } }
        },
        required: ["active", "passive"]
    };

    global.xianxiaSchemaParts.relations = {
        type: "array",
        items: {
            type: "object",
            properties: {
                type: { type: "string", enum: ["friends", "family", "disciples", "enemy", "subordinates", "lover"] },
                Name: Str, Gender: { type: "string", enum: ["M", "F"] }, Relation: Str, Number: Int
            },
            required: ["type", "Name", "Gender", "Relation", "Number"]
        }
    };

    global.xianxiaSchemaParts.chunks = {
        type: "array",
        items: {
            type: "object",
            properties: {
                chunkId: Str, cx: Int, cy: Int, hidden: Bool,
                type: { type: "string", enum: ["G1", "G2", "G3", "G4", "DT1", "DT2", "DT3", "DT4", "F1", "F2", "F3", "F4", "S1", "S2", "S3", "S4", "MT1", "MT2", "MT3", "MT4", "CityT1", "ForestT1", "ForestT2"] }
            },
            required: ["chunkId", "cx", "cy", "type"]
        }
    };

    global.xianxiaSchemaParts.regions = {
        type: "array",
        items: {
            type: "object",
            properties: {
                name: Str, type: Str, impedance: Int, color: Str,
                ranges: { type: "array", items: { type: "object", properties: { cid: Int, lx1: Int, ly1: Int, lx2: Int, ly2: Int }, required: ["cid", "lx1", "ly1", "lx2", "ly2"] } },
                exceptions: { type: "array", items: Int }
            },
            required: ["name", "type", "impedance", "ranges", "color"]
        }
    };
})(window);
