import { sizingSteps, SIZING_CTA } from './sizingFlow'

/* FAB prototype 2 — sizing-info flow, FAB entry, background-fill timer.
 * Differs from fab-1/3 only in `entry.timer` and `theming`.
 */
export default {
  id: 'fab-2',
  title: 'FAB · Background timer',
  page: 'product-detail',
  description: 'Pill FAB with a background fill that sweeps before auto-dismiss. Sizing-info flow.',
  entry: { type: 'fab', timer: 'background', cta: SIZING_CTA, dismissTimer: 8 },
  theming: { fab: { theme: 'darker' }, modal: { theme: 'lighter' } },
  steps: sizingSteps,
}
