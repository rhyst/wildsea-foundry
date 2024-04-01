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
    const context = super.getData()

    context.config = WILDSEA
    context.system = this.actor.system

    for (const item of this.actor.items)
      item.system.enrichedDetails = await enrich(item.system.details)

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        html.find('.track').click(this.adjustTrack.bind(this, 1))
        html.find('.track').contextmenu(this.adjustTrack.bind(this, -1))
      }
    }
    super.activateListeners(html)
  }

  async adjustTrack(change, event) {
    event.preventDefault()

    const data = event.currentTarget.dataset
    const itemType = data.itemType

    switch (itemType) {
      case 'rating':
        await this.adjustRating(data.itemId, change)
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
}
