# Kouantchou Njeudji Nathy Ingrid — Portfolio

Personal portfolio for **Kouantchou Njeudji Nathy Ingrid**, Analytical Chemist and
X-ray Fluorescence (XRF) Specialist. Static site, no build step, no backend —
deploys to GitHub Pages as-is.

**Live:** https://nathyingrid.github.io/

---

## Lighthouse

| Category | Desktop | Mobile |
|---|---|---|
| Performance | 99 | 96 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100¹ |
| SEO | 100 | 100 |

Cumulative Layout Shift 0, Total Blocking Time 0 ms (desktop).

¹ Mobile Best Practices reports 96 against the local Python dev server, which
resets connections under throttled load. Not reproducible on GitHub Pages.

---

## ⚠️ Before this goes live

Three WhatsApp links are wired but **point at a placeholder number**. Search for
`0000000000` in `index.html` (3 occurrences: contact button, contact card,
footer icon) and replace with her number in full international format — digits
only, no `+` or spaces:

```
Russia   → 79991234567
Cameroon → 237671234567
```

No phone number appears in `nathy.md`, so this could not be filled in.

---

## Stack

Plain HTML5, CSS3 and ES6+ — no framework, no bundler. The site is one page with
no routing or shared state, so React would have added a build step and shipped
more JavaScript for no gain.

Icons are **Material Symbols (Outlined)**, inlined as SVG paths rather than
loaded as a webfont — no extra request, and they inherit `currentColor`. The
ORCID, Google Scholar, LinkedIn and WhatsApp marks are brand logos that Material
does not carry, so those stay custom.

The only runtime dependency is [Lenis](https://github.com/darkroomengineering/lenis)
(~13 KB) for smooth scrolling, vendored into `assets/js/`. Everything else —
reveals, counters, parallax, the hero canvas — is hand-written and dependency-free.

**Nothing is loaded from a third party at runtime.** Poppins is self-hosted and
Lenis is vendored, so the page makes zero external requests: faster, no CDN
outage risk, and no visitor data leaking to Google Fonts.

---

## Structure

```
.
├── index.html              # the entire page
├── assets/
│   ├── css/
│   │   ├── styles.css      # design system + all components
│   │   └── fonts.css       # @font-face for self-hosted Poppins
│   ├── fonts/              # Poppins 300–700, latin + latin-ext (woff2)
│   ├── img/                # responsive derivatives (webp + jpg fallback)
│   └── js/
│       ├── lenis.min.js    # vendored smooth-scroll
│       └── main.js         # all interactions
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── .nojekyll               # serve _-prefixed paths; skip Jekyll processing
├── nathy.md                # source content
├── colorPalette.md         # source palette
└── Images/                 # original source photography
```

---

## Design system

Built strictly on the five colours in `colorPalette.md`:

| Token | Hex | Role |
|---|---|---|
| Dark Coffee | `#422D1E` | primary surface, buttons, text base |
| Lipstick Red | `#E81339` | accent — dots, rules, focus rings |
| Dusty Taupe | `#AC8973` | decorative marks |
| Light Coral | `#E38F91` | hero glow, eyebrows on dark |
| Almond Silk | `#E1BDAC` | body text on dark surfaces |

Neutrals (`--paper`, `--paper-warm`, borders) are tints of Dark Coffee rather
than generic greys, which keeps the whole surface in one temperature family.

**On the text colours:** the palette is built for graphics, and several colours
are too light to sit on paper as text. Rather than invent new hues, text uses
darkened variants of the same ones — `--taupe-text` (5.2:1), `--text-faint`
(4.8:1), `--red-text` (6.0:1). Filled buttons use `--red-surface` (`#DC0E31`)
because Lipstick Red behind off-white text measures 4.44:1, just under the 4.5
AA threshold. Every text/background pair in the design measures ≥ 4.5:1.

The one colour from outside the palette is WhatsApp's brand green, and it is
`#117C6F` (their dark green, 4.9:1) rather than the familiar `#25D366`, which
measures 1.98:1 behind white text and fails AA badly.

**Card elevation:** cards carry a real resting shadow (`--shadow-card`) and lift
on hover (`--shadow-card-hover`), with borders at `--line-card` (0.14 alpha)
rather than the page's hairline `--line` (0.10). At the lighter values the cards
dissolved into the background. Shadows are warm-tinted from Dark Coffee, never
neutral grey. Expertise cards also draw a red accent rail on hover.

Type is Poppins at 300/400/500/600/700, on a fluid `clamp()` scale.

---

## Accessibility

Verified with axe-core (0 violations) and Lighthouse (100).

- Single `<h1>` carrying the full name; no skipped heading levels
- All text meets WCAG AA; most body copy exceeds AAA
- Full keyboard navigation, visible focus rings, skip link
- Anchor navigation moves focus, not just scroll position
- `prefers-reduced-motion` disables Lenis, reveals, counters, parallax and the
  hero canvas
- Decorative watermarks are drawn via CSS `content`, so they never reach the
  accessibility tree

**The site renders completely without JavaScript.** Entrance animations are
scoped to a `.js` class set before first paint — if the script never runs,
nothing is hidden. Metrics ship their real values in the HTML; JS only animates
up to what is already there. This matters for a site whose main job is being
indexed.

---

## SEO

- Descriptive `<title>` and meta description leading with the full name
- Canonical URL, robots meta, `sitemap.xml`, `robots.txt`
- Open Graph + Twitter Card with a 1200×630 image
- JSON-LD `@graph`: `Person` (with ORCID, Google Scholar and LinkedIn as
  `sameAs`), `WebSite`, `ProfilePage`, and two `ScholarlyArticle` nodes
- Name variants ("Nathy Ingrid", "Kouantchou Nathy") in `alternateName`
- Semantic landmarks and descriptive alt text throughout

---

## Deployment

Push to `main` and enable Pages:

**Settings → Pages → Source: Deploy from a branch → `main` / `root`**

No build, no Actions workflow. `.nojekyll` prevents Jekyll from touching the
assets.

### Before going live

The canonical URL, `og:image`, sitemap and JSON-LD `@id`s all point at
`https://nathyingrid.github.io/`. If the site is deployed anywhere else, update
those:

```bash
grep -rn "nathyingrid.github.io" index.html sitemap.xml robots.txt
```

For a custom domain, add a `CNAME` file containing the domain and update the
same references.

---

## Local development

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Editing is direct — change `index.html`, `assets/css/styles.css` or
`assets/js/main.js` and reload. There is no compile step.

### Regenerating images

Derivatives in `assets/img/` are generated from `Images/Nathy.jpg`. To change
the crop, adjust the centre points in the image script and re-run it; it emits
WebP + JPEG at three widths each, plus the avatar and OG card.

---

## Content

All copy comes from `nathy.md`, lightly edited for readability. Publications,
detection limits, dates and languages are reproduced as stated there.

The PhD is presented as **expected September 2026**, and the title used
throughout is "Analytical Chemist" — not "Dr." — since the degree has not been
conferred yet.

### A note on the photography

Only `Images/Nathy.jpg` is used — it is the one photograph that appears to be a
genuine photograph of Mrs. Nathy.

The other supplied images (`Nathy2.jpg`, `Nathy3.jpg`, `Nathy Banner.png`,
`Nathy Certificate.png`, and the two `Gemini_Generated_Image_*.png` files) all
appear to be AI-generated and to depict a **different woman** than `Nathy.jpg` —
different face and bone structure. Two are named as generated output. The tells
across the rest are consistent: 1024×1024 square sources, uniformly plastic
skin, backgrounds dissolving into smears, and — in `Nathy Certificate.png` — a
university crest rendering as illegible gibberish ("EST FEB / IIS AS").

They are deliberately not used. This site is the authoritative professional
record for a real person, wired to her real ORCID, Google Scholar profile and
publications. A synthetic portrait presented as documentary fact would undermine
exactly the credibility the site exists to establish, and the mismatch is
trivially visible to anyone who meets her or opens her LinkedIn.

The four regalia images are a separate problem on top of that one: they depict a
conferred doctorate. `nathy.md` puts the PhD at **expected September 2026**, so
a graduation portrait would misrepresent her credentials regardless of who is in
the frame — most acutely in the Experience section, directly beside the line
stating the degree is still expected.

**If more genuine photographs exist** — laboratory, conference, campus, or a
real graduation once the degree is conferred — drop them into `Images/`, run
them through the image script, and they can go straight into the hero, the
experience timeline, or a restored gallery.

The Gallery section from the original brief was replaced with a
**Publications & Findings** section — five papers with abstracts, DOIs and
eLIBRARY IDs. With one usable photograph a masonry gallery would have looked
thin, and the publication record is both more persuasive and far better for
search ranking.

If more genuine photographs become available (laboratory, conference, campus),
they can be dropped into `Images/`, run through the image script, and added to
the hero, about, or a restored gallery section.

---

## Licence

Content and photography © Kouantchou Njeudji Nathy Ingrid. Poppins is licensed
under the SIL Open Font License 1.1. Lenis is MIT licensed.
