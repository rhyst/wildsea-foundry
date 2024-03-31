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
      height: 750,
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
      context.system[resourceType] = resources
        .filter((r) => r.system.type === resourceType)
        .sort((a, b) => (a.sort < b.sort ? -1 : 1))
    }

    const milestones = this.actor.system.milestones
    for (const subtype of WILDSEA.milestoneSubtypes) {
      context.system[`milestone_${subtype}`] = milestones.filter(
        (m) => m.subtype === subtype,
      )
    }

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
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
          new ContextMenu(html, '.slimContextMenu', this.slimContextMenu)

          // collapse aspects and temp tracks
          html
            .find('.item .itemContextMenu')
            .click(this.collapseItem.bind(this))

          // Item tracks
          html.find('.item .track').click(this.increaseItemTrack.bind(this))
          html.find('.item .track').contextmenu(this.reduceItemTrack.bind(this))

          // Mire tracks
          html.find('.mire .track').click(this.increaseMireTrack.bind(this))
          html
            .find('.mire .track')
            .contextmenu(this.decreaseMireTrack.bind(this))

          // other tracks
          html
            .find('.list-track .track')
            .click(this.increaseListTrack.bind(this))
          html
            .find('.list-track .track')
            .contextmenu(this.decreaseListTrack.bind(this))

          // Add item
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

  slimContextMenu = [
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.editSlimItem(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.removeSlimItem(itemId, itemType)
      },
    },
  ]

  async collapseItem(event) {
    event.preventDefault()
    const itemElement = event.currentTarget.closest('.item')
    const itemId = itemElement.dataset.itemId
    $(itemElement)
      .find('.drawer')
      .slideToggle({
        done: () => {
          this.toggleVisibility(itemId)
        },
      })
  }

  toggleVisibility(itemId) {
    const item = this.actor.items.get(itemId)

    if (item) {
      const visible = !item.system.collapsed ? false : true

      item.update({
        system: {
          collapsed: !visible,
        },
      })
    }
  }

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
      case 'drive':
        this.addSlimItem('drives')
        break
      case 'milestone':
        this.addSlimItem('milestones', data.itemSubtype)
        break
      case 'mire':
        this.addSlimItem('mires')
        break
      case 'resource':
        this.addResource()
        break
      case 'temporaryTrack':
        this.addTemporaryTrack()
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

    this.addEmbeddedDocument(itemData)
  }

  async addResource() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newResourceName'),
      type: 'resource',
      data: {
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addTemporaryTrack() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newTemporaryTrackName'),
      type: 'temporaryTrack',
      data: {
        details: game.i18n.localize('wildsea.newTemporaryTrackDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addEmbeddedDocument(itemData) {
    const docs = await this.actor.createEmbeddedDocuments('Item', [itemData])
    docs.forEach((item) => item.sheet.render(true))
  }

  // async addMire() {
  //   const data = await renderDialog(
  //     game.i18n.localize('wildsea.newMire'),
  //     this.processMireDialog,
  //   )

  //   if (data.cancelled) return

  //   const text = data.text

  //   const id = generateId()
  //   const newMire = {
  //     id,
  //     text,
  //     track: {
  //       value: 0,
  //       max: 2,
  //     },
  //   }

  //   const mires = [...this.actor.system.mires]
  //   mires.push(newMire)

  //   this.actor.update({
  //     system: {
  //       mires,
  //     },
  //   })
  // }

  // processMireDialog(html) {
  //   const form = html[0].querySelector('form')
  //   return { text: form.text.value.trim() }
  // }

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

  async addMilestone(type) {}

  async addSlimItem(itemType, itemSubtype = null) {
    const data = await renderDialog(
      game.i18n.format('wildsea.newSlim', {
        type: game.i18n.localize(`wildsea.${itemType}`),
      }),
      this.processSlimDialog,
    )

    if (data.cancelled) return

    const text = data.text

    const id = generateId()
    const slimData = {
      id,
      text,
      ...(WILDSEA.slimDefaults[itemType] || {}),
    }

    if (itemSubtype) slimData['subtype'] = itemSubtype

    const items = [...this.actor.system[itemType]]
    items.push(slimData)

    this.actor.update({
      system: {
        [itemType]: items,
      },
    })
  }

  processSlimDialog(html) {
    const form = html[0].querySelector('form')
    return { text: form.text.value.trim() }
  }

  async editSlimItem(itemId, itemType) {
    const items = this.actor.system[itemType]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const data = await renderDialog(
        game.i18n.format(
          'wildsea.editSlim',
          game.i18n.localize(`wildsea.${itemType}`),
        ),
        this.processSlimDialog,
        item,
      )

      if (data.cancelled) return

      item.text = data.text

      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
    }
  }

  async removeSlimItem(itemId, itemType) {
    this.actor.update({
      system: {
        [itemType]: this.actor.system[itemType].filter(
          (item) => item.id !== itemId,
        ),
      },
    })
  }
}
