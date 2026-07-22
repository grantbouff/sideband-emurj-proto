/* Shared content for the three FAB prototypes (sizing-info flow).
 * fab-1/2/3 import this and override only `entry.timer` and `theming`.
 *
 * COPY STATUS: authored to match the SideBand `Pulses` flow pattern. Transcribe
 * against Figma `FAB Options (3)` (section `Pulses`) and adjust — placeholder
 * wording, FLAG FOR DESIGN REVIEW.
 */
export const sizingSteps = [
  {
    type: 'binary',
    heading: 'Did you find the sizing info you needed?',
    // Post-rating feedback: swapped in for the question (bottom-bar
    // treatment) and held for a beat before the flow advances.
    responses: {
      positive: 'Awesome! We love to hear that.',
      negative: 'Oh sorry about that. Let’s fix that.',
    },
  },
  {
    branch: {
      positive: [
        {
          type: 'chips',
          heading: 'Awesome! We love to hear that.',
          body: 'What made the sizing easy to find?',
          options: [
            { label: 'Size guide', value: 'size-guide' },
            { label: 'Product description', value: 'description' },
            { label: 'Fit recommendations', value: 'fit-rec' },
            { label: 'Model measurements', value: 'model-measurements' },
            { label: 'Something else', value: 'other', type: 'other' },
          ],
        },
      ],
      negative: [
        {
          type: 'chips',
          heading: 'Oh sorry about that. Let’s fix that.',
          body: 'What was missing or unclear?',
          options: [
            { label: 'No size guide', value: 'no-guide' },
            { label: 'Unclear measurements', value: 'unclear' },
            { label: 'Wrong recommendation', value: 'wrong-rec' },
            { label: 'Couldn’t find it', value: 'not-found' },
            { label: 'Something else', value: 'other', type: 'other' },
          ],
        },
      ],
    },
  },
  {
    type: 'text',
    heading: 'Anything else you’d like to share with the team?',
    placeholder: 'Your feedback (optional)…',
  },
  {
    type: 'end',
    heading: 'Thank you',
    body: 'Your feedback helps us improve sizing for everyone.',
    media: 'checkmark',
  },
]

export const SIZING_CTA = 'Did you find the sizing info you needed?'
