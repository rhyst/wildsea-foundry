import { WILDSEA } from './system/config.js'
import {
  loadHandlebarsHelpers,
  loadHandlebarsPartials,
} from './system/preload.js'
import WildseaAspectSheet from './system/sheets/aspect.js'
import WildseaPlayerSheet from './system/sheets/player.js'
import WildseaResourceSheet from './system/sheets/resource.js'

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
  Items.registerSheet('wildsea', WildseaAspectSheet, {
    types: ['aspect', 'temporaryTrack'],
  })
  Items.registerSheet('wildsea', WildseaResourceSheet, { types: ['resource'] })

  CONFIG.TinyMCE.content_css = `${WILDSEA.root_path}/styles/tinymce.css`

  loadHandlebarsHelpers()
})
