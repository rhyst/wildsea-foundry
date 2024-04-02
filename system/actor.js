export default class WildseaActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.wildsea.defaultTokens[data.type],
      texture: { src: CONFIG.wildsea.defaultTokens[data.type] },
    }
  }
}
