export const WILDSEA = {}
WILDSEA.root_path = 'systems/wildsea'

WILDSEA.defaultTokens = {
  player: `${WILDSEA.root_path}/assets/tokens/person.png`,
  ship: `${WILDSEA.root_path}/assets/tokens/iron-hulled-warship.png`,
}

WILDSEA.edgeMax = 1
WILDSEA.edges = [
  'grace',
  'iron',
  'instinct',
  'sharps',
  'teeth',
  'tides',
  'veils',
]
WILDSEA.languageMax = 3
WILDSEA.languages = [
  'lowSour',
  'cthonic',
  'saprekk',
  'gaudimm',
  'knock',
  'brasstongue',
  'rakaSpit',
  'lyreBite',
  'oldHand',
  'signalling',
  'highvin',
]
WILDSEA.milestoneSubtypes = ['major', 'minor']
WILDSEA.resourceTypes = ['salvage', 'specimen', 'whisper', 'chart']
WILDSEA.shipRatings = ['armour', 'seals', 'speed', 'saws', 'stealth', 'tilt']
WILDSEA.skillMax = 3
WILDSEA.skills = [
  'brace',
  'break',
  'conconct',
  'cook',
  'delve',
  'flourish',
  'hack',
  'harvest',
  'hunt',
  'outwit',
  'rattle',
  'scavenge',
  'sense',
  'study',
  'sway',
  'tend',
  'vault',
  'wavewalk',
]
WILDSEA.slimDefaults = {
  mires: {
    track: {
      max: 2,
      value: 0,
    },
  },
  reputations: {
    track: {
      max: 3,
      value: 0,
    },
  },
}
