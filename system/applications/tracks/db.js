import { clamp } from '../../helpers.js'

export class WildseaTrackDatabase extends Collection {
  getTrackData() {
    return game.settings.get('wildsea', 'activeTracks')
  }

  addTrack(data = {}) {
    const tracks = this.getTrackData()
    const max = data.groups.split(/[,\|]/).reduce((total, current) => {
      return total + parseInt(current)
    }, 0)
    const newTrack = {
      id: foundry.utils.randomID(),
      ...data,
      value: 0,
      burn: 0,
      max,
    }
    tracks[newTrack.id] = newTrack
    game.settings.set('wildsea', 'activeTracks', tracks)
  }

  updateTrack(id, data = {}) {
    const tracks = this.getTrackData()
    const max = data.groups.split(/[,\|]/).reduce((total, current) => {
      return total + (parseInt(current) || 0)
    }, 0)
    const burn = clamp(tracks[id].burn, max)
    const value = clamp(tracks[id].value, max)

    tracks[id] = {
      ...tracks[id],
      ...data,
      burn,
      value,
      max,
    }
    game.settings.set('wildsea', 'activeTracks', tracks)
  }

  moveTrack(id, newIndex) {
    const tracks = Object.values(this.getTrackData())
    const item = tracks.find((c) => c.id === id)
    if (!item) return

    tracks.splice(tracks.indexOf(item), 1)
    tracks.splice(newIndex, 0, item)
    const newData = Object.fromEntries(tracks.map((c) => [c.id, c]))
    game.settings.set('wildsea', 'activeTracks', newData)
  }

  deleteTrack(id) {
    const tracks = this.getTrackData()
    delete tracks[id]
    game.settings.set('wildsea', 'activeTracks', tracks)
  }

  markTrack(id, burn = false, amount = 1) {
    const tracks = this.getTrackData()
    if (burn) {
      tracks[id].burn = clamp(tracks[id].burn + amount, tracks[id].max)
    } else {
      tracks[id].value += amount
    }
    tracks[id].value = clamp(tracks[id].value, tracks[id].max, tracks[id].burn)
    game.settings.set('wildsea', 'activeTracks', tracks)
  }

  refresh() {
    this.clear()

    for (const track of Object.values(this.getTrackData()))
      this.set(track.id, track)

    if (canvas.ready) {
      game.wildsea.trackPanel.render(true)
    }
  }
}
