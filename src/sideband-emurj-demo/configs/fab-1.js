import { sizingSteps, SIZING_CTA } from './sizingFlow'

/* FAB prototype 1 — sizing-info flow, FAB entry, no timer.
 * Differs from fab-2/3 only in `entry.timer` and `theming`.
 */
export default {
  id: 'fab-1',
  title: 'FAB · No timer',
  page: 'product-detail',
  description: 'Pill FAB with no dismiss timer — dismiss via the X badge. Sizing-info flow.',
  entry: { type: 'fab', timer: 'none', cta: SIZING_CTA },
  // Theming stubbed to the neutral default; one-line edit per subtree when chosen.
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: sizingSteps,
}
