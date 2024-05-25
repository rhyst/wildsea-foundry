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
    for (const design of this.items.filter((i) => i.type === 'design')) {
      for (const ratingMod of design.system.ratingMods) {
        const max = this.system.ratings[ratingMod.rating].max

        this.system.ratings[ratingMod.rating].max = clamp(
          max + parseInt(ratingMod.value),
          8,
        )
      }
    }
  }
}
