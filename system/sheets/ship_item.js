import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'

export default class WildseaAspectSheet extends WildseaItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/ship_item.hbs`
  }

  async getData() {
    const context = await super.getData()
    context.hasTrack = !['fitting'].includes(this.item.type)
    return context
  }
}
