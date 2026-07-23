# SideBand × EMURJ — copy deck

> **Source of truth now lives in Notion:**
> https://app.notion.com/p/cmd-k/SideBand-EMURJ-copy-deck-3a6463d6eeb380ecb1acf6640663081c
> This file matches the implemented flow configs as of 2026-07-23. Edit in Notion, then ask to re-sync.
> Known drift from Notion: Flow 1 Step 3 (Notion has eyebrow "One last thing" and "…you'd like to share…") and the Bottom bar demo label (Notion says "Checkout-experience flow").

**Field guide**
- **Eyebrow** — small label above the heading (optional)
- **Heading** — the main question / message on the card
- **Description** — supporting copy below the heading (optional)
- Leave a field as `—` to omit it.
- Chips: one per line; the last chip is always the "Other…" divert to free text.

---

## Flow 1 — FAB · Sizing info
*Shared by all three FAB prototypes (No timer / Background timer / Hairline timer) — edit once, applies to all three.*

### Entry — FAB pill
- CTA: Did you find the sizing info you needed?

### Step 1 — Rating (thumbs)
- Eyebrow: Quick question for you
- Heading: Did you find the sizing info you needed?
- Description: —
- Response after 👍: Awesome! We love to hear that.
- Response after 👎: Oh sorry. Let's fix that.

### Step 2A — Follow-up after 👍 (chips)
- Eyebrow: Great to hear
- Heading: What made sizing easy to understand?
- Description: —
- Chips:
  - Size guide
  - Product description
  - Fit recommendations
  - Model measurements
  - Something else *(→ Other)*

### Step 2B — Follow-up after 👎 (chips)
- Eyebrow: Let's fix that
- Heading: What was missing or unclear?
- Description: —
- Chips:
  - Unclear measurements
  - Missing sizes
  - Couldn't find it
  - Something else *(→ Other)*

### Step 3 — Open text
- Eyebrow: —
- Heading: Anything else to share with the team?
- Description: This could be related to product info or any other part of the site.
- Placeholder: Your feedback (optional)…

### Step 4 — Thank you
- Eyebrow: —
- Heading: Thank you
- Description: Your feedback helps us improve sizing for everyone.

---

## Flow 2 — Bottom bar · Payment methods
*Terminal: the flow ends after the bar's feedback message — no sheet follows.*

### Entry — bottom bar (thumbs live in the bar)
- Question: What do you think of the available payment methods?
- Response after 👍: Great! Thanks for letting us know.
- Response after 👎: Thanks. We'll work on that

---

## Flow 3 — Sheet · Search & filters
*Opens directly on load — no entry point.*

### Step 1 — Rating (thumbs, in the sheet)
- Eyebrow: Regarding your results
- Heading: Do the current filters give you the control you want?
- Description: —
- Response after 👍: Nice! Glad you found it.
- Response after 👎: Oh sorry about that. Let's fix that.

### Step 2A — Follow-up after 👍 (chips)
- Eyebrow: —
- Heading: How important is price when searching for pieces?
- Description: Choose based on your list common scenario
- Chips:
  - It's Essential
  - Moderately
  - Not Very
  - Other *(→ Other)*

### Step 2B — Follow-up after 👎 (chips) — *not in Figma; authored to mirror 2A*
- Eyebrow: Let's improve that.
- Heading: What was missing from the filters?
- Description: —
- Chips:
  - Specific categories
  - Better price ranges
  - Style filters
  - Availability filters
  - Something else *(→ Other)*

### Step 3 — Open text
- Eyebrow: —
- Heading: Any other controls you would find useful when searching?
- Description: —
- Placeholder: Your feedback (optional)…

### Step 4 — Thank you
- Eyebrow: —
- Heading: Thank you
- Description: We appreciate you taking the time to improve the experience.

---

## Demo-chrome labels (index cards — not part of the flows)
- FAB · No timer: Pill FAB with no dismiss timer — dismiss via the X badge. Sizing-info flow.
- FAB · Background timer: Pill FAB with a background fill that sweeps before auto-dismiss. Sizing-info flow.
- FAB · Hairline timer: Pill FAB with a brand hairline that drains before auto-dismiss. Sizing-info flow.
- Bottom bar: Full-width bottom bar with inline thumbs. Payment-methods flow.
- Sheet: Sheet that opens directly (no entry point). Search/filters flow.
