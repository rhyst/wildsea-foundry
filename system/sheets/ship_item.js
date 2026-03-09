import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'
import { renderDialog } from '../dialog.js'

export default class WildseaShipItemSheet extends WildseaItemSheet {
  static DEFAULT_OPTIONS = {
    classes: ['item-sheet', 'ship-item-sheet'],
    position: {
      width: 600,
      height: 'auto',
    },
    actions: {
      addRatingMod: WildseaShipItemSheet._onAddRatingMod,
      editRatingMod: WildseaShipItemSheet._onEditRatingMod,
      deleteRatingMod: WildseaShipItemSheet._onDeleteRatingMod,
      editEffect: WildseaShipItemSheet._onEditEffect,
      deleteEffect: WildseaShipItemSheet._onDeleteEffect,
    },
  }

  static PARTS = {
    form: {
      template: `${WILDSEA.root_path}/templates/sheets/ship_item.hbs`,
    },
  }

  static TABS = {
    sheet: {
      tabs: [
        { id: 'main', icon: '', label: 'wildsea.description' },
        { id: 'ratingMods', icon: '', label: 'wildsea.ratingMods' },
      ],
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    context.hasTrack = ['undercrew'].includes(this.item.type)
    return context
  }

  static async _onAddRatingMod(event, target) {
    event.preventDefault()

    const data = await renderDialog(
      game.i18n.localize('wildsea.ratingMod'),
      WildseaShipItemSheet._processRatingModDialog,
      { config: WILDSEA },
      '/systems/the-wildsea/templates/dialogs/design_rating_mod.hbs',
    )

    if (data.cancelled) return

    data.id = foundry.utils.randomID()
    const ratingMods =
      this.item.system.ratingMods != null
        ? [...this.item.system.ratingMods]
        : []
    ratingMods.push(data)

    this.item.update({
      system: {
        ratingMods,
      },
    })
  }

  static async _onEditRatingMod(event, target) {
    event.preventDefault()
    const ratingModId = target.dataset.ratingModId
    const ratingMods = this.item.system.ratingMods
    const ratingMod = ratingMods.filter((e) => e.id === ratingModId)[0]

    const data = await renderDialog(
      game.i18n.localize('wildsea.ratingMod'),
      WildseaShipItemSheet._processRatingModDialog,
      {
        config: WILDSEA,
        ...ratingMod,
      },
      '/systems/the-wildsea/templates/dialogs/design_rating_mod.hbs',
    )

    if (data.cancelled) return

    ratingMod.rating = data.rating
    ratingMod.value = data.value

    this.item.update({
      system: {
        ratingMods,
      },
    })
  }

  static _onDeleteRatingMod(event, target) {
    event.preventDefault()
    const ratingModId = target.dataset.ratingModId
    this.item.update({
      system: {
        ratingMods: this.item.system.ratingMods.filter(
          (e) => e.id !== ratingModId,
        ),
      },
    })
  }

  static _processRatingModDialog(html) {
    const form = html[0].querySelector('form')
    return {
      rating: form.rating.value,
      value: parseInt(form.value.value || 0),
    }
  }

  static _onEditEffect(event, target) {
    event.preventDefault()
    const effectId = target.dataset.effectId
    this.item.effects.get(effectId).sheet.render({ force: true })
  }

  static _onDeleteEffect(event, target) {
    event.preventDefault()
    const effectId = target.dataset.effectId
    this.item.deleteEmbeddedDocuments('ActiveEffect', [effectId])
  }
}
