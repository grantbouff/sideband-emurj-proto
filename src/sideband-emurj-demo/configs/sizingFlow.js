/* Shared content for the three FAB prototypes (sizing-info flow).
 * fab-1/2/3 import this and override only `entry.timer` and `theming`.
 *
 * Every step supports optional `eyebrow` (small label above the heading) and
 * `description` (supporting copy below the heading). Leave as '' to omit.
 *
 * COPY STATUS: synced from the Notion copy deck (SideBand × EMURJ — copy deck),
 * 2026-07-23.
 */
export const sizingSteps = [
  {
    type: 'binary',
    eyebrow: 'Quick question…',
    heading: 'Did you find the sizing info you needed?',
    description: '',
    // Post-rating feedback: swapped in for the question (bottom-bar
    // treatment) and held for a beat before the flow advances.
    responses: {
      positive: 'Awesome! We love to hear that.',
      negative: 'Oh sorry. Let’s fix that.',
    },
  },
  {
    branch: {
      positive: [
        {
          type: 'chips',
          eyebrow: '',
          heading: 'What made sizing easy to understand?',
          description: '',
          options: [
            { label: 'Size guide', value: 'size-guide' },
            { label: 'Product description', value: 'description' },
            { label: 'Fit recommendations', value: 'fit-rec' },
            { label: 'Model measurements', value: 'model-measurements' },
            { label: 'Something else', value: 'other', type: 'other' },
          ],
          // `Something else` diverts into this freeform step (same design as
          // the closing text sheet), then the flow continues as usual.
          otherStep: {
            eyebrow: '',
            heading: 'Tell us in your own words',
            description: 'What made sizing easy to understand?',
            placeholder: 'Type whatever you like…',
          },
        },
      ],
      negative: [
        {
          type: 'chips',
          eyebrow: '',
          heading: 'What was missing or unclear?',
          description: '',
          options: [
            { label: 'Unclear measurements', value: 'unclear' },
            { label: 'Missing sizes', value: 'missing-sizes' },
            { label: 'Couldn’t find it', value: 'not-found' },
            { label: 'Something else', value: 'other', type: 'other' },
          ],
          otherStep: {
            eyebrow: '',
            heading: 'Tell us in your own words',
            description: 'What was missing or unclear?',
            placeholder: 'Type whatever you like…',
          },
        },
      ],
    },
  },
  {
    type: 'text',
    heading: 'Anything else to share with the team?',
    description: '',
    placeholder: 'Could be about product info or anything else…',
  },
  {
    type: 'end',
    eyebrow: '',
    heading: 'Thank you',
    description: 'Your feedback helps us improve sizing for everyone.',
    media: 'checkmark',
  },
]

export const SIZING_CTA = 'Did you find the sizing info you needed?'
