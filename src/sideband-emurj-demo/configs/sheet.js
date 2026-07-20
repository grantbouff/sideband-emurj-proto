/* Sheet prototype — filters/search flow. Direct sheet: opens on load, no entry
 * point. binary step is the first sheet step.
 *
 * COPY STATUS: authored to match the SideBand `Pulses` flow pattern. Transcribe
 * against Figma `Sheet` (section `Pulses`). NOTE: the negative branch is NOT
 * drawn in Figma — it is authored here to mirror the positive branch and the
 * other two flows. FLAG FOR DESIGN REVIEW.
 */
export default {
  id: 'sheet',
  title: 'Sheet',
  page: 'home',
  description: 'Sheet that opens directly (no entry point). Search/filters flow.',
  entry: { type: 'sheet' },
  theming: { fab: { theme: 'lighter' }, modal: { theme: 'lighter' } },
  steps: [
    { type: 'binary', heading: 'Did you find what you were looking for?' },
    {
      branch: {
        positive: [
          {
            type: 'chips',
            heading: 'Nice! Glad you found it.',
            body: 'What helped you get there?',
            options: [
              { label: 'Filters', value: 'filters' },
              { label: 'Search', value: 'search' },
              { label: 'Categories', value: 'categories' },
              { label: 'Recommendations', value: 'recommendations' },
              { label: 'Something else', value: 'other', type: 'other' },
            ],
          },
        ],
        // Authored to match the pattern — not present in Figma. FLAG FOR REVIEW.
        negative: [
          {
            type: 'chips',
            heading: 'Let’s improve that.',
            body: 'What made it hard to find?',
            options: [
              { label: 'Not enough filters', value: 'few-filters' },
              { label: 'Search didn’t work', value: 'bad-search' },
              { label: 'Too many results', value: 'too-many' },
              { label: 'Couldn’t refine', value: 'no-refine' },
              { label: 'Something else', value: 'other', type: 'other' },
            ],
          },
        ],
      },
    },
    { type: 'text', heading: 'Anything else you’d like to share with the team?', placeholder: 'Your feedback (optional)…' },
    { type: 'end', heading: 'Thank you', body: 'Your feedback helps us improve search.', media: 'checkmark' },
  ],
}
