export const loadHandlebarsPartials = () => {
  const partials = [
    'systems/wildsea/templates/shared/description.hbs',
    'systems/wildsea/templates/shared/number_field.hbs',
    'systems/wildsea/templates/shared/select_field.hbs',
    'systems/wildsea/templates/shared/text_field.hbs',
    'systems/wildsea/templates/shared/track.hbs',
    'systems/wildsea/templates/sheets/player/aspect.hbs',
    'systems/wildsea/templates/sheets/player/aspects.hbs',
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
    'systems/wildsea/templates/sheets/player/slim_item.hbs',
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
    (array) => (Object.values(array || [])?.length || 0) > 0,
  )
  Handlebars.registerHelper('byKey', (array, key) => array[key])

  Handlebars.registerHelper('join', (array, glue) => array.join(glue))
}
