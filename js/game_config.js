(function (global) {
    const B = 'https://raw.githubusercontent.com/Gralivo213/XWBTest/master/imh/';
    const CONFIG = {
        IMG_BASE: B,
        TILE_WIDTH: 64, TILE_HEIGHT: 32, TILE_THICKNESS: 12, CHUNK_SIZE: 10,
        COLORS: {
            TOP_LIGHT: '#fce6b8', TOP_DARK: '#dcb365', SIDE_LEFT_LIGHT: '#c4a45e', SIDE_LEFT_DARK: '#8a723e', SIDE_RIGHT_LIGHT: '#a88c4d', SIDE_RIGHT_DARK: '#61502b', BORDER: 'rgba(0,0,0,0.4)',
            HOVER_FILL: 'rgba(255,255,255,0.15)', HOVER_STROKE: 'rgba(255,223,0,0.8)', HIGHLIGHT_BLUE: 'rgba(0,180,255,0.6)', HIGHLIGHT_GOLD: 'rgba(255,215,0,0.6)', SELECTION_CIRCLE: '#ffffff', PLACEHOLDER_M: '#8b4513', PLACEHOLDER_H: '#10b981'
        },
        ANIMATION: { STAGGER_DELAY: 80, FADE_DURATION: 400 },
        ASSETS: {
            'M': [1, 2, 3, 4].map(i => B + 'M' + i + '.png'),
            'H': [1, 2, 3, 4, 5].map(i => B + 'H' + i + '.png'),
            'T': [
                'Tree1.png', 'Tree2.png', 'Tree3.png', 'Tree4.png', 'Tree5.png', 'Tree6.png', 'Tree7.png',
                'Bamboo.png', 'Bamboo1.png', 'TreeWhite1.png', 'Treepink1.png', 'Treepink2.png'
            ].map(name => B + name),
            'CityWall': B + 'CityWall1.png', 'CityTower': B + 'CityWallTower1.png', 'CityGate': B + 'CityGate.png',
            'Forest': B + 'Forest.png'
        },
        PLAYER_IMG: B + 'P1.png'
    };

    const npcPack = "IG:NPCImperialGuard R:R1 W:W1 AP:ApeEvo B:BearEvo BO:BoarEvo BU:BullEvo C:CarpEvo SF:SwamFangEvo RA:RavenEvo D:DeerEvo FW:FloodwyrmEvo FO:FoxEvo SHE:SheepEvo H:HareEvo MA:MammothEvo DR:DragonEvo CR:CocodileEvo FD:FloodDragonEvo HY:HyenaEvo LE:LeopardEvo HO:HorseEvo";
    CONFIG.NPC_BASE_MAP = Object.fromEntries(npcPack.split(' ').map(x => x.split(':')));
    CONFIG.NPC_ASSETS = new Proxy({}, {
        get(target, prop) {
            const base = CONFIG.NPC_BASE_MAP[prop];
            if (!base) return undefined;
            if (base.endsWith('Evo')) return B + base + '1.png';
            return B + base + '.png';
        },
        has(target, prop) {
            return prop in CONFIG.NPC_BASE_MAP;
        }
    });

    CONFIG.getNPCAsset = function (type, stage = 1, name = "") {
        let resolvedType = type;
        if (!CONFIG.NPC_BASE_MAP[resolvedType]) {
            const n = (name || "").toLowerCase();
            const t = (type || "").toLowerCase();
            if (n.includes("ape") || t.includes("ape")) resolvedType = "AP";
            else if (n.includes("bear") || t.includes("bear")) resolvedType = "B";
            else if (n.includes("boar") || t.includes("boar")) resolvedType = "BO";
            else if (n.includes("bull") || t.includes("bull")) resolvedType = "BU";
            else if (n.includes("carp") || t.includes("carp")) resolvedType = "C";
            else if (n.includes("swam") || t.includes("swamp") || t.includes("sf")) resolvedType = "SF";
            else if (n.includes("raven") || t.includes("raven")) resolvedType = "RA";
            else if (n.includes("deer") || t.includes("deer")) resolvedType = "D";
            else if (n.includes("floodwyrm") || n.includes("wyrm") || t.includes("fw")) resolvedType = "FW";
            else if (n.includes("fox") || t.includes("fox")) resolvedType = "FO";
            else if (n.includes("sheep") || t.includes("sheep")) resolvedType = "SHE";
            else if (n.includes("hare") || t.includes("hare")) resolvedType = "H";
            else if (n.includes("rabbit") || t.includes("rabbit")) resolvedType = "R";
            else if (n.includes("mammoth") || t.includes("mammoth")) resolvedType = "MA";
            else if (n.includes("flooddragon") || t.includes("fd")) resolvedType = "FD";
            else if (n.includes("dragon") || t.includes("dragon")) resolvedType = "DR";
            else if (n.includes("crocodile") || t.includes("croc") || t.includes("cr")) resolvedType = "CR";
            else if (n.includes("hyena") || t.includes("hyena")) resolvedType = "HY";
            else if (n.includes("leopard") || t.includes("leopard")) resolvedType = "LE";
            else if (n.includes("horse") || t.includes("horse")) resolvedType = "HO";
            else if (n.includes("guard") || t.includes("guard") || t.includes("ig")) resolvedType = "IG";
        }
        const base = CONFIG.NPC_BASE_MAP[resolvedType];
        if (!base) return B + 'R1.png';
        if (base.endsWith('Evo')) {
            const s = Math.min(5, Math.max(1, parseInt(stage) || 1));
            let filename = base + s + '.png';
            if (filename === 'CarpEvo3.png') filename = 'CardEvo3.png';
            if (filename === 'CarpEvo5.png') filename = 'CardEvo5.png';
            if (filename === 'BullEvo4.png') filename = 'Bullevo4.png';
            return B + filename;
        }
        return B + base + '.png';
    };

    const symbolPack = "Wood:forest Ice:ac_unit Fire:local_fire_department Water:water_drop Wind:air Spirit:auto_awesome Life:favorite Poison:skull Earth:terrain Metal:shield Sword:swords Blade:swords Spear:navigation Axe:handyman Bow:architecture Shield:shield Armor:checkroom Boots:footprint Ring:circle Amulet:pendant Potion:medication Pill:pill Scroll:description Book:menu_book Talisman:style Herb:herb Fruit:nutrition Seed:grain Stone:diamond Gem:verified Key:key Map:map Bag:shopping_bag Box:inventory_2 Tool:build Ore:layers Qi:bolt Spring:water_drop";
    CONFIG.SYMBOL_MAP = Object.fromEntries(symbolPack.split(' ').map(x => x.split(':')));

    global.CONFIG = CONFIG;
    global.$ = id => document.getElementById(id);
    global.$$ = selector => document.querySelectorAll(selector);
    global.stopPropagation = cb => e => { e.stopPropagation(); cb(e); };
    global.lerp = (s, e, a) => (1 - a) * s + a * e;
})(window);
