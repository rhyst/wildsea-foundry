import { clickModifiers } from '../../helpers.js'
import WildseaTrack from './track.js'
import SortableJS from '../../lib/sortable.complete.esm.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

export class WildseaTrackPanel extends HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(db, options = {}) {
    super(options)
    this.db = db
    this.sortable = null
  }

  static DEFAULT_OPTIONS = {
    id: 'wildsea-tracks-panel',
    classes: ['wildsea', 'track-panel'],
    window: {
      frame: false,
    },
  }

  _insertElement(element) {
    const top = document.querySelector('#ui-top')
    if (top) {
      top.insertAdjacentElement('afterend', element)
    } else {
      document.body.appendChild(element)
    }
  }

  static PARTS = {
    panel: {
      template: 'systems/the-wildsea/templates/applications/tracks/panel.hbs',
    },
  }

  async _prepareContext(options) {
    const tracks = await this.prepareTracks()
    return {
      options: {
        editable: game.user.isGM,
      },
      tracks,
      position: game.settings.get('wildsea', 'trackPosition'),
    }
  }

  async prepareTracks() {
    const tracks = game.wildsea.trackDatabase.contents
    return tracks.map((track) => new WildseaTrack(track))
  }

  _onRender(context, options) {
    super._onRender(context, options)

    this.sortable?.destroy()
    this.sortable = null

    if (!game.user.isGM) return

    // SortableJS for reordering tracks
    const trackList = this.element.querySelector('.track-list')
    if (trackList) {
      this.sortable = new SortableJS(trackList, {
        animation: 200,
        direction: 'vertical',
        draggable: '.wildsea-track-row',
        dragClass: 'wildsea-drag-preview',
        ghostClass: 'wildsea-drag-placeholder',
        onEnd: (event) => {
          const id = event.item.dataset.trackId
          const newIndex = event.newDraggableIndex
          game.wildsea.trackDatabase.moveTrack(id, newIndex)
        },
      })
    }
  }

  async _onClickAction(event, target) {
    event.preventDefault()

    switch (target.dataset.action) {
      case 'addTrack':
        return this._onAddTrack()
      case 'editTrack':
        return this._onEditTrack(target)
      case 'deleteTrack':
        return this._onDeleteTrack(target)
      case 'toggleTrackSlot':
        return this._onToggleTrackSlot(event, target)
      default:
        return super._onClickAction(event, target)
    }
  }

  _onClose(options) {
    this.sortable?.destroy()
    this.sortable = null
    super._onClose(options)
  }

  async _onAddTrack() {
    if (!game.user.isGM) return

    const data = await this.db.showTrackDialog('wildsea.TRACKS.addTrack')
    if (data.cancelled) return

    this.db.addTrack({ ...data })
  }

  async _onEditTrack(target) {
    if (!game.user.isGM) return

    const id = target.closest('.wildsea-track-row')?.dataset.trackId
    if (!id) return

    const track = this.db.get(id)
    const data = await this.db.showTrackDialog(
      'wildsea.TRACKS.editTrack',
      track,
    )
    if (data.cancelled) return

    this.db.updateTrack(id, data)
  }

  _onDeleteTrack(target) {
    if (!game.user.isGM) return

    const id = target.closest('.wildsea-track-row')?.dataset.trackId
    if (!id) return

    this.db.deleteTrack(id)
  }

  _onToggleTrackSlot(event, target) {
    if (!game.user.isGM) return

    const id = target.closest('.wildsea-track-row')?.dataset.trackId
    if (!id) return

    const slotState = target.dataset.slotState ?? 'empty'
    const filledSlot = slotState !== 'empty'
    const burnAction =
      slotState === 'burned' || (!filledSlot && clickModifiers(event))

    this.db.markTrack(id, burnAction, filledSlot ? -1 : 1)
  }
}
