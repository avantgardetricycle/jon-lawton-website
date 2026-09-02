# Jon Lawton website

Musician site for Jon Lawton (jonlawton.net). Prefer small content, copy, and styling edits. Match the existing voice, typography, and layout.

`index.html` is a single-page explorer (~4MB because images and videos are inlined as base64). Edit it surgically. Do not rewrite the whole file.

## Locked-in look

Do not casually revert these. They are the current client defaults on `<html>`:

- Font: Editorial (`data-font="editorial"`) — Bodoni Moda / Oswald / Lora
- Palette: Weathered (`data-palette="weathered"`)
- Video: right column YouTube embed (`data-video="right"`)
- Name: below the logo (`data-name-position="below"`)
- Hero accent: pale white + bold on “makes tradition come alive”
- Divider: gold elongated diamonds (locked)
- Logo: `.brand-mark` is cropped toward square (78×145, mobile 58×108)

Font, palette, video-position, accent, and divider dropdowns were removed on purpose.

## Page structure

1. Sticky `.controls-bar` (explorer controls, not a production nav)
2. `.hero` (`#top`) — headline + YouTube on the right
3. `.section-seam`
4. `.quote-strip` — John Hammond
5. `.section-seam`
6. `#release` — *Midnight with the Light On*
7. `.section-seam`
8. `#bio.bio-section` — cream full-bleed bio
9. `.section-seam`
10. `#shows` then `footer` (`#contact`)

Seam SVGs are injected by JS into empty `.section-seam` divs. Shapes live in the `shapes` map near the bottom of `index.html`. Colors are CSS variables (`--seam-bright` / `--seam-mid` / `--seam-dark`).

## Explorer controls

Header dropdowns still on the page:

- Text: Concise / Full (`data-verbosity`, Concise default). Concise copy is always visible; Full adds `.verbose-only` spans.
- Name: Right of logo / Overlay / Below logo

Copy voice is first-person-adjacent, warm, and specific. Keep “6- and 12-string” as written.

## Do not

- Touch `vercel.json`, `.github/workflows`, secrets, or anything outside this site’s own files
- Expand this file — it is reread every Claude turn
- Dump or re-encode the base64 media
