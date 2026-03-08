import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'

export default class WildseaAttributeSheet extends WildseaItemSheet {
  static DEFAULT_OPTIONS = {
    classes: ['wildsea', 'item-sheet'],
    position: {
      width: 600,
      height: 400,
    },
  }

  static PARTS = {
    form: {
      template: `${WILDSEA.root_path}/templates/sheets/attribute.hbs`,
    },
  }
}
