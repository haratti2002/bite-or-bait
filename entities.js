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
      idle: ["I saved up my allowance for this KSK BAITS worm!", "C'mon fishy, KSK BAITS always works!", "Look how real this KSK lure moves!"],
      teased: ["HEY!! IT JUST LOOKED AT MY KSK BAIT!", "WHAT?! IT SMILED AT ME!!", "SO CLOSE!! BITE IT ALREADY!"],
      spit: ["EW!! IT SPAT MY LURE AT MY FACE!", "MY KSK BAIT!!"],
      hooked: ["I GOT ONE!! KSK BAITS RULES!!"],
      defeated: ["WAAAH!! THIS BASS IS TOO SMART! I'M GOING HOME!"]
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
      idle: ["Got a full tacklebox of KSK BAITS today...", "Fish finder says there's a Lunker down there!", "No bass can resist a KSK BAITS Topwater Frog!"],
      teased: ["ARE YOU KIDDING ME?!", "IT STOPPED 1 INCH FROM MY KSK CRANKBAIT!!", "MY BLOOD PRESSURE CAN'T TAKE THIS!"],
      spit: ["MY LIMITED-EDITION KSK LURE!! RIGHT IN MY COFFEE!!", "HOW DID IT KNOW IT WAS A LURE?!"],
      hooked: ["FISH ON!! KSK BAITS DOES IT AGAIN!!"],
      defeated: ["THAT'S IT! EVEN KSK BAITS COULDN'T FOOL THIS GENIUS BASS!"]
    }
  },
  {
    id: 'rex',
    name: 'REX "APEX" VANCE',
    title: 'WAVE 3: KSK BAITS PRO STAFF CHAMP',
    sanityMax: 180,
    hatColor: '#111111',
    shirtColor: '#e74c3c',
    quotes: {
      idle: ["Throwing the flagship KSK BAITS Custom Glide...", "Invisible fluorocarbon + KSK BAITS craftsmanship.", "Show yourself, Lunker!"],
      teased: ["IMPOSSIBLE! THAT'S A KSK BAITS PRO SWIMBAIT!", "THIS BASS HAS A PHD!!", "SPONSORS ARE WATCHING! STOP TEASING ME!"],
      spit: ["IT UNHOOKED MY KSK SWIMBAIT MID-BITE?!", "UNBELIEVABLE REFLEXES!"],
      hooked: ["GIANT BASS ON THE KSK GLIDE BAIT!!"],
      defeated: ["RESPECT! YOU SURVIVED THE ENTIRE KSK BAITS LINEUP!"]
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
    name: 'KSK BAITS TEXAS-RIG WORM',
    category: 'KSK BAITS LURE',
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
    clueSummary: 'KSK BAITS high-action soft worm! Look for the brass bullet weight & sharp offset hook.',
    priceTag: 'KSK BAITS • SOFT SERIES'
  },
  {
    id: 'red_crankbait',
    name: 'KSK BAITS RATTLE-CRANK',
    category: 'KSK BAITS LURE',
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
    clueSummary: 'Emits loud metallic CLICK-CLACK rattles, clear diving bill in front, dual treble hooks.',
    priceTag: 'KSK BAITS • HARD SERIES'
  },
  {
    id: 'hollow_frog',
    name: 'KSK BAITS HOLLOW TOPWATER FROG',
    category: 'KSK BAITS LURE',
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
    clueSummary: 'Looks real from above! Swim BELOW it (↓) or use Sonar to spot the twin hooks & skirt legs.',
    priceTag: 'KSK BAITS • TOPWATER'
  },
  {
    id: 'jig_craw',
    name: 'KSK BAITS PRO TUNGSTEN JIG',
    category: 'KSK BAITS LURE',
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
    clueSummary: 'Hops vertically on a tight string; heavy painted head and sharp upward hook.',
    priceTag: 'KSK BAITS • JIG SERIES'
  },
  {
    id: 'glide_swimbait',
    name: 'KSK BAITS CUSTOM GLIDE SWIMBAIT',
    category: 'KSK BAITS FLAGSHIP',
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
    tellText: 'HINGE SEAM IN BODY + GLASS EYES + TREBLE HOOKS!',
    clueSummary: 'Flagship KSK BAITS masterpiece! Stalk close or use Sonar to expose the joint seam & hooks!',
    priceTag: 'KSK BAITS • CUSTOM PRO'
  }
];
