(function (global) {
    const parts = global.xianxiaSchemaParts || {};
    const Str = { type: "string" };
    const Int = { type: "integer" };
    const Num = { type: "number" };

    global.xianxiaResponseSchema = {
        type: "object",
        properties: {
            narrative: {
                type: "string",
                description: "A descriptive, immersion-focused narrative text framing things from a standard Wuxia/Xianxia thematic viewpoint (describing the outcomes of the action, environment, and options). Detail visible environmental items and immediate options cleanly while strictly hiding unrevealed metadata info or invisible entities until discovered."
            },
            worldState: {
                type: "object",
                description: "The complete updated or initial World State JSON object representing the game world state.",
                properties: {
                    access: {
                        type: "object",
                        properties: { chunkGen: { type: "boolean", description: "Whether chunk generation is accessible." } },
                        required: ["chunkGen"]
                    },
                    player: parts.player,
                    time: parts.time,
                    dantianProgress: Num, realm: Str, lifespan: Int,
                    stats: parts.stats,
                    inventory: parts.inventory,
                    craftRecipes: { type: "array", items: Str },
                    skills: parts.skills,
                    missions: {
                        type: "object",
                        properties: { main: { type: "object" }, side: { type: "object" } },
                        required: ["main", "side"]
                    },
                    relations: parts.relations,
                    chunks: parts.chunks,
                    regions: parts.regions,
                    wallStructures: parts.wallStructures,
                    specificWalls: parts.specificWalls,
                    towerStructures: parts.towerStructures,
                    gateStructures: parts.gateStructures,
                    entities: parts.entities
                },
                required: [
                    "access", "player", "time", "dantianProgress", "realm", "lifespan", "stats", "inventory",
                    "craftRecipes", "skills", "missions", "relations", "chunks", "regions", "wallStructures",
                    "specificWalls", "towerStructures", "gateStructures", "entities"
                ]
            }
        },
        required: ["narrative", "worldState"]
    };
})(window);
