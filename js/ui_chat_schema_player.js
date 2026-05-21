(function (global) {
    const Str = { type: "string" };
    const Int = { type: "integer" };
    const Num = { type: "number" };

    global.xianxiaSchemaParts = global.xianxiaSchemaParts || {};

    global.xianxiaSchemaParts.player = {
        type: "object",
        properties: {
            chunkId: Int, lx: Int, ly: Int,
            direction: { type: "string", enum: ["N", "S", "E", "W"] },
            name: Str, tilePath: Str
        },
        required: ["chunkId", "lx", "ly", "direction", "name"]
    };

    global.xianxiaSchemaParts.time = {
        type: "object",
        properties: {
            cycle: { type: "string", enum: ["Day", "Night"] },
            day: Str, month: Str, year: Str
        },
        required: ["cycle", "day", "month", "year"]
    };

    global.xianxiaSchemaParts.stats = {
        type: "object",
        properties: {
            health: Num, maxHealth: Num, will: Num, maxWill: Num, qi: Num, maxQi: Num, mood: Num, maxMood: Num, sanity: Num, maxSanity: Num,
            spiritRoot: Str, Vitality: Int, Str: Int, Def: Int, Agi: Int, Mind: Int, Luck: Int, Soul: Int, Comprehension: Int,
            Perception: Int, Charm: Int, "QI control": Int, Stealth: Int, Dexterity: Int
        },
        required: [
            "health", "maxHealth", "will", "maxWill", "qi", "maxQi", "mood", "maxMood", "sanity", "maxSanity",
            "spiritRoot", "Vitality", "Str", "Def", "Agi", "Mind", "Luck", "Soul", "Comprehension", "Perception",
            "Charm", "QI control", "Stealth", "Dexterity"
        ]
    };
})(window);
