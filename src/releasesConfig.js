// Release definitions — which concepts exist in each release
export const RELEASES = {
  r1: {
    nick: [
      { id: 1, page: 'product-detail' },
      { id: 2, page: 'product-detail' },
      { id: 3, page: 'product-detail' },
      { id: 4, page: 'product-detail' },
      { id: 5, page: 'product-detail' },
      { id: 6, page: 'product-detail' },
    ],
    grant: [
      { id: 1, page: 'product-detail' },
      { id: 2, page: 'home' },
      { id: 3, page: 'home' },
      { id: 4, page: 'home' },
      { id: 5, page: 'product-detail' },
      { id: 6, page: 'home' },
      { id: 7, page: 'home' },
    ],
  },
  r2: {
    nick: [
      { id: 1, page: 'product-detail' },
      { id: 2, page: 'product-detail' },
      { id: 3, page: 'product-detail' },
      { id: 4, page: 'product-detail' },
    ],
    grant: [],
  },
}

export function getNavConfig(release) {
  return RELEASES[release] || RELEASES.r2
}
