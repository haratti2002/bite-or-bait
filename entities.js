// ============================================================================
// BITE OR BAIT — Enhanced Entities, KSK BAITS Lure Lineup & Roguelite Upgrades
// ============================================================================

window.ANGLERS = [
  {
    id: 'timmy',
    name: 'TIMMY "BOBBER" JENKINS',
    title: 'STAGE 1: BACKYARD POND ROOKIE',
    sanityMax: 100,
    hatColor: '#ff3b30',
    shirtColor: '#ffcc00',
    boatColor: '#8d6e63', // Wooden dock/rowboat
    castInterval: 4.5,
    twitchChance: 0.25,
    quotes: {
      idle: [
        "I saved up my allowance for this KSK BAITS worm!",
        "C'mon fishy, KSK BAITS always works!",
        "Look how real this KSK lure wiggles!"
      ],
      cast: ["HERE GOES MY KSK LURE!!", "CASTING OUT BY THE WEEDS!"],
      twitch: ["TWITCH! TWITCH! LOOK ALIVE!", "JIGGLE THAT WORM!"],
      teased: [
        "HEY!! IT JUST STARED AT MY KSK BAIT!",
        "WHAT?! IT WINKED AT ME AND SWAM OFF!!",
        "SO CLOSE!! BITE IT ALREADY!!"
      ],
      spit: ["EW!! IT SPAT MY LURE RIGHT AT MY HAT!", "HOW DID IT NOT GET HOOKED?!"],
      hooked: ["I GOT ONE!! KSK BAITS RULES!!"],
      defeated: ["WAAAH!! THIS BASS IS A GENIUS! I'M GOING HOME!"]
    }
  },
  {
    id: 'hank',
    name: 'HANK "GEARHEAD" MILLER',
    title: 'STAGE 2: WEEKEND BASS BOAT DAD',
    sanityMax: 150,
    hatColor: '#2ecc71',
    shirtColor: '#2980b9',
    boatColor: '#c0392b',
    castInterval: 3.8,
    twitchChance: 0.45,
    quotes: {
      idle: [
        "Got a full tacklebox of KSK BAITS today...",
        "Fish finder says there's a giant down there!",
        "No bass can resist a KSK BAITS Topwater Frog!"
      ],
      cast: ["DROPPING A KSK SPECIAL RIGHT ON TARGET!", "PERFECT CAST!"],
      twitch: ["POP! POP! WALK THE FROG!", "CRANK IT HARD!"],
      teased: [
        "ARE YOU KIDDING ME?!",
        "IT STOPPED 1 MILLIMETER FROM MY KSK CRANKBAIT!!",
        "MY BLOOD PRESSURE CAN'T TAKE THIS FISH!"
      ],
      spit: ["MY LIMITED-EDITION KSK LURE!! RIGHT IN MY COFFEE!!", "IT BLEW THE HOOK OUT?!"],
      hooked: ["FISH ON!! KSK BAITS DOES IT AGAIN!!"],
      defeated: ["THAT'S IT! EVEN MY WALLET CAN'T BEAT THIS GENIUS BASS!"]
    }
  },
  {
    id: 'chaz',
    name: 'CHAZ "GOOGAN" STREAMER',
    title: 'STAGE 3: VIRAL FISHING YOUTUBER',
    sanityMax: 190,
    hatColor: '#9b59b6',
    shirtColor: '#00d2d3',
    boatColor: '#f39c12',
    castInterval: 3.2,
    twitchChance: 0.65,
    quotes: {
      idle: [
        "WHAT'S UP CHAT! Today we're throwing KSK BAITS!",
        "Smash that subscribe button if I catch this Lunker!",
        "Chat says the bass is hiding in the timber!"
      ],
      cast: ["CLIP THIS CHAT! UNBOXING THE KSK JIG!", "10,000 VIEWERS WATCHING THIS CAST!"],
      twitch: ["AGGRESSIVE JERKS FOR THE ALGORITHM!!", "RIPPING IT THROUGH THE ZONE!"],
      teased: [
        "BRO WHAT?! CHAT STOP LAUGHING AT ME!!",
        "THIS FISH IS LITERALLY TROLLING MY LIVESTREAM!!",
        "NO WAY IT JUST TAIL-SLAPPED MY KSK BAIT!!"
      ],
      spit: ["IT SPAT THE LURE AT MY GOPRO!!", "CLIP THAT!! MY CAMERA LENS!!"],
      hooked: ["WE GOT A TEN-POUNDER ON STREAM!!"],
      defeated: ["STREAM ENDED! I GOT HUMILIATED BY A FISH!!"]
    }
  },
  {
    id: 'rex',
    name: 'REX "APEX" VANCE',
    title: 'FINAL BOSS: KSK BAITS WORLD PRO CHAMP',
    sanityMax: 240,
    hatColor: '#111111',
    shirtColor: '#e74c3c',
    boatColor: '#1e272e',
    castInterval: 2.8,
    twitchChance: 0.8,
    quotes: {
      idle: [
        "Throwing the flagship KSK BAITS Custom Glide...",
        "Invisible fluorocarbon + KSK BAITS master craftsmanship.",
        "Show yourself, Lake Legend!"
      ],
      cast: ["PRECISION CAST: KSK CUSTOM SWIMBAIT!", "SILENT ENTRY... PURE PERFECTION."],
      twitch: ["PRO GLIDE CADENCE! LEFT... RIGHT... PAUSE!", "DEADSTICKING THE SWIMBAIT!"],
      teased: [
        "IMPOSSIBLE! THAT'S A KSK BAITS PRO PROTOTYPE!",
        "THIS BASS HAS A 200 IQ!!",
        "HOW DID IT SPOT THE FLUOROCARBON LINE?!"
      ],
      spit: ["IT UNHOOKED MY KSK SWIMBAIT MID-STRIKE?!", "UNBELIEVABLE JAW CONTROL!"],
      hooked: ["GIANT LUNKER ON THE KSK GLIDE BAIT!!"],
      defeated: ["RESPECT! YOU CONQUERED THE ENTIRE KSK BAITS ARSENAL!"]
    }
  }
];

// Roguelite Evolution Upgrades between Stages
window.BASS_UPGRADES = [
  {
    id: 'polarized_eyes',
    name: '🕶️ POLARIZED PREDATOR EYES',
    desc: 'Fishing lines & hidden belly hooks glint 70% brighter at all times!',
    apply: (game) => { game.perks.lineVisionBoost = 0.7; }
  },
  {
    id: 'phd_teaser',
    name: '🧠 200-IQ TROLL MASTER',
    desc: 'Teasing lures deals +40% Angler Patience damage & boosts Score!',
    apply: (game) => { game.perks.teaseDamageMult = 1.4; }
  },
  {
    id: 'jet_fins',
    name: '💨 TURBO CAUDAL FINS',
    desc: '+35% Swim Speed, faster Stalking zoom, and wider Bite reach!',
    apply: (game) => { game.perks.speedMult = 1.35; }
  },
  {
    id: 'deep_sonar',
    name: '📡 LATERAL LINE OVERDRIVE',
    desc: 'Sonar cooldown reduced by 45% and reveals X-Ray for 4 full seconds!',
    apply: (game) => {
      game.state.sonarMaxCooldown *= 0.55;
      game.state.sonarDuration = 4.0;
    }
  },
  {
    id: 'iron_bucket_mouth',
    name: '🦷 BUCKET-MOUTH REFLEX',
    desc: 'Doubles the emergency Spit-Out time window + adds +1 Extra Chance!',
    apply: (game) => {
      game.state.spitWindow = 1.35;
      game.state.lives = Math.min(5, game.state.lives + 1);
    }
  }
];

// Detailed Prey & KSK BAITS Catalog
window.ITEM_CATALOG = [
  // ======================== REAL PREY (SAFE TO EAT!) ========================
  {
    id: 'nightcrawler',
    name: 'JUICY NIGHTCRAWLER',
    category: 'REAL PREY',
    isLure: false,
    minWave: 1,
    shape: 'worm',
    primaryColor: '#e66767',
    secondaryColor: '#f8a5c2',
    points: 200,
    weightGain: 0.5,
    hungerRestore: 30,
    movementStyle: 'organic_wiggle',
    loupeBadge: '❤ 100% ORGANIC • NO HOOK',
    tellText: 'WARM HEARTBEAT! SOFT RING SEGMENTS & NO LINE!',
    clueSummary: 'Smooth sinusoidal squirming, natural pink saddle ring, zero metal or line.',
    priceTag: 'WILD NATURE SNACK'
  },
  {
    id: 'golden_shiner',
    name: 'GOLDEN SHINER MINNOW',
    category: 'REAL PREY',
    isLure: false,
    minWave: 1,
    shape: 'minnow',
    primaryColor: '#f6e58d',
    secondaryColor: '#badc58',
    points: 260,
    weightGain: 0.7,
    hungerRestore: 35,
    movementStyle: 'dart_swim',
    loupeBadge: '❤ REAL GILLS • BLINKING EYE',
    tellText: 'BLINKING EYES! BREATHING GILLS & WARM PULSE!',
    clueSummary: 'Blinks its eyes naturally, red gills flare, smooth belly with no treble hooks.',
    priceTag: 'FRESH PROTEIN'
  },
  {
    id: 'pond_crawfish',
    name: 'RED SWAMP CRAWFISH',
    category: 'REAL PREY',
    isLure: false,
    minWave: 2,
    shape: 'craw',
    primaryColor: '#eb4d4b',
    secondaryColor: '#ff7979',
    points: 340,
    weightGain: 0.9,
    hungerRestore: 38,
    movementStyle: 'bottom_scurry',
    loupeBadge: '❤ LIVE CLAWS • NO SINKER',
    tellText: 'WALKING LEGS! SNAPPING PINCERS & HEARTBEAT!',
    clueSummary: 'Walks along the bottom with real legs, no painted lead jig head or hook.',
    priceTag: 'CRUNCHY DELICACY'
  },
  {
    id: 'bullfrog',
    name: 'GREEN POND BULLFROG',
    category: 'REAL PREY',
    isLure: false,
    minWave: 2,
    shape: 'frog',
    primaryColor: '#6ab04c',
    secondaryColor: '#dff9fb',
    points: 420,
    weightGain: 1.15,
    hungerRestore: 42,
    movementStyle: 'surface_kick',
    loupeBadge: '❤ CLEAN BELLY • REAL WEBBED FEET',
    tellText: 'CREAM WHITE BELLY! REAL KICKING HIND LEGS!',
    clueSummary: 'Swim underneath to verify: smooth white belly with zero metal hooks!',
    priceTag: 'TOPWATER FEAST'
  },
  {
    id: 'bluegill',
    name: 'WILD SUNFISH BLUEGILL',
    category: 'REAL PREY',
    isLure: false,
    minWave: 3,
    shape: 'bluegill',
    primaryColor: '#4834d4',
    secondaryColor: '#f0932b',
    points: 520,
    weightGain: 1.5,
    hungerRestore: 48,
    movementStyle: 'fin_hover',
    loupeBadge: '❤ SEAMLESS BODY • LIVE PULSE',
    tellText: 'NO HINGE SEAMS! FLARING PECTORAL FINS & HEARTBEAT!',
    clueSummary: 'Whole one-piece scaly body with no mechanical hinge rivets or hanging hooks.',
    priceTag: 'TROPHY MEAL'
  },

  // ======================== KSK BAITS LURES (TEASE THEM!) ========================
  {
    id: 'neon_worm_rig',
    name: 'KSK BAITS TEXAS-RIG WORM',
    category: 'KSK BAITS LURE',
    isLure: true,
    minWave: 1,
    shape: 'worm',
    primaryColor: '#ff00ff',
    secondaryColor: '#00ffff',
    points: 320,
    angerDamage: 34,
    movementStyle: 'jerky_jig',
    hookPosition: 'middle',
    lineVisibility: 0.78,
    hasRattle: false,
    loupeBadge: '⚠️ BRASS SINKER + OFFSET HOOK!',
    tellText: 'TRAP!! BULLET WEIGHT ON NOSE + BURIED STEEL HOOK!',
    clueSummary: 'KSK BAITS soft plastic worm! Spot the brass cone sinker & curved hook point.',
    priceTag: 'KSK BAITS • SOFT SERIES'
  },
  {
    id: 'red_crankbait',
    name: 'KSK BAITS RATTLE-CRANK 60',
    category: 'KSK BAITS LURE',
    isLure: true,
    minWave: 1,
    shape: 'crankbait',
    primaryColor: '#ff3838',
    secondaryColor: '#ffffff',
    points: 380,
    angerDamage: 38,
    movementStyle: 'tight_wobble',
    hookPosition: 'belly_and_tail',
    lineVisibility: 0.68,
    hasRattle: true,
    loupeBadge: '⚠️ CLICK-CLACK STEEL BALLS + 2 TREBLES!',
    tellText: 'LOUD RATTLE CHAMBER + DIVING LIP + DUAL TREBLE HOOKS!',
    clueSummary: 'Contains internal steel rattle balls (*CLICK-CLACK*), plastic lip, and 2 treble hooks.',
    priceTag: 'KSK BAITS • CRANK SERIES'
  },
  {
    id: 'hollow_frog',
    name: 'KSK BAITS HOLLOW FROG',
    category: 'KSK BAITS LURE',
    isLure: true,
    minWave: 2,
    shape: 'frog',
    primaryColor: '#2ecc71',
    secondaryColor: '#f1c40f',
    points: 480,
    angerDamage: 44,
    movementStyle: 'surface_twitch',
    hookPosition: 'hidden_belly',
    lineVisibility: 0.42,
    hasRattle: false,
    loupeBadge: '⚠️ TWIN BELLY HOOKS + SILICONE LEGS!',
    tellText: 'CHECK THE BELLY!! TWIN BARBED HOOKS + RUBBER SKIRT!',
    clueSummary: 'Looks real from above! Swim BELOW (↓) or hold SPACE to see the twin hooks & rubber legs.',
    priceTag: 'KSK BAITS • TOPWATER'
  },
  {
    id: 'jig_craw',
    name: 'KSK BAITS TUNGSTEN PRO JIG',
    category: 'KSK BAITS LURE',
    isLure: true,
    minWave: 2,
    shape: 'craw',
    primaryColor: '#e056fd',
    secondaryColor: '#eb4d4b',
    points: 500,
    angerDamage: 46,
    movementStyle: 'bottom_hop',
    hookPosition: 'top_hook',
    lineVisibility: 0.45,
    hasRattle: true,
    loupeBadge: '⚠️ TUNGSTEN HEAD + WEEDGUARD HOOK!',
    tellText: 'METAL JIG HEAD + SILICONE SKIRT + HEAVY HOOK!',
    clueSummary: 'Hops vertically on a string; features a heavy painted tungsten head and upward hook.',
    priceTag: 'KSK BAITS • JIG SERIES'
  },
  {
    id: 'glide_swimbait',
    name: 'KSK BAITS CUSTOM GLIDE 180',
    category: 'KSK BAITS FLAGSHIP',
    isLure: true,
    minWave: 3,
    shape: 'bluegill',
    primaryColor: '#686de0',
    secondaryColor: '#f9ca24',
    points: 700,
    angerDamage: 56,
    movementStyle: 's_glide',
    hookPosition: 'hidden_belly',
    lineVisibility: 0.24,
    hasRattle: true,
    loupeBadge: '⚠️ METAL HINGE + KSK STAMP + TREBLES!',
    tellText: 'JOINTED HINGE PINS + GLASS EYE + SWINGING TREBLES!',
    clueSummary: 'Flagship KSK BAITS masterpiece! Zoom in with SPACE or use Sonar to spot the metal joint seam!',
    priceTag: 'KSK BAITS • CUSTOM PRO'
  }
];
