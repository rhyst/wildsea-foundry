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
    // do the roll
    this.doRoll()

    // Reset the pool
    this.dicePool = blankPool
    this.close()
  }

  handleCancel(event) {
    event.preventDefault()
    this.close()
  }

  async doRoll() {
    console.log(this.dicePool)
    const system = this.actor.system

    const edgeDice = system.edges[this.dicePool.edge] || 0
    const [skillType, skillKey] = this.dicePool.skillLanguage.split('.')
    const skillDice = system[skillType]?.[skillKey] || 0
    const advantageDice = parseInt(this.dicePool.advantage)

    const totalDice = edgeDice + skillDice + advantageDice
    const cutDice = parseInt(this.dicePool.cut)

    if (totalDice - cutDice <= 0) {
      ui.notifications.error('No dice to roll!')
      return
    }

    const formula = `${totalDice}d6`

    console.log(formula)

    const roll = await new Roll(formula).roll({
      async: true,
    })
    // const renderedRoll = await roll.render()

    console.log(roll.terms[0].results)

    //TODO: sort results high->low, discard first [cut] results, keep the next one
    //TODO: detect doubles
    //TODO: output chat result
  }
}
