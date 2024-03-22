import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'

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

  async getData() {
    const context = super.getData()
    context.system = this.actor.system
    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )
    for (const aspect of context.aspects) {
      aspect.system.enrichedDetails = await enrich(aspect.system.details)
    }

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        if (this.actor.type === 'player') {
          // Item context menu
          new ContextMenu(html, '.itemContextMenu', this.itemContextMenu)

          // Item tracks
          html.find('.track .box').click(this.clickTrack.bind(this))
        }
      }
    }

    super.activateListeners(html)
  }

  itemContextMenu = [
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.items.get(itemId).sheet.render(true)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.deleteEmbeddedDocuments('Item', [itemId])
      },
    },
  ]

  async clickTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const itemId = target.closest('.track').dataset.itemId
    const item = this.actor.items.get(itemId)
    console.log(item)
  }
}
