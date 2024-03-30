import { WILDSEA } from '../config.js'
import { enrich, listToRows, clamp, generateId } from '../helpers.js'
import { renderDialog } from '../dialog.js'

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

    const resources = this.actor.itemTypes.resource

    for (const resourceType of WILDSEA.resourceTypes) {
      context.system[resourceType] = resources.filter(
        (r) => r.system.type === resourceType,
      )
    }

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
          new ContextMenu(html, '.mireContextMenu', this.mireContextMenu)

          // Item tracks
          html.find('.item .track').click(this.increaseItemTrack.bind(this))
          html.find('.item .track').contextmenu(this.reduceItemTrack.bind(this))

          // Mire tracks
          html.find('.mire .track').click(this.increaseMireTrack.bind(this))
          html
            .find('.mire .track')
            .contextmenu(this.decreaseMireTrack.bind(this))
          html.find('.mire .editMire').contextmenu(this.deleteMire.bind(this))

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

  mireContextMenu = [
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.mire').data('item-id')
        console.log(itemId)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.mire').data('item-id')
        this.removeMire(itemId)
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

    switch (data.itemType) {
      case 'aspect':
        this.addAspect()
        break
      case 'mire':
        this.addMire('<p>lorem ipsum</p>') // should come from a dialog popup
        break

      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addAspect() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newAspectName'),
      type: 'aspect',
      data: {
        details: game.i18n.localize('wildsea.newAspectDetails'),
        ...defaultData,
      },
    }

    const docs = await this.actor.createEmbeddedDocuments('Item', [itemData])
    docs.forEach((item) => item.sheet.render(true))
  }

  async addMire() {
    const data = await renderDialog(
      game.i18n.localize('wildsea.newMire'),
      this.processMireDialog,
    )

    if (data.cancelled) return

    const text = data.text

    const id = generateId()
    const newMire = {
      id,
      text,
      track: {
        value: 0,
        max: 2,
      },
    }

    const mires = [...this.actor.system.mires]
    mires.push(newMire)

    this.actor.update({
      system: {
        mires,
      },
    })
  }

  processMireDialog(html) {
    const form = html[0].querySelector('form')
    return { text: form.text.value.trim() }
  }

  async increaseMireTrack(event) {
    event.preventDefault()
    const target = event.currentTarget
    const data = target.dataset

    this.adjustMireTrack(data.itemId)
  }

  async decreaseMireTrack(event) {
    event.preventDefault()
    const target = event.currentTarget
    const data = target.dataset

    this.adjustMireTrack(data.itemId, -1)
  }

  async adjustMireTrack(id, value = 1) {
    const mires = [...this.actor.system.mires]
    const mire = mires.filter((mire) => mire.id === id)[0]

    if (mire) {
      const currentValue = mire.track.value
      const newValue = clamp(currentValue + value, mire.track.max)

      mire.track.value = newValue

      this.actor.update({
        system: {
          mires,
        },
      })
    }
  }

  async deleteMire(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.mire').dataset

    this.removeMire(data.itemId)
  }

  async removeMire(id) {
    const mires = this.actor.system.mires.filter((mire) => mire.id !== id)

    this.actor.update({
      system: {
        mires,
      },
    })
  }
}
