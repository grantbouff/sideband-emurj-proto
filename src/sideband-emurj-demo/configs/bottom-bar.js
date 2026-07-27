/* Bottom-bar prototype — payment-methods flow.
 * The bottom bar's thumbs ARE the binary rating, and the bar is terminal
 * (Figma 3603:19663 / 3603:19715): rating swaps the question for a response
 * and the bar closes itself on `ratedTimer`. No sheet follows — steps holds
 * only the shape-consistent binary step.
 *
 * COPY STATUS: synced from the Notion copy deck (SideBand × EMURJ — copy deck),
 * 2026-07-23.
 */
export default {
  id: 'bottom-bar',
  title: 'Bottom bar',
  page: 'product-detail',
  description: 'Full-width bottom bar with inline thumbs. Payment-methods flow.',
  entry: {
    type: 'bottom-bar',
    cta: 'What do you think of the available payment methods?',
    dismissTimer: 12,
    responses: {
      positive: 'Great! Thanks for letting us know.',
      negative: 'Thanks. We’ll work on that.',
    },
    ratedTimer: 3,
  },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: [
    { type: 'binary', eyebrow: '', heading: 'What do you think of the available payment methods?', description: '' },
  ],
}
