export const enrich = async (html, secrets = false) => {
  if (html)
    return await TextEditor.enrichHTML(html, {
      secrets: secrets,
      async: true,
    })

  return html
}
