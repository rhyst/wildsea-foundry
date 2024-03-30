import { WILDSEA } from './system/config.js'
import { loadHandlebarsPartials } from './system/preload.js'
import WildseaPlayerSheet from './system/sheets/player.js'
import WildseaAspectSheet from './system/sheets/aspect.js'

Hooks.once('init', () => {
  console.log('wildsea | Initializing')

  CONFIG.wildsea = WILDSEA

  loadHandlebarsPartials()

  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('wildsea', WildseaPlayerSheet, {
    makeDefault: true,
    types: ['player'],
  })

  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('wildsea', WildseaAspectSheet)

  CONFIG.TinyMCE.content_css = `${WILDSEA.root_path}/styles/tinymce.css`

  Handlebars.registerHelper('times', (n, content) => {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })

  Handlebars.registerHelper('fieldType', (type = null) => type || 'text')
  Handlebars.registerHelper('any', (array) => (array?.length || 0) > 0)
  Handlebars.registerHelper('byKey', (array, key) => {
    return array[key]
  })
})
