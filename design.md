# Design System: Dala ("Your workplace has the answer. Just ask Dala for it.")
Source: Refero Styles (Deep space digital / constellation floating on black velvet)

## Core Philosophy
Dark-stage void environment where deep black (#000000) canvas meets a single vivid violet accent (#8052ff), punctuated by saffron/amber sparks (#ffb829) and deep verdant accents (#15846e). Typography is monolithic and weightless: display headlines rely on massive scale (78-113px) at regular weight 400 with negative tracking (-0.04em), while body copy is ultra-light (weight 200). Zero conventional card drop-shadows; visual depth is created strictly through scale, contrast, and subtle chromatic ambient point-light glows.

## Color Palette Tokens
| Token Name | Hex Code | Role in UI |
| :--- | :--- | :--- |
| `void` | `#000000` | Full page canvas, section background, pure black void surface |
| `bone-white` | `#ffffff` | Primary text, display headings, active iconography |
| `ash-gray` | `#9a9a9a` | Secondary text, muted navigation links, subtle status hints |
| `silver-mist` | `#bdbdbd` | Tertiary copy, supporting metadata, timestamps |
| `electric-iris` | `#8052ff` | Primary action CTA, selected seat state, brand signature violet |
| `saffron-spark` | `#ffb829` | Reserved/Locked seats countdown, warning indicators, amber sparks |
| `deep-verdant` | `#15846e` | Confirmed/Booked state, success badges, subtle logo gradient stop |
| `void-card` | `#09090b` | Subtle elevated surface for floating panels (border-white/10) |
| `void-border` | `rgba(255, 255, 255, 0.08)` | Ultra-fine hairline border for floating containers |

## Typography
- **Font Family**: PPNeueMontreal, fallback: Inter, -apple-system, sans-serif.
- **Headlines / Display**: 78px - 113px, Font Weight 400 (not bold), tracking `-0.04em` (`tracking-tighter`).
- **Subheadings**: 24px - 32px, Font Weight 300, tracking `-0.02em`.
- **Body Copy**: 16px - 18px, Font Weight 200 (ultra-light), line-height 1.6, text `#bdbdbd` or `#ffffff`.
- **Labels / Badges / Nav**: 12px - 14px, Font Weight 600, uppercase, tracking `0.025em` (`tracking-wider`).

## Elevation & Radii
- **Box Shadows**: No traditional fuzzy drop-shadows. Flat black canvas with directional ambient glows:
  - `glow-iris`: `0 0 24px -4px rgba(128, 82, 255, 0.4)`
  - `glow-amber`: `0 0 20px -4px rgba(255, 184, 41, 0.35)`
- **Border Radii**:
  - Buttons / Badges / Pills: `9999px` (`rounded-full`)
  - Containers / Drawers / Floating Sheets: `24px` (`rounded-3xl`)
  - Seats: `6px` (`rounded-md`) or rounded pips
