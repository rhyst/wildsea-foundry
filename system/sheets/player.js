import { WILDSEA } from '../config.js'

export default class WildseaPlayerSheet extends ActorSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/player.hbs`
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 1000,
      height: 700,
    })
  }

  getData() {
    const context = super.getData()

    context.system = this.actor.system

    return context
  }
}
