// ============================================================================
// BITE OR BAIT - Prey, Lures, & Rival Angler Catalog
// ============================================================================

window.ANGLERS = [
  {
    id: 'timmy',
    name: 'TIMMY "BOBBER" JENKINS',
    title: 'WAVE 1: BACKYARD POND ROOKIE',
    sanityMax: 100,
    hatColor: '#ff3b30',
    shirtColor: '#ffcc00',
    quotes: {
      idle: ["C'mon fishy, fishy!", "Mom said I can stay 'til dinner!", "This worm looks super real!"],
      teased: ["HEY!! IT JUST LOOKED AT IT!", "WHAT?! IT SMILED AT ME!!", "SO CLOSE!! BITE IT ALREADY!"],
      spit: ["EW!! IT SPAT MY LURE AT MY FACE!", "MY BOBBER!!"],
      hooked: ["I GOT ONE!! MOM, GET THE CAMERA!!"],
      defeated: ["WAAAH!! STUPID SMART FISH! I'M GOING HOME!"]
    }
  },
  {
    id: 'hank',
    name: 'HANK "GEARHEAD" MILLER',
    title: 'WAVE 2: WEEKEND TOURNAMENT DAD',
    sanityMax: 140,
    hatColor: '#2ecc71',
    shirtColor: '#2980b9',
    quotes: {
      idle: ["Paid $28.99 for this Japanese crankbait...", "Fish finder says there's a monster down there!", "Nobody outsmarts Ol' Hank!"],
      teased: ["ARE YOU KIDDING ME?!", "IT STOPPED 1 INCH FROM THE HOOK!!", "MY BLOOD PRESSURE CAN'T TAKE THIS!"],
      spit: ["MY $30 LURE!! RIGHT IN MY COFFEE!!", "HOW DID IT KNOW IT WAS PLASTIC?!"],
      hooked: ["FISH ON!! GET THE NET!!"],
      defeated: ["THAT'S IT! I'M SELLING THE BOAT!!"]
    }
  },
  {
    id: 'rex',
    name: 'REX "APEX" VANCE',
    title: 'WAVE 3: WORLD BASS PRO CHAMPION',
    sanityMax: 180,
    hatColor: '#111111',
    shirtColor: '#e74c3c',
    quotes: {
      idle: ["$100,000 trophy is on the line...", "Invisible fluorocarbon. Hand-painted swimbait.", "Show yourself, Lunker!"],
      teased: ["IMPOSSIBLE! THAT'S A $120 CUSTOM BAIT!", "THIS BASS HAS A PHD!!", "SPONSORS ARE WATCHING! STOP TEASING ME!"],
      spit: ["IT UNHOOKED ITSELF MID-BITE?!", "MY CUSTOM SWIMBAIT IS RUINED!"],
      hooked: ["GIANT BASS ON!! TOURNAMENT WINNER!!"],
      defeated: ["I QUIT PRO FISHING! THIS BASS IS A GENIUS!"]
    }
  }
];

// Each item in ITEM_CATALOG defines either a REAL PREY (isLure: false) or a FAKE LURE (isLure: true).
// inspectHint: what the player discovers when getting close (Stalking), orbiting below/above, or using Sonar.
window.ITEM_CATALOG = [
  // ======================== REAL PREY (SAFE TO BITE!) ========================
  {
    id: 'nightcrawler',
    name: 'JUICY NIGHTCRAWLER',
    category: 'REAL PREY',
    isLure: false,
    minWave: 1,
    shape: 'worm',
    primaryColor: '#e66767',
    secondaryColor: '#f8a5c2',
    points: 180,
    weightGain: 0.45,
    hungerRestore: 28,
    movementStyle: 'organic_wiggle',
    tellText: 'WARM HEARTBEAT! NO LINE! 100% ORGANIC SQUIRM!',
    clueSummary: 'Natural wiggling, soft segments, zero metal hooks or fishing line.',
    priceTag: 'FREE NATURE SNACK'
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
    points: 240,
    weightGain: 0.65,
    hungerRestore: 34,
    movementStyle: 'dart_swim',
    tellText: 'BLINKING EYES! REAL GILLS & HEARTBEAT!',
    clueSummary: 'Blinks its eyes naturally, breathes through gills, no hooks underneath.',
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
    points: 320,
    weightGain: 0.85,
    hungerRestore: 38,
    movementStyle: 'bottom_scurry',
    tellText: 'SNAPPING CLAWS! NATURAL PULSE!',
    clueSummary: 'Real snapping pincers, no lead sinker at the nose, warm heartbeat on Sonar.',
    priceTag: 'CRUNCHY DELICACY'
  },
  {
    id: 'bullfrog',
    name: 'GREEN BULLFROG',
    category: 'REAL PREY',
    isLure: false,
    minWave: 2,
    shape: 'frog',
    primaryColor: '#6ab04c',
    secondaryColor: '#badc58',
    points: 380,
    weightGain: 1.1,
    hungerRestore: 42,
    movementStyle: 'surface_kick',
    tellText: 'CLEAN BELLY! REAL KICKING LEGS!',
    clueSummary: 'Swim underneath to verify: smooth white belly with NO metal double-hooks!',
    priceTag: 'TOPWATER TREAT'
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
    points: 480,
    weightGain: 1.45,
    hungerRestore: 48,
    movementStyle: 'fin_hover',
    tellText: 'SEAMLESS SCALES! STRONG HEARTBEAT!',
    clueSummary: 'No plastic joint seams, blinking eye, strong organic pulse on Sonar.',
    priceTag: 'TROPHY MEAL'
  },

  // ======================== FAKE LURES (TEASE THEM!) ========================
  {
    id: 'neon_worm_rig',
    name: 'TEXAS-RIG PLASTIC WORM',
    category: 'FAKE LURE',
    isLure: true,
    minWave: 1,
    shape: 'worm',
    primaryColor: '#ff00ff',
    secondaryColor: '#00ffff',
    points: 300,
    angerDamage: 28,
    movementStyle: 'jerky_jig',
    hookPosition: 'middle',
    lineVisibility: 0.75,
    hasRattle: false,
    tellText: 'DANGER!! CURVED HOOK IN BELLY + LEAD SINKER!',
    clueSummary: 'Unnatural neon color, brass bullet weight on the nose, sharp hook point sticking out.',
    priceTag: '$6.99 SOFT PLASTIC PACK'
  },
  {
    id: 'red_crankbait',
    name: 'RATTLE-TRAP CRANKBAIT',
    category: 'FAKE LURE',
    isLure: true,
    minWave: 1,
    shape: 'crankbait',
    primaryColor: '#ff3838',
    secondaryColor: '#ffffff',
    points: 350,
    angerDamage: 32,
    movementStyle: 'tight_wobble',
    hookPosition: 'belly_and_tail',
    lineVisibility: 0.65,
    hasRattle: true,
    tellText: 'CLICK-CLACK RATTLE!! PLASTIC LIP + TWO TREBLE HOOKS!',
    clueSummary: 'Emits loud metallic CLICK-CLACK rattles, clear plastic diving bill in front, hanging treble hooks.',
    priceTag: '$18.50 HARD CRANKBAIT'
  },
  {
    id: 'hollow_frog',
    name: 'HOLLOW-BODY TOPWATER FROG',
    category: 'FAKE LURE',
    isLure: true,
    minWave: 2,
    shape: 'frog',
    primaryColor: '#2ecc71',
    secondaryColor: '#f1c40f',
    points: 450,
    angerDamage: 38,
    movementStyle: 'surface_twitch',
    hookPosition: 'hidden_belly',
    lineVisibility: 0.4,
    hasRattle: false,
    tellText: 'LOOK UNDERNEATH!! TWIN BARBED HOOKS ON THE BELLY!',
    clueSummary: 'Looks real from above! Swim BELOW it (↓) or use Sonar to spot the twin hooks & rubber tassel legs.',
    priceTag: '$24.99 TOURNAMENT FROG'
  },
  {
    id: 'jig_craw',
    name: 'SKIRTED BASS JIG & CRAW',
    category: 'FAKE LURE',
    isLure: true,
    minWave: 2,
    shape: 'craw',
    primaryColor: '#e056fd',
    secondaryColor: '#eb4d4b',
    points: 460,
    angerDamage: 40,
    movementStyle: 'bottom_hop',
    hookPosition: 'top_hook',
    lineVisibility: 0.45,
    hasRattle: true,
    tellText: 'SILICONE SKIRT + HEAVY METAL JIG HEAD!',
    clueSummary: 'Hops vertically on a tight string; heavy painted lead head and sharp upward hook.',
    priceTag: '$19.99 PRO TUNGSTEN JIG'
  },
  {
    id: 'glide_swimbait',
    name: 'CUSTOM JOINTED SWIMBAIT',
    category: 'FAKE LURE',
    isLure: true,
    minWave: 3,
    shape: 'bluegill',
    primaryColor: '#686de0',
    secondaryColor: '#f9ca24',
    points: 650,
    angerDamage: 50,
    movementStyle: 's_glide',
    hookPosition: 'hidden_belly',
    lineVisibility: 0.22,
    hasRattle: true,
    tellText: 'HINGE SEAM IN BODY + DEAD GLASS EYES + TREBLE HOOKS!',
    clueSummary: 'Ultra-realistic paint, but Stalk close or use Sonar to expose the mechanical hinge seam & belly hooks!',
    priceTag: '$120.00 CUSTOM GLIDE BAIT'
  }
];
