# EMURJ FAB Prototypes

A sandbox for exploring Floating Action Button (FAB) overlay concepts on top of saved EMURJ storefront pages. Each concept is a React component that renders interactively over a faithful static snapshot of the EMURJ site.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. You'll land on the concept index — use the tab control to switch between Grant and Nick's concepts, then click any enabled link to open that concept's view.

## How it works

The app has two layers stacked on top of each other:

- **Background** — a saved HTML snapshot of the EMURJ site (home or product detail) rendered in a fullscreen iframe. These live in `public/pages/` with all their local assets, so they render as a faithful replica without a network connection.
- **Overlay** — your React component rendered on top via `position: absolute`. This is where the FAB prototype UI lives.

Routes follow the pattern `/concept/:user/:id/:page`, where `user` is `grant` or `nick` and `page` is either `home` or `product-detail`.

## Adding a concept

1. Create `src/concepts/[your-name]/concept-N.jsx` with a default export component
2. Register it in your entry in the `CONCEPTS` object in `src/App.jsx` — set `home` and/or `productDetail` to `true` to enable those page links

```jsx
// src/concepts/grant/concept-2.jsx
export default function Concept2({ page }) {
  return null // your overlay UI here
}
```

```js
// src/App.jsx
export const CONCEPTS = {
  grant: [
    ...
    { id: 2, label: 'Concept 2', home: false, productDetail: true },
  ],
  ...
}
```

## Collaboration

Each person works on their own branch and pushes up to share.

```bash
git checkout -b your-branch-name
git push -u origin your-branch-name
```

**Folder structure:**
- Grant's concepts live in `src/concepts/grant/`
- Nick's concepts live in `src/concepts/nick/`
- Each person numbers their own concepts from 1 upward independently

Because each person owns a separate folder, concept files never conflict. The one shared touch point is the `CONCEPTS` object in `src/App.jsx` — pull before adding a concept there to avoid a merge conflict.
