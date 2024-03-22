import { WILDSEA } from './system/config.js'
import { loadHandlebarsPartials } from './system/preload.js'
import WildseaPlayerSheet from './system/sheets/player.js'

Hooks.once('init', () => {
  console.log('wildsea | Initializing')

  CONFIG.wildsea = WILDSEA

  loadHandlebarsPartials()

  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('wildsea', WildseaPlayerSheet, {
    makeDefault: true,
    types: ['player'],
  })

  Handlebars.registerHelper('times', function (n, content) {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })
})
