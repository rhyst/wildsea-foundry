export const registerWildseaTrackSettings = () => {
  game.settings.register('wildsea', 'activeTracks', {
    name: 'Active Tracks',
    scope: 'world',
    type: Object,
    default: {},
    config: false,
    onChange: () => game.wildsea.trackDatabase.refresh(),
  })
}
