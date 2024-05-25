import { clamp } from './helpers.js'

export default class WildseaActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.wildsea.defaultTokens[data.type],
      texture: { src: CONFIG.wildsea.defaultTokens[data.type] },
    }
  }

  prepareBaseData() {
    super.prepareBaseData()

    if (this.type === 'ship') this.prepareShipBaseData()
  }

  prepareShipBaseData() {
    for (const item of this.items.filter((i) =>
      ['design', 'fitting', 'undercrew'].includes(i.type),
    )) {
      for (const ratingMod of item.system.ratingMods) {
        const max = this.system.ratings[ratingMod.rating].max

        this.system.ratings[ratingMod.rating].max = clamp(
          max + parseInt(ratingMod.value),
          8,
        )
      }
    }
  }
}
