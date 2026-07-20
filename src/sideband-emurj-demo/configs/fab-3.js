import { sizingSteps, SIZING_CTA } from './sizingFlow'

/* FAB prototype 3 — sizing-info flow, FAB entry, hairline timer.
 * Differs from fab-1/2 only in `entry.timer` and `theming`.
 */
export default {
  id: 'fab-3',
  title: 'FAB · Hairline timer',
  page: 'product-detail',
  description: 'Pill FAB with a brand hairline that drains before auto-dismiss. Sizing-info flow.',
  entry: { type: 'fab', timer: 'hairline', cta: SIZING_CTA, dismissTimer: 8 },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: sizingSteps,
}
