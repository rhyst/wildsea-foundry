import { WILDSEA } from '../config.js'
import { enrich, listToRows, clamp, clickModifiers } from '../helpers.js'
import WildseaActorSheet from './actor.js'

export default class WildseaPlayerSheet extends WildseaActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['actor-sheet', 'player-sheet'],
    position: {
      width: 1000,
      height: 750,
    },
    actions: {
      addItem: WildseaPlayerSheet._onAddItem,
      updateRoll: WildseaPlayerSheet._onUpdateRoll,
    },
  }

  static PARTS = {
    form: {
      template: `${WILDSEA.root_path}/templates/sheets/player.hbs`,
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
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

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort(
      (a, b) => (a.sort < b.sort ? -1 : 1),
    )

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  _onRender(context, options) {
    super._onRender(context, options)

    if (!this.isEditable || !this.actor.isOwner) return

    // Mire tracks
    for (const el of this.element.querySelectorAll('.wildsea-mire .wildsea-track')) {
      el.addEventListener('click', this.increaseMireTrack.bind(this))
      el.addEventListener('contextmenu', this.decreaseMireTrack.bind(this))
    }

    // List tracks (edges, skills, languages)
    for (const el of this.element.querySelectorAll('.wildsea-labeled-track .wildsea-track')) {
      el.addEventListener('click', this.increaseListTrack.bind(this))
      el.addEventListener('contextmenu', this.decreaseListTrack.bind(this))
    }
  }

  async increaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.wildsea-track').dataset

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
    const data = target.closest('.wildsea-track').dataset

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

  static _onAddItem(event, target) {
    event.preventDefault()

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
      case 'mires':
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
    const itemData = {
      name: game.i18n.localize('wildsea.newAspectName'),
      type: 'aspect',
      system: {
        details: game.i18n.localize('wildsea.newAspectDetails'),
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

  async addTemporaryTrack() {
    const itemData = {
      name: game.i18n.localize('wildsea.newTemporaryTrackName'),
      type: 'temporaryTrack',
      system: {
        details: game.i18n.localize('wildsea.newTemporaryTrackDetails'),
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async increaseMireTrack(event) {
    event.preventDefault()
    const itemId = event.currentTarget.dataset.itemId
    this.adjustSlimTrack(itemId, 'mires', clickModifiers(event))
  }

  async decreaseMireTrack(event) {
    event.preventDefault()
    const itemId = event.currentTarget.dataset.itemId
    this.adjustSlimTrack(itemId, 'mires', clickModifiers(event), -1)
  }

  static _onUpdateRoll(event, target) {
    event.preventDefault()
    const data = target.dataset
    const dicePool = game.wildsea.dicePool

    switch (data.type) {
      case 'edge':
        dicePool.setEdge(data.value)
        break
      case 'skill':
        dicePool.setSkill(data.value)
        break
      case 'language':
        dicePool.setLanguage(data.value)
        break
    }
  }
}
