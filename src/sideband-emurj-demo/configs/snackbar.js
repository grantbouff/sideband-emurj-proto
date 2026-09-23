import sheet from './sheet'

/* Snack Bar prototype — filters/search flow (Figma 4935:17532).
 * Looks like the FAB pill, but the bar is only a container: its thumbs are
 * the binary rating. Rating morphs the bar into the sheet on the follow-up
 * step, so the flow is the Sheet prototype's with its leading binary step
 * skipped (FlowRunner's openWithRating).
 *
 * COPY STATUS: CTA from the Figma frame; follow-up steps shared with sheet.js.
 */
export default {
  id: 'snackbar',
  title: 'Snack Bar',
  page: 'search',
  description: 'Snack bar with inline thumbs and a background timer. Rating opens the sheet. Search/filters flow.',
  // entrance: 'expand' (FAB-style circle → widen) | 'rise' (lift + fade).
  entry: {
    type: 'snackbar', entrance: 'expand', timer: 'background',
    cta: 'Are the filters helpful?', dismissTimer: 8,
  },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: sheet.steps,
}
