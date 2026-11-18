# Redesign notes — monochrome gig-poster

Scope: `client/src/**` + `client/tailwind.config.js`. No backend, API, context, or test changes.

## Tokens (`index.css`, `tailwind.config.js`)

- Dark: `#000` canvas, `#0a0a0a` surface, hairline `rgba(255,255,255,.14)`, iris `#8052ff` (CTA + selected seat only), saffron `#ffb829` (price/timer/"selling fast").
- Light: archival paper `#f4f3ef`, white cards, `#dedcd4` hairline, iris darkened to `#5b28e8`.
- Shapes: 8px cards, pill buttons, nothing else rounded. No shadows except the seat-lock ring.
- Removed: equalizer keyframes, laser sweep, holographic foil, `bg-cyber-grid`, glassmorphism/`backdrop-blur` panels, ambient stage glow. Kept only `.preserve-3d`, `.perspective-1200`, `.backface-hidden` — used by the collectible ticket pass.

## Components

- `Hero.jsx` — gig-poster layout: mono kicker, 3-line stacked display headline, one violet pill, full-bleed grayscale artist plate bleeding past the grid. Equalizer bars, seat constellation and VIP badge deleted. Ticker reduced to one mono line + blinking saffron dot.
- `ConcertCard.jsx` — poster-first: edge-to-edge 3:4 image, no border/fill, artist in display type, mono `date · venue`, saffron price, growing violet underline on hover, 2px iris ring when selected.
- `App.jsx` — category tabs are mono text with underline; search is a flat bottom-bordered line; grid 2/3 cols with 24px gaps, featured card spans 2.
- `SeatingMap/*` — single hairline boarding-pass panel; stage arc is one hairline; seats circular with distinct available / locked-by-me / locked-by-other / booked states; selected gets iris ring, locked gets saffron dashed ring; `Arena3DView` toggle kept, container is plain black.
- `CheckoutDrawer.jsx` — sticky full-width black band, hairline top rule, mono seat chips, saffron countdown, one violet pill CTA.
- `TicketModal.jsx` — perforated stub with notch cutouts, mono order number, large QR, 3D tilt/flip retained (rotation on its own node so framer-motion cannot overwrite the transform).
- `MyTicketsView.jsx` — hairline pass rows, mono metadata, ghost `PASS` pill.
- `VenuesView.jsx` — poster grid, grayscale imagery, mono capacity/location/acoustics rows.
- `Navbar.jsx` — transparent, no blur, display wordmark, mono links with active underline, ghost theme/auth controls, one violet pill.
- `Footer.jsx` — oversized wordmark band, mono link row, hairline top rule, working tab navigation.

## Verification

- `npm test` → 5/5 checkout-flow tests pass.
- `cd client && npx vite build` → clean, 433.89 kB JS / 37.62 kB CSS (gzip 137.45 / 7.48).
- Manual browser pass: dark + light, desktop 1365×900 and mobile 390×844; seat lock → checkout → ticket issue → flip verified.
