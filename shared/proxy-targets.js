export const proxyTargets = Object.freeze({
  profile: 'https://data.guptadhruv.dev',
  content: 'https://content.guptadhruv.dev',
})

export const proxyTargetNames = Object.freeze({
  profile: 'profile',
  content: 'content',
})

export const proxyTargetByHostname = Object.freeze(
  Object.fromEntries(
    Object.entries(proxyTargets).map(([targetName, origin]) => [
      new URL(origin).hostname,
      targetName,
    ]),
  ),
)
