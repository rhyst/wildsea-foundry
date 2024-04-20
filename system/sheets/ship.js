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
        await this.adjustRating(itemId, change, this.clickModifiers(event))
        break
      case 'reputations':
        await this.adjustSlimTrack(itemId, itemType, this.clickModifiers(event), change)
        break
      default:
        break
    }
  }

  async adjustRating(rating, change = 1, isBurn) {
    const ratingMax = this.actor.system.ratings[rating]?.max || 6
    const marks = this.actor.system.ratings[rating]?.value
    const burns = this.actor.system.ratings[rating]?.burn


    let update = {
      system: {
        ratings: {
          [rating]: {
            'value': marks,
            'burn': burns,
          },
        },
      },
    }

    if (isBurn) {
      const newBurn = clamp(
        burns + change,
        ratingMax,
      )
      update.system.ratings[rating].burn = newBurn
      if (marks <= burns) {
        update.system.ratings[rating].value = newBurn
      }
    } else {
      const newValue = clamp(
        marks + change,
        ratingMax,
        burns
      )
      update.system.ratings[rating].value = newValue
    }

    this.actor.update({...update})
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'cargoPassengers':
      case 'conditions':
      case 'reputations':
        this.addSlimItem(data.itemType)
        break
      case 'design':
        this.addDesign(data.itemSubtype)
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

  async addDesign(subtype) {
    this.addEmbeddedDocument({
      name: game.i18n.format('wildsea.newDesignName', {
        subtype: game.i18n.localize(`wildsea.${subtype}`),
      }),
      type: 'design',
      data: {
        details: game.i18n.localize('wildsea.newDesignDetails'),
        type: subtype,
      },
    })
  }

  async addFitting() {
    this.addEmbeddedDocument({
      name: game.i18n.localize('wildsea.newFittingName'),
      type: 'fitting',
      data: {
        details: game.i18n.localize('wildsea.newFittingDetail'),
      },
    })
  }

  async addUndercrew() {
    this.addEmbeddedDocument({
      name: game.i18n.localize('wildsea.newUndercrewName'),
      type: 'undercrew',
      data: {
        details: game.i18n.localize('wildsea.newUndercrewDetails'),
      },
    })
  }
}
