import { WILDSEA } from '../config.js'
import { enrich, clamp } from '../helpers.js'
import WildseaActorSheet from './actor.js'

export default class WildseaShipSheet extends WildseaActorSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/ship.hbs`
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 1000,
      height: 750,
    })
  }

  async getData() {
    const context = await super.getData()
    context.system = this.actor.system

    context.stakesUsed = 0

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
      if (item.system.stakes)
        context.stakesUsed += parseInt(item.system.stakes) || 0
    }

    context.designs = {}
    for (const designType of WILDSEA.designTypes) {
      context.designs[designType] = this.actor.itemTypes.design.filter(
        (d) => d.system.type === designType,
      )
    }

    context.system.designs = this.actor.itemTypes.design.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.fittings = this.actor.itemTypes.fitting.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.undercrew = this.actor.itemTypes.undercrew.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        html.find('.track').click(this.adjustTrack.bind(this, 1))
        html.find('.track').contextmenu(this.adjustTrack.bind(this, -1))

        html.find('.addItem').click(this.addItem.bind(this))
      }
    }
    super.activateListeners(html)
  }

  async adjustTrack(change, event) {
    event.preventDefault()

    const data = event.currentTarget.dataset
    const itemType = data.itemType
    const itemId = data.itemId

    switch (itemType) {
      case 'rating':
        await this.adjustRating(itemId, change)
        break
      case 'reputations':
        await this.adjustSlimTrack(itemId, itemType, change)
        break
      default:
        break
    }
  }

  async adjustRating(rating, change = 1) {
    const currentValue = this.actor.system.ratings[rating]?.value || 0
    const ratingMax = this.actor.system.ratings[rating]?.max || 6

    this.actor.update({
      system: {
        ratings: {
          [rating]: {
            value: clamp(currentValue + change, ratingMax),
          },
        },
      },
    })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'conditions':
      case 'reputations':
      case 'cargoPassengers':
        this.addSlimItem(data.itemType)
        break
      case 'fittings':
        this.addFitting()
        break
      case 'undercrew':
        this.addUndercrew()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addUndercrew() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newUndercrewName'),
      type: 'undercrew',
      data: {
        details: game.i18n.localize('wildsea.newUndercrewDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addFitting() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newFittingName'),
      type: 'fitting',
      data: {
        details: game.i18n.localize('wildsea.newFittingDetail'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }
}
