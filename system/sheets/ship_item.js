import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'

export default class WildseaAspectSheet extends WildseaItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/ship_item.hbs`
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: 460,
    })
  }

  async getData() {
    const context = await super.getData()
    context.hasTrack = ['undercrew'].includes(this.item.type)
    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.item.isOwner) {
        html.find('.addItem').click(this.addItem.bind(this))
        html.find('.editEffect').click(this.editEffect.bind(this))
        html.find('.deleteEffect').click(this.deleteEffect.bind(this))
      }
    }
    super.activateListeners(html)
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'effects':
        this.addEffect()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addEffect() {
    const newEffect = await this.item.createEmbeddedDocuments('ActiveEffect', [
      {
        label: game.i18n.format('wildsea.newEffect', { type: 'ActiveEffect' }),
        origin: this.item.uuid,
      },
    ])
    newEffect[0].sheet.render(true)
  }

  async editEffect(event) {
    event.preventDefault()
    const effectId = event.currentTarget.dataset.effectId
    this.item.effects.get(effectId).sheet.render(true)
  }

  async deleteEffect(event) {
    event.preventDefault()
    const effectId = event.currentTarget.dataset.effectId
    this.item.deleteEmbeddedDocuments('ActiveEffect', [effectId])
  }
}
