import { registerWildseaTrackSettings } from './settings.js'
import { WildseaTrackDatabase } from './db.js'
import { WildseaTrackPanel } from './panel.js'

export const setup = () => {
  registerWildseaTrackSettings()
  game.wildsea.trackDatabase = new WildseaTrackDatabase()
  game.wildsea.trackPanel = new WildseaTrackPanel(game.wildsea.trackDatabase)
  game.wildsea.trackDatabase.refresh()

  Handlebars.registerHelper('renderTrack', (track) => track.render())

  Hooks.on('createSetting', (setting) => {
    if (setting.key === 'wildsea.activeTracks') {
      game.wildsea.trackDatabase.refresh()
    }
  })
}
