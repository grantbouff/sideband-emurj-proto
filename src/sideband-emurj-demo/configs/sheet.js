/* Sheet prototype — filters/search flow. Direct sheet: opens on load, no entry
 * point. binary step is the first sheet step.
 *
 * Every step supports optional `eyebrow` (small label above the heading) and
 * `description` (supporting copy below the heading). Leave as '' to omit.
 *
 * COPY STATUS: synced from the Notion copy deck (SideBand × EMURJ — copy deck),
 * 2026-07-23. The negative branch remains authored (not drawn in Figma).
 */
export default {
  id: 'sheet',
  title: 'Sheet',
  page: 'search',
  description: 'Sheet that opens directly (no entry point). Search/filters flow.',
  entry: { type: 'sheet' },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: [
    {
      type: 'binary',
      eyebrow: 'Quick question…',
      heading: 'Are the filters helpful?',
      description: '',
      // Post-rating feedback, held before advancing — mirrors the branch tone.
      responses: {
        positive: 'Nice! Glad you found it.',
        negative: 'Oh sorry about that. Let’s fix that.',
      },
    },
    {
      branch: {
        positive: [
          {
            type: 'chips',
            eyebrow: '',
            heading: 'How important is price when searching for pieces?',
            description: 'Choose based on your list common scenario',
            options: [
              { label: 'It’s Essential', value: 'essential' },
              { label: 'Moderately', value: 'moderately' },
              { label: 'Not Very', value: 'not-very' },
              { label: 'Other', value: 'other', type: 'other' },
            ],
            // `Other` diverts into this freeform step (same design as the
            // closing text sheet), then the flow continues as usual.
            otherStep: {
              eyebrow: '',
              heading: 'Tell us in your own words',
              description: 'How does price factor into your search?',
              placeholder: 'Type whatever you like…',
            },
          },
        ],
        // Authored to match the pattern — not present in Figma.
        negative: [
          {
            type: 'chips',
            eyebrow: '',
            heading: 'What was missing from the filters?',
            description: '',
            options: [
              { label: 'Specific categories', value: 'categories' },
              { label: 'Better price ranges', value: 'price-ranges' },
              { label: 'Style filters', value: 'style-filters' },
              { label: 'Availability filters', value: 'availability' },
              { label: 'Something else', value: 'other', type: 'other' },
            ],
            otherStep: {
              eyebrow: '',
              heading: 'Tell us in your own words',
              description: 'What was missing for you?',
              placeholder: 'Type whatever you like…',
            },
          },
        ],
      },
    },
    {
      type: 'text',
      eyebrow: '',
      heading: 'Any other controls you would find useful when searching?',
      description: '',
      placeholder: 'Your feedback (optional)…',
    },
    {
      type: 'end',
      eyebrow: '',
      heading: 'Thank you',
      description: 'We appreciate you taking the time to improve the experience.',
      media: 'checkmark',
    },
  ],
}
