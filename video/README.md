# SosaGroup Real Estate – video

A ~90 second showcase of the SosaGroup Real Estate projects, made with [Remotion](https://www.remotion.dev).
It reads the projects and photos straight from the website (`../sosagroup`), so nothing is copied.

- Intro → one scene per project (two photos, name, location, units, delivery date) → contact card.
- 1920×1080, 30 fps.

## Commands

```console
npm install
npm run dev      # preview in Remotion Studio
npm run render   # writes out/sosagroup-real-estate.mp4
```

Both commands first run `npm run sync`, which reads `sosagroup/assets/data/inmuebles.js`
and rewrites `src/properties.json`. After adding or editing a project on the site, just render again.

## Where things are

| File | What it does |
| --- | --- |
| `scripts/sync-properties.mjs` | Builds `src/properties.json` from the site's data (first photo + one gallery photo per project). |
| `src/Showcase/theme.ts` | Brand colors, fonts and the length of each part. |
| `src/Showcase/Intro.tsx`, `PropertyScene.tsx`, `Outro.tsx` | The three kinds of scenes. |
| `src/Showcase/Photo.tsx` | Wide photos fill the frame; tall ones are shown framed over a blurred copy. |
