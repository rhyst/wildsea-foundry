import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'
import WildseaActorSheet from './actor.js'

export default class WildseaAdversarySheet extends WildseaActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['wildsea', 'actor-sheet', 'adversary-sheet'],
    actions: {
      addItem: WildseaAdversarySheet._onAddItem,
    },
  }

  static PARTS = {
    form: {
      template: `${WILDSEA.root_path}/templates/sheets/adversary.hbs`,
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    context.system = this.actor.system

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system.enrichedDetails = await enrich(this.actor.system.description)
    context.aspects = []
    context.drives = []
    context.quirks = []

    for (const attribute of this.actor.itemTypes.attribute) {
      if (attribute.system.type === 'aspect') {
        context.aspects.push(attribute)
      } else if (attribute.system.type === 'drive') {
        context.drives.push(attribute)
      } else if (attribute.system.type === 'quirk') {
        context.quirks.push(attribute)
      }
    }

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  static _onAddItem(event, target) {
    event.preventDefault()

    const data = target.dataset

    switch (data.itemType) {
      case 'aspect':
      case 'drive':
      case 'quirk':
        this.addAttribute(data.itemType)
        break
      case 'sight':
      case 'sound':
      case 'smell':
      case 'taste':
        this.addSlimItem(data.itemType)
        break
      case 'resource':
        this.addResource()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addAttribute(attributeType) {
    const itemData = {
      name: game.i18n.localize('wildsea.newAttributeName'),
      type: 'attribute',
      system: {
        details: game.i18n.localize('wildsea.newAttributeDetails'),
        type: attributeType,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addResource() {
    const itemData = {
      name: game.i18n.localize('wildsea.newResourceName'),
      type: 'resource',
      system: {},
    }

    this.addEmbeddedDocument(itemData)
  }
}
