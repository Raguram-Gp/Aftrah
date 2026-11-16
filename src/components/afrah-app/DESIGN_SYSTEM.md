# Afrah App Design System

This file captures the design system used in the Afrah ERP app under `src/components/afrah-app`.

## 1) Core visual theme

The app uses a dark-first luxury construction dashboard style with:

- Background: `#111317`
- Primary accent: `#E2C399` (warm architectural gold)
- Secondary text: `#A1A1AA`
- Border stroke: `#232730`
- Surface containers: dark gray panels and cards
- Light theme variant: warm ivory / graphite palette

Source tokens live in:
- `src/styles/global.css`
- `src/components/afrah-app/styles/_shell.css`
- `src/components/afrah-app/styles/_tables.css`

## 2) Typography

The app loads:

- `Plus Jakarta Sans` for general UI
- `Cinzel` for headings / brand emphasis
- `JetBrains Mono` for financial / metric values

### Type scale used by tokens

From `src/styles/global.css`:

- `--fs-3xl`: 32px
- `--fs-2xl`: 26px
- `--fs-xl`: 22px
- `--fs-lg`: 20px
- `--fs-md`: 18px
- `--fs-base`: 16px
- `--fs-sm`: 14px
- `--fs-xs`: 13px
- `--fs-2xs`: 12px
- `--fs-3xs`: 11px
- `--fs-4xs`: 10px

### Practical usage

- Main page / metric titles: around `26px` to `32px`
- Section titles / row emphasis: `20px` to `22px`
- Table body, form fields, navigation: `13px` to `14px`
- Labels / badges: `11px` to `12px`
- Monospace financial values: usually `JetBrains Mono`

Examples in app styles:
- `afrah-app-section-title`: `var(--fs-lg)` with `Cinzel`
- `row-client-name`: `var(--fs-base)`
- `cell-phone` / `cell-amount`: `var(--fs-sm)` with monospace
- `badge` / `label` styles: `var(--fs-3xs)` and `var(--fs-2xs)`

## 3) Spacing and layout scale

The app uses mostly explicit values rather than one single spacing token system.

### Common spacing values

- Sidebar width: `250px`
- Sidebar collapsed width: `68px`
- Topbar height: `56px`
- Main content padding: `20px 24px 48px`
- Section padding: around `20px`
- Table cell padding: `12px`
- Input height: `38px`
- Button / control height: often `36px` to `44px`
- Form gaps: usually `10px` to `14px`
- Detail page panel gaps: `20px` to `28px`

### Layout rhythm

- Sidebar to main content: fixed split layout
- Main viewport uses a top header + content column
- Summary/detail cards often use `16px` to `24px` internal padding
- Cards and panels generally use `12px` border radius
- Form rows are stacked with short vertical gaps

## 4) Reusable component patterns

### Buttons

- Primary action button: gold gradient, strong contrast, rounded `10px`
- Secondary action buttons are smaller, outlined, with `40px` height in some reuse patterns
- Buttons use `transform` hover states and subtle shadow for depth

### Tables

- Section containers: `background: var(--surface-container-low)`
- Border: `1px solid var(--border-stroke)`
- Radius: `12px`
- Header row: gold-tinted background with uppercase labels
- Body rows: `12px` vertical padding

### Forms

- Input height: `38px`
- Border radius: `7px`
- Font size: `var(--fs-xs)`
- Focus state: gold border + glow ring

### Modals

- Panel radius: `14px`
- Padding: `18px 22px` header and `20px 22px` body
- Shadow: dark elevated glass effect

## 5) Design system summary

### Font sizes

- `32px` big totals / headline metrics
- `26px` large page numbers / title emphasis
- `20px` section headings
- `16px` standard emphasis / text
- `14px` body and inputs
- `13px` labels / nav captions
- `12px` metadata and badges
- `11px` micro labels

### Spacing

- Structure: `56px` topbar, `250px` sidebar
- Content layout: `20px/24px` main padding
- Cards: `12px` to `20px` inner spacing
- Forms: `10px` to `14px` vertical rhythm
- Table rows: `12px` padding
- Detail gaps: `20px` to `28px`

## 6) Most relevant files

- `src/styles/global.css` — global tokens and typography scale
- `src/components/afrah-app/styles/afrah-app.css` — imports the app CSS modules
- `src/components/afrah-app/styles/_shell.css` — shell, layout, sidebar, topbar base styles
- `src/components/afrah-app/styles/_topbar.css` — top bar and content spacing
- `src/components/afrah-app/styles/_tables.css` — table system and form controls
- `src/components/afrah-app/styles/_details.css` — detail page cards and metric blocks
- `src/components/afrah-app/styles/_auth.css` — login card styling
- `src/components/afrah-app/styles/_utilities.css` — reusable helper spacing/layout classes

## 7) Production note

This app’s ERP design system is denser and more functional than the public-facing marketing site. If you are building new UI pieces for the Afrah app, match the app-specific CSS token values above instead of the more editorial marketing typography from the design reference.
