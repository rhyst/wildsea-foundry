import { enrich } from './helpers.js'

export const setupEnrichers = () => {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // RollTable
      pattern: /@DisplayItem\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichItem(match),
    },
  ])
}

const enrichItem = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name

  const container = document.createElement('div')
  container.className = 'wildsea-item'
  let html = `@UUID[${uuid}]{${itemName}}`

  if (item) {
    const traits = []
    if (item.system.stakes) traits.push(stakesText(item.system.stakes))
    if (item.system.track && item.system.track.max > 0)
      traits.push(trackText(item.system.track))
    if (item.system.type) {
      if (!['design', 'fitting'].includes(item.type))
        traits.push(item.system.type)
    }

    html = `<h3><a class="content-link" data-link draggable="true" data-uuid="${item.uuid}" data-id="${item.id}">${itemName}</a>`
    if (traits.length > 0) html += ` <small>${traits.join(' ')}</small>`
    html += '</h3>'
    if (item.system.details) html += item.system.details
    if ((item.system.ratingMods?.length || 0) > 0) {
      html += '<ul>'
      html += item.system.ratingMods
        .map((mod) => {
          const sign = mod.value >= 0 ? '+' : ''
          return `<li><strong>${game.i18n.localize(
            `wildsea.${mod.rating}`,
          )} ${sign}${mod.value}</strong></li>`
        })
        .join('')
      html += '</ul>'
    }
  }

  container.innerHTML = await enrich(html)
  return container
}

const trackText = (track) => {
  return `${track.max}-Track`
}

const stakesText = (s) => {
  const stakes = parseInt(s)
  if (stakes === 0) return game.i18n.localize('wildsea.free')
  if (stakes === 1) return game.i18n.localize('wildsea.stakesOne')
  return game.i18n.format('wildsea.stakesMany', { stakes })
}
