import { WILDSEA } from '../config.js'
import { clamp, generateId } from '../helpers.js'
import { renderDialog } from '../dialog.js'

export default class WildseaActorSheet extends ActorSheet {
  itemContextMenu = [
    {
      name: game.i18n.localize('wildsea.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.sendItemToChat(itemId)
      },
    },
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.items.get(itemId).sheet.render(true)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.deleteEmbeddedDocuments('Item', [itemId])
      },
    },
  ]

  slimContextMenu = [
    {
      name: game.i18n.localize('wildsea.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.sendSlimToChat(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.editSlimItem(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.removeSlimItem(itemId, itemType)
      },
    },
  ]

  async addSlimItem(itemType, itemSubtype = null) {
    const data = await renderDialog(
      game.i18n.format('wildsea.newSlim', {
        type: game.i18n.localize(`wildsea.${itemType}`),
      }),
      this.processSlimDialog,
    )

    if (data.cancelled) return

    const text = data.text

    const id = generateId()
    const slimData = {
      id,
      text,
      ...(WILDSEA.slimDefaults[itemType] || {}),
    }

    if (itemSubtype) slimData['subtype'] = itemSubtype

    const items = [...this.actor.system[itemType]]
    items.push(slimData)

    this.actor.update({
      system: {
        [itemType]: items,
      },
    })
  }

  async editSlimItem(itemId, itemType) {
    const items = this.actor.system[itemType]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const data = await renderDialog(
        game.i18n.format(
          'wildsea.editSlim',
          game.i18n.localize(`wildsea.${itemType}`),
        ),
        this.processSlimDialog,
        item,
      )

      if (data.cancelled) return

      item.text = data.text

      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
    }
  }

  processSlimDialog(html) {
    const form = html[0].querySelector('form')
    return { text: form.text.value.trim() }
  }

  async adjustSlimTrack(itemId, itemType, value = 1) {
    const items = [...this.actor.system[itemType]]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const currentValue = item.track.value
      const newValue = clamp(currentValue + value, item.track.max)

      item.track.value = newValue

      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
    }
  }

  async removeSlimItem(itemId, itemType) {
    this.actor.update({
      system: {
        [itemType]: this.actor.system[itemType].filter(
          (item) => item.id !== itemId,
        ),
      },
    })
  }

  async sendSlimToChat(itemId, itemType) {
    const item = this.actor.system[itemType].filter((i) => i.id === itemId)[0]
    if (item) {
      item.title = game.i18n.localize(`wildsea.${itemType}`)

      const template = 'systems/wildsea/templates/chat/slim.hbs'
      const html = await renderTemplate(template, item)

      const chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: html,
      }
      ChatMessage.create(chatData)
    }
  }

  async sendItemToChat(itemId) {
    const item = this.actor.items.get(itemId)
    if (item) {
      const template = 'systems/wildsea/templates/chat/item.hbs'
      const html = await renderTemplate(template, item)

      const chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: html,
      }
      ChatMessage.create(chatData)
    }
  }
}
