const KEY = (user, id) => `concept-config-${user}-${id}`

// Pulls user + id out of /<base>/concept/:user/:conceptId/:page
export function currentConcept() {
  const parts = window.location.pathname.split('/')
  const i = parts.indexOf('concept')
  return i === -1 ? [] : [parts[i + 1], parts[i + 2]]
}

export function loadConceptConfig(defaults) {
  try {
    const [user, conceptId] = currentConcept()
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
