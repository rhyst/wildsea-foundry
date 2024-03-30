import { WILDSEA } from '../config.js'
import { enrich, listToRows, clamp, generateId } from '../helpers.js'

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
    context.edgesList = listToRows(WILDSEA.edges, 3)
    context.skillsList = listToRows(WILDSEA.skills, 2)
    context.languagesList = listToRows(WILDSEA.languages, 2)

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system = this.actor.system

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        if (this.actor.type === 'player') {
          // Item context menu
          new ContextMenu(html, '.itemContextMenu', this.itemContextMenu)

          // Item tracks
          html.find('.item .track').click(this.increaseItemTrack.bind(this))
          html.find('.item .track').contextmenu(this.reduceItemTrack.bind(this))

          // other tracks
          html
            .find('.list-track .track')
            .click(this.increaseListTrack.bind(this))
          html
            .find('.list-track .track')
            .contextmenu(this.decreaseListTrack.bind(this))

          html.find('.addItem').click(this.addItem.bind(this))
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

  async increaseItemTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const itemId = target.closest('.track').dataset.itemId
    const item = this.actor.items.get(itemId)
    const newValue = Math.min(
      item.system.track.value + 1,
      item.system.track.max,
    )

    item.update({
      system: {
        track: {
          value: newValue,
        },
      },
    })
  }

  async reduceItemTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const itemId = target.closest('.track').dataset.itemId
    const item = this.actor.items.get(itemId)
    const newValue = Math.max(item.system.track.value - 1, 0)

    item.update({
      system: {
        track: {
          value: newValue,
        },
      },
    })
  }

  async increaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'edge':
        this.adjustEdge(data.itemId)
        break
      case 'skill':
        this.adjustSkill(data.itemId)
        break
      case 'language':
        this.adjustLanguage(data.itemId)
      default:
        break
    }
  }

  async decreaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'edge':
        this.adjustEdge(data.itemId, -1)
        break
      case 'skill':
        this.adjustSkill(data.itemId, -1)
        break
      case 'language':
        this.adjustLanguage(data.itemId, -1)
      default:
        break
    }
  }

  async adjustEdge(key, change = 1) {
    const currentValue = this.actor.system.edges[key] || 0
    const newValue = clamp(currentValue + change, WILDSEA.edgeMax)

    this.actor.update({
      system: {
        edges: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustSkill(key, change = 1) {
    const currentValue = this.actor.system.skills[key] || 0
    const newValue = clamp(currentValue + change, WILDSEA.skillMax)

    this.actor.update({
      system: {
        skills: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustLanguage(key, change = 1) {
    const currentValue = this.actor.system.languages[key] || 0
    const newValue = clamp(currentValue + change, WILDSEA.languageMax)

    this.actor.update({
      system: {
        languages: {
          [key]: newValue,
        },
      },
    })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    console.log(data)

    switch (data.itemType) {
      case 'mire':
        this.addMire('<p>lorem ipsum</p>') // should come from a dialog popup
        break

      default:
        break
    }
  }

  async addMire(text) {
    const id = generateId()
    const newMire = {
      text,
      track: {
        value: 0,
        max: 2,
      },
    }

    const currentMires = this.actor.system.mires
    currentMires[id] = newMire

    this.actor.update({
      system: {
        mires: {
          [id]: newMire,
        },
      },
    })
  }

  async increaseMireTrack(id) {}
}
