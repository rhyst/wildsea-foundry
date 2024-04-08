import { WILDSEA } from '../config.js'

const blankPool = {
  uuid: null,
  edge: '',
  skillLanguage: '',
  advantage: 0,
  cut: 0,
}

export default class WildseaDicePool extends FormApplication {
  constructor(uuid = null) {
    super()

    this.dicePool = blankPool
    this.dicePool.uuid = uuid || game.user.character?.uuid || null
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'user-dice-pool',
      template: 'systems/wildsea/templates/applications/dice_pool.hbs',
      title: game.i18n.localize('wildsea.dicePoolTitle'),
      // classes: ['wildsea', 'user-dice-pool'],
      width: 400,
      height: 'auto',
      resizable: false,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    })
  }

  async getData() {
    const context = { ...this.dicePool }
    context.config = WILDSEA

    // Actor
    this.actor = this.dicePool.uuid ? await fromUuid(this.dicePool.uuid) : null

    if (!this.actor) {
      const error = game.i18n.localize('wildsea.userNotFound')
      ui.notifications.error(error)
      throw new Error(error)
    }

    if (!this.actor.isOwner) {
      const error = game.i18n.localize('wildsea.userNotPermitted')
      ui.notifications.error(error)
      throw new Error(error)
    }

    context.edges = this.actor.system.edges
    context.skills = this.actor.system.skills
    context.languages = this.actor.system.languages

    return context
  }

  activateListeners(html) {
    html.find('.submit').click(this.handleSubmit.bind(this))
    html.find('.cancel').click(this.handleCancel.bind(this))

    super.activateListeners(html)
  }

  async toggle() {
    if (!this.rendered) {
      await this.render(true)
    } else {
      this.close()
    }
  }

  _updateObject(event, formData) {
    event.preventDefault()
    this.dicePool = {
      ...this.dicePool,
      ...formData,
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    this.doRoll({ ...this.dicePool })
    this.close()
    this.dicePool = blankPool
  }

  handleCancel(event) {
    event.preventDefault()
    this.close()
  }

  async doRoll(dicePool) {
    console.log(dicePool)
    const system = this.actor.system

    const edgeDice = system.edges[dicePool.edge] || 0
    dicePool.edgeDice = edgeDice

    const [skillType, skillKey] = dicePool.skillLanguage.split('.')
    dicePool.skillType = skillType.slice(0, -1)
    dicePool.skillKey = skillKey

    const skillDice = system[skillType]?.[skillKey] || 0
    dicePool.skillDice = skillDice

    const advantageDice = parseInt(dicePool.advantage)

    const totalDice = edgeDice + skillDice + advantageDice
    const cutDice = parseInt(dicePool.cut)

    if (totalDice - cutDice <= 0) {
      ui.notifications.error('No dice to roll!')
      return
    }

    const roll = await new Roll(`${totalDice}d6`).roll({
      async: true,
    })

    // sort results
    const results = roll.terms[0].results
      .map(({ active, ...keep }) => keep)
      .sort((a, b) => (a.result < b.result ? -1 : 1))

    const keptResults = cutDice > 0 ? results.slice(0, -cutDice) : results
    for (const r of keptResults) r.cut = false

    keptResults[keptResults.length - 1].max = true
    const total = keptResults[keptResults.length - 1].result

    // look for doubles
    const keptNumbers = keptResults.map((r) => r.result)
    const twist =
      keptNumbers.filter((item, index) => keptNumbers.indexOf(item) !== index)
        .length > 0

    // get the cut results
    let cutResults = []
    if (cutDice > 0) {
      cutResults = results.slice(-cutDice)
      for (const r of cutResults) r.cut = true
    }

    let displayFormula = `${totalDice}d`
    if (cutDice > 0) {
      displayFormula += ` ${game.i18n.localize('wildsea.cut')} ${cutDice}`
    }

    let resultText = ''
    switch (total) {
      case 6:
        resultText = 'triumph'
        break
      case 5:
      case 4:
        resultText = 'conflict'
        break
      default:
        resultText = 'disaster'
        break
    }

    const outcome = {
      dicePool,
      results: [...keptResults, ...cutResults],
      twist,
      total,
      displayFormula,
      resultText,
    }

    console.log(outcome)

    const template = 'systems/wildsea/templates/chat/roll.hbs'
    const html = await renderTemplate(template, outcome)

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: html,
    }
    ChatMessage.create(chatData)
  }
}
