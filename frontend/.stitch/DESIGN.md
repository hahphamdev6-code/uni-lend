# UniLend Design System

## 1. Product feel

UniLend is a campus sharing community. Use a **Sky Athletic** direction inspired by Nike's digital storefront: bold, energetic, minimal, and image-led. Huge confident uppercase headlines, full-bleed photography, crisp white space, and very little decoration. The palette is sky blue on bright, clean whites — fresh, modern, and optimistic, while keeping the community purpose visible.

## 2. Color palette

- Pure White `#FFFFFF`: primary page background and cards.
- Cloud White `#F5F8FB`: alternate section background and image wells (Nike-style light gray product backdrop, tinted cool).
- Sky Blue `#2BA8F0`: signature brand color — large color blocks, highlights, active indicators.
- Ocean Blue `#0568B5`: primary buttons, links, and active states (white text passes AA contrast).
- Ice Blue `#E3F3FD`: soft badges, chip backgrounds, hover fills.
- Ink `#111111`: headlines, navigation, secondary solid buttons.
- Steel Gray `#707072`: secondary text and metadata.
- Hairline `#E5E5E5`: borders and dividers.

Blue is the only chromatic color. No gradients, no glassmorphism, no heavy shadows.

## 3. Typography

- Display: extra-bold condensed sans in UPPERCASE (Nike Futura–style; use a Vietnamese-capable equivalent such as Barlow Condensed / Oswald / Anton). Very large sizes, tight line-height (~0.9–1.0), slight negative tracking.
- UI/body: neutral grotesk (Helvetica Now–style; use Inter or Be Vietnam Pro). Medium weight for labels, regular for body, 14–16 px.
- Vietnamese diacritics must render correctly in both fonts — verify stacked marks on uppercase (Ố, Ữ, Ẩ).
- Copy is short, punchy, and direct.

## 4. Layout and components

- Desktop canvas ~1440 px, near full-bleed hero, content grid with 48 px side margins.
- Header: compact white bar, wordmark left, centered nav, icons/actions right; thin promo strip above in Cloud White.
- Product cards: square image on Cloud White backdrop, no border or a hairline, minimal radius (0–8 px), text metadata below the image (name bold, category and owner in Steel Gray).
- Buttons: fully pill-shaped (999 px radius). Primary Ocean Blue with white text; secondary Ink solid or white with Ink outline.
- Chips: pill, Ice Blue or white with hairline; active chip Ink with white text.
- Simple line icons; no emoji as UI icons.
- Editorial rhythm: alternate full-bleed image blocks with clean white grids. Avoid dashboard patterns.

## 5. Motion and responsive behavior

- Subtle image zoom on card hover, short color transitions on buttons and chips.
- Mobile: stacked sections, hero headline still huge, horizontal-scroll product rails or two-column grid, full-width pill buttons, readable tap targets.
- Respect reduced-motion preferences.

## 6. Design System Notes for Stitch Generation

**DESIGN SYSTEM (REQUIRED):**
- Platform: Responsive web, desktop-first with a carefully adapted mobile layout.
- Visual direction: Sky Athletic — inspired by Nike.com: bold, minimal, energetic, image-led, huge uppercase headlines, full-bleed photography, generous white space.
- Background: Pure White (#FFFFFF); alternate sections and image wells in Cloud White (#F5F8FB).
- Brand: Sky Blue (#2BA8F0) for large color blocks and highlights; Ocean Blue (#0568B5) for primary pill buttons, links, active states; Ice Blue (#E3F3FD) for soft badges and chips.
- Text: Ink (#111111) headlines and nav; Steel Gray (#707072) secondary text. Hairline borders (#E5E5E5).
- Typography: Extra-bold condensed UPPERCASE display sans (Nike Futura–style, e.g., Barlow Condensed/Oswald) with tight line-height; clean neutral grotesk for UI (Helvetica Now–style, e.g., Inter). Vietnamese diacritics must render correctly.
- Components: Fully pill-shaped buttons and chips, product cards with square images on Cloud White backdrops and text below, minimal radius on images (0–8 px), hairline dividers, no shadows.
- Imagery: Large, crisp, natural photography of useful student-owned items and students on a bright campus; images dominate.
- Avoid: gradients, glassmorphism, heavy shadows, green or warm accent colors, generic dashboard styling, prices or sales language.
