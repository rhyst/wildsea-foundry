export const loadHandlebarsPartials = () => {
  const partials = [
    'systems/wildsea/templates/applications/tracks/track.hbs',
    'systems/wildsea/templates/shared/aspect.hbs',
    'systems/wildsea/templates/shared/aspects.hbs',
    'systems/wildsea/templates/shared/attribute.hbs',
    'systems/wildsea/templates/shared/description.hbs',
    'systems/wildsea/templates/shared/effects.hbs',
    'systems/wildsea/templates/shared/number_field.hbs',
    'systems/wildsea/templates/shared/rating_mods.hbs',
    'systems/wildsea/templates/shared/select_field.hbs',
    'systems/wildsea/templates/shared/slim_item.hbs',
    'systems/wildsea/templates/shared/text_field.hbs',
    'systems/wildsea/templates/shared/track.hbs',
    'systems/wildsea/templates/sheets/player/background.hbs',
    'systems/wildsea/templates/sheets/player/drives.hbs',
    'systems/wildsea/templates/sheets/player/edges.hbs',
    'systems/wildsea/templates/sheets/player/languages.hbs',
    'systems/wildsea/templates/sheets/player/list_track.hbs',
    'systems/wildsea/templates/sheets/player/milestones.hbs',
    'systems/wildsea/templates/sheets/player/mire.hbs',
    'systems/wildsea/templates/sheets/player/mires.hbs',
    'systems/wildsea/templates/sheets/player/resource.hbs',
    'systems/wildsea/templates/sheets/player/resources.hbs',
    'systems/wildsea/templates/sheets/player/skills.hbs',
    'systems/wildsea/templates/sheets/ship/cargo.hbs',
    'systems/wildsea/templates/sheets/ship/conditions.hbs',
    'systems/wildsea/templates/sheets/ship/design.hbs',
    'systems/wildsea/templates/sheets/ship/designs.hbs',
    'systems/wildsea/templates/sheets/ship/fittings.hbs',
    'systems/wildsea/templates/sheets/ship/rating.hbs',
    'systems/wildsea/templates/sheets/ship/ratings.hbs',
    'systems/wildsea/templates/sheets/ship/reputations.hbs',
    'systems/wildsea/templates/sheets/adversary/drives.hbs',
    'systems/wildsea/templates/sheets/adversary/aspects.hbs',
    'systems/wildsea/templates/sheets/adversary/presence.hbs',
    'systems/wildsea/templates/sheets/adversary/quirks.hbs',
    'systems/wildsea/templates/sheets/adversary/resource.hbs',
    'systems/wildsea/templates/sheets/adversary/resources.hbs',
  ]

  return loadTemplates(partials)
}

export const loadHandlebarsHelpers = () => {
  Handlebars.registerHelper('times', (n, content) => {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })

  Handlebars.registerHelper('fieldType', (type = null) => type || 'text')
  Handlebars.registerHelper(
    'any',
    (array) =>
      (array.name ? array.size : Object.values(array || [])?.length || 0) > 0,
  )
  Handlebars.registerHelper('byKey', (array, key) => {
    return array[key]
  })
  Handlebars.registerHelper('join', (array, glue) => array.join(glue))
  Handlebars.registerHelper('displayNumber', (value) =>
    value >= 0 ? `+${value}` : value,
  )
  // Returns a track cell which is either marked, burned, or empty based on the information provided.
  Handlebars.registerHelper('trackCell', (index, value, burn) => {
    const css_class = index <= burn ? 'burned' : index <= value ? 'checked' : ''
    return `<li class="box ${css_class}"><span class="dot" data-index=${index}"></span></li>`
  })
  Handlebars.registerHelper('pluralize', (key, value) =>
    game.i18n.format(value === 1 ? `wildsea.${key}One` : `wildsea.${key}Many`, {
      value,
    }),
  )
}
