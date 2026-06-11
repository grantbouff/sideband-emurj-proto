const KEY = (user, id) => `concept-config-${user}-${id}`

export function loadConceptConfig(defaults) {
  try {
    const [,, user, conceptId] = window.location.hash.slice(1).split('/')
    const stored = localStorage.getItem(KEY(user, conceptId))
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch {
    return defaults
  }
}

export function saveConceptConfig(body) {
  try {
    const { user, conceptId, ...config } = body
    localStorage.setItem(KEY(user, conceptId), JSON.stringify(config))
  } catch {}
}
