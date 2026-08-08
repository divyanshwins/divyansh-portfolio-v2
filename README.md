# divyansh-portfolio-v2

Standalone v2 of the portfolio. Self-contained — no dependency on the v1 project folder.

Static site: hand-written HTML, two CSS files, one JS file. GSAP + ScrollTrigger and simple-icons load from CDN.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Any static server works (`python3 -m http.server`, VS Code Live Server, etc.) — there is no build step.

## Structure

```
index.html          landing
work.html           project index
about.html          about
process.html        process
contact.html        contact
arth.html           case study — Arth
fedex.html          case study — FedEx
rozinvest.html      case study — RozInvest
veromoda.html       case study — Vero Moda
lightning.html      case study — Lightning
core.css            global tokens, layout, nav, typography
case.css            case-study page styles
site.js             nav, scroll behaviour, GSAP animations
assets/
  images/about/     about page photos
  images/case/      case study imagery
  images/work/      work index thumbnails
  resume.pdf
```

## Dependencies

| Package | Why |
| --- | --- |
| `live-server` | local dev server with reload |
| `css-tree` | CSS parsing for maintenance scripts |
| `node-html-parser` | HTML parsing for maintenance scripts |

All runtime dependencies (GSAP, simple-icons) are CDN `<script>` / `<img>` tags — nothing bundled.

## Deploy

Push the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). No build command; publish directory is the repo root.
