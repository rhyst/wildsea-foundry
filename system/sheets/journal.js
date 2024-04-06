export default class WildseaJournalSheet extends JournalSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 1200,
    })
  }
}
