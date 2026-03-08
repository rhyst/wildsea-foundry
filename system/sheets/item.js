import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

export default class WildseaItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ['wildsea', 'item-sheet'],
    position: {
      width: 600,
      height: 400,
    },
    form: {
      submitOnChange: true,
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    context.config = WILDSEA
    context.system = this.item.system
    context.system.enrichedDetails = await enrich(this.item.system.details)
    context.effects = this.item.effects
    return context
  }

  _onRender(context, options) {
    super._onRender(context, options)

    this.element.classList.add('wildsea-sheet-app')
    this.window?.content?.classList.add('wildsea-sheet-content')
    this.window?.header?.classList.add('wildsea-sheet-window-header')
    this.form?.classList.add('wildsea-sheet-form')
  }
}
