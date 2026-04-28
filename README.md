# Simulative Immersion

Standalone company site for `simulativeimmersion.com`.

The site is intentionally sparse and academic: Computer Modern-inspired serif typography, black text, purple accents, and a vertical branching diagram as the primary navigation surface. Public copy is placeholder-grade while the company remains in stealth.

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run lint
npm run build
```

## Mobile Preview

Generate true mobile viewport screenshots:

```sh
npm run mobile:preview
```

The script writes iPhone and Pixel screenshots for the root, About, and More info states to `mobile-previews/`.

## Content

Editable site metadata, graph nodes, and placeholder text live in `src/content/site.ts`. Each node controls its label, content panel copy, parent/child relationships, desktop graph position, and mobile order.
