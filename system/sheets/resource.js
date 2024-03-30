import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'

export default class WildseaResourceSheet extends ItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/resource.hbs`
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 500,
      height: 165,
    })
  }

  async getData() {
    const context = super.getData()

    context.system = this.item.system
    context.config = WILDSEA
    context.system.enrichedDetails = await enrich(this.item.system.details)

    return context
  }
}
