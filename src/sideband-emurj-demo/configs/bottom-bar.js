/* Bottom-bar prototype — payments/checkout flow.
 * The bottom bar's thumbs ARE the binary rating: on rate we set sentiment and
 * skip steps[0] (the binary step, kept for shared-shape consistency).
 *
 * COPY STATUS: authored to match the SideBand `Pulses` flow pattern. Transcribe
 * against Figma `Bottom Bar` (section `Pulses`) and adjust — FLAG FOR REVIEW.
 */
export default {
  id: 'bottom-bar',
  title: 'Bottom bar',
  page: 'product-detail',
  description: 'Full-width bottom bar with inline thumbs. Checkout-experience flow.',
  entry: { type: 'bottom-bar', cta: 'How was your checkout experience?', dismissTimer: 12 },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: [
    { type: 'binary', heading: 'How was your checkout experience?' },
    {
      branch: {
        positive: [
          {
            type: 'chips',
            heading: 'Great to hear!',
            body: 'What went smoothly?',
            options: [
              { label: 'Fast', value: 'fast' },
              { label: 'Easy to enter details', value: 'easy-details' },
              { label: 'Trusted the process', value: 'trusted' },
              { label: 'Saved payment worked', value: 'saved-payment' },
              { label: 'Something else', value: 'other', type: 'other' },
            ],
          },
        ],
        negative: [
          {
            type: 'chips',
            heading: 'Sorry to hear that.',
            body: 'What went wrong?',
            options: [
              { label: 'Payment declined', value: 'declined' },
              { label: 'Too many steps', value: 'too-many-steps' },
              { label: 'Confusing form', value: 'confusing' },
              { label: 'Too slow', value: 'slow' },
              { label: 'Something else', value: 'other', type: 'other' },
            ],
          },
        ],
      },
    },
    { type: 'text', heading: 'Anything else you’d like to share with the team?', placeholder: 'Your feedback (optional)…' },
    { type: 'end', heading: 'Thank you', body: 'Your feedback helps us improve checkout.', media: 'checkmark' },
  ],
}
