const { renderTemplate } = foundry.applications.handlebars

export const renderDialog = async (
  title,
  handler = (_html = '') => {},
  data = {},
  template = '/systems/the-wildsea/templates/dialogs/simple.hbs',
) => {
  const content = await renderTemplate(template, data)

  const result = await foundry.applications.api.DialogV2.wait({
    window: {
      title,
    },
    content,
    rejectClose: false,
    modal: true,
    buttons: [
      {
        action: 'yes',
        label: game.i18n.localize('wildsea.submit'),
        icon: 'fas fa-check',
        default: true,
        callback: (_event, _button, dialog) => handler([dialog.element]),
      },
      {
        action: 'cancel',
        label: game.i18n.localize('wildsea.cancel'),
        icon: 'fas fa-times',
      },
    ],
  })

  return result ?? { cancelled: true }
}
