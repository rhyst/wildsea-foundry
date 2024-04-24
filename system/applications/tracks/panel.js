import { renderDialog } from '../../dialog.js'
import { clickModifiers } from '../../helpers.js'
import WildseaTrack from './track.js'

export class WildseaTrackPanel extends Application {
  constructor(db, options) {
    super(options)
    this.db = db
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      id: 'wildsea-tracks-panel',
      popOut: false,
      template: 'systems/wildsea/templates/applications/tracks/panel.hbs',
    }
  }

  async getData(options) {
    const data = await super.getData(options)
    const tracks = await this.prepareTracks()
    return {
      ...data,
      options: {
        editable: game.user.isGM,
      },
      tracks,
    }
  }

  async prepareTracks() {
    const tracks = game.wildsea.trackDatabase.contents
    return tracks.map((track) => new WildseaTrack(track))
  }

  activateListeners(html) {
    if (game.user.isGM) {
      html.find('.addTrack').click(this.addTrack.bind(this))
      html.find('.label').click(this.editTrack.bind(this))
      html.find('.delete').click(this.interactWithTrack.bind(this, 'delete'))
      html.find('.slots').click(this.interactWithTrack.bind(this, 'mark'))
      html
        .find('.slots')
        .contextmenu(this.interactWithTrack.bind(this, 'unmark'))
    }
  }

  async addTrack(event) {
    event.preventDefault()

    const data = await renderDialog(
      game.i18n.localize('wildsea.TRACKS.addTrack'),
      this.handleDialogData,
      {},
      '/systems/wildsea/templates/applications/tracks/dialog.hbs',
    )
    if (data.cancelled) return

    const { label, groups, firefly } = data
    if (label.trim() === '' || groups === '') return

    game.wildsea.trackDatabase.addTrack({
      label,
      groups,
      firefly,
    })
  }

  async editTrack(event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId
    const track = game.wildsea.trackDatabase.get(id)
    const data = await renderDialog(
      game.i18n.localize('wildsea.TRACKS.editTrack'),
      this.handleDialogData,
      { ...track },
      '/systems/wildsea/templates/applications/tracks/dialog.hbs',
    )
    if (data.cancelled) return

    game.wildsea.trackDatabase.updateTrack(id, data)
  }

  handleDialogData(html) {
    const form = html[0].querySelector('form')
    const groups = form.groups.value
      .trim()
      .split(',')
      .map((v) => v.trim())
      .join(',')
    return {
      label: form.label.value.trim(),
      groups,
      firefly: form.firefly.checked,
    }
  }

  async interactWithTrack(action, event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId

    switch (action) {
      case 'mark':
        game.wildsea.trackDatabase.markTrack(id, clickModifiers(event))
        break
      case 'unmark':
        game.wildsea.trackDatabase.markTrack(id, clickModifiers(event), -1)
        break
      case 'delete':
        game.wildsea.trackDatabase.deleteTrack(id)
        break

      default:
        break
    }
  }
}
