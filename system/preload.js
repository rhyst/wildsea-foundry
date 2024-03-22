export const loadHandlebarsPartials = () => {
  const partials = [
    'systems/wildsea/templates/shared/track.hbs',
    'systems/wildsea/templates/sheets/player/aspect.hbs',
    'systems/wildsea/templates/sheets/player/aspects.hbs',
    'systems/wildsea/templates/sheets/player/background.hbs',
    'systems/wildsea/templates/sheets/player/drives.hbs',
    'systems/wildsea/templates/sheets/player/edge.hbs',
    'systems/wildsea/templates/sheets/player/edges.hbs',
    'systems/wildsea/templates/sheets/player/languages.hbs',
    'systems/wildsea/templates/sheets/player/milestones.hbs',
    'systems/wildsea/templates/sheets/player/mire.hbs',
    'systems/wildsea/templates/sheets/player/mires.hbs',
    'systems/wildsea/templates/sheets/player/resources.hbs',
    'systems/wildsea/templates/sheets/player/skills.hbs',
  ]

  return loadTemplates(partials)
}
