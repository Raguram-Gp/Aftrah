---
name: AFRAH Engineering & Architecture
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#d1c5b8'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#998f83'
  outline-variant: '#4d463c'
  surface-tint: '#e0c298'
  primary: '#e2c399'
  on-primary: '#402d0f'
  primary-container: '#c5a880'
  on-primary-container: '#513d1d'
  inverse-primary: '#725b38'
  secondary: '#c4c6cf'
  on-secondary: '#2d3037'
  secondary-container: '#44474e'
  on-secondary-container: '#b3b5bd'
  tertiary: '#bac8e3'
  on-tertiary: '#233146'
  tertiary-container: '#9fadc7'
  on-tertiary-container: '#334157'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#fedeb2'
  primary-fixed-dim: '#e0c298'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#584323'
  secondary-fixed: '#e1e2eb'
  secondary-fixed-dim: '#c4c6cf'
  on-secondary-fixed: '#191c22'
  on-secondary-fixed-variant: '#44474e'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#b9c7e2'
  on-tertiary-fixed: '#0d1c30'
  on-tertiary-fixed-variant: '#3a475d'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
  text-primary: '#F5F5F7'
  text-secondary: '#A1A1AA'
  border-stroke: '#232730'
  surface-glass: rgba(20, 23, 29, 0.7)
typography:
  display-xl:
    fontFamily: Syne
    fontSize: 96px
    fontWeight: '800'
    lineHeight: 100%
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Syne
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 120%
  headline-md-mobile:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 120%
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 160%
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 150%
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 100%
    letterSpacing: 0.2em
  mono-data:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 140%
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 160px
---

## Brand & Style

The design system is engineered for **AFRAH Construction**, catering to ultra-high-net-worth individuals and tier-one commercial developers. The personality is authoritative, precise, and sophisticated—balancing the cold technicality of engineering with the warm, tactile luxury of premium architecture.

The aesthetic follows an **Editorial Minimalism** approach mixed with **Cinematic Glassmorphism**. It utilizes expansive negative space, high-contrast typography, and a "black-box" philosophy where the interface recedes to let architectural photography and technical renders take center stage. The emotional response should be one of absolute reliability, precision, and exclusivity.

## Colors

The palette is anchored in a **Deep Obsidian** environment to simulate the atmosphere of a high-end architectural studio at night. 

- **Primary (Architectural Gold):** Used sparingly for high-impact CTAs, active states, and structural highlights. It represents the warmth of light within a structure.
- **Surface & Background:** Layers of obsidian and charcoal create depth without introducing color noise.
- **Typography:** Crisp whites for legibility in headlines and muted grays for technical documentation and body copy to reduce visual fatigue.
- **Dividers:** Hairline strokes are used to define the grid, mimicking architectural blueprints.

## Typography

Typography follows an editorial hierarchy. **Syne** provides a geometric, avant-garde feel for large-scale headlines, while **Hanken Grotesk** maintains high legibility for technical descriptions.

- **Display:** Used for hero sections and project titles. Always tight tracking and impactful.
- **Section Numbering:** Use `display-lg` with `primary_color_hex` for editorial numbering (e.g., 01, 02).
- **Labels:** All uppercase with wide tracking (20%) to denote categories or small metadata.
- **Technical Data:** Use the monospace font for coordinates, square footage, and engineering specs to evoke a blueprint aesthetic.

## Layout & Spacing

This design system utilizes a **Strict 12-Column Architectural Grid**. 

- **Generous Whitespace:** Sections are separated by large vertical gaps (`160px`) to provide an "unhurried" luxury experience.
- **Grid Alignment:** All elements, including borders and dividers, must snap to the grid. 
- **Reflow:** On mobile, the 12-column grid collapses to 4 columns. Margins are reduced significantly, but vertical whitespace remains high to maintain the premium feel.
- **Asymmetry:** Occasionally break the grid with large-scale imagery to create dynamic, cinematic layouts.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Backdrop Blurs** rather than traditional shadows.

- **The Ground Layer:** Deepest obsidian (#0B0D10).
- **Surface Layer:** Slightly lighter obsidian (#14171D) used for cards and floating elements.
- **Glassmorphism:** Navigation bars and overlays use a 20px backdrop blur with a 70% opacity fill and a 1px white border at 10% opacity.
- **Outlines:** Use sharp `border-stroke` (#232730) for all container boundaries. Avoid drop shadows entirely to keep the design feeling "flat" and "engineered."

## Shapes

The primary shape language is **Sharp and Geometric**. All structural components—cards, images, and form inputs—must have 0px border radius to reflect the rigidity of construction materials like steel and stone.

**Exceptions:** 
- **Navigation & Specific Actions:** Use "Pill" shapes (maximum roundedness) for primary navigation bars and specific high-contrast buttons to create a focal point against the rigid grid.

## Components

- **Floating Navigation:** A pill-shaped bar anchored to the bottom or top center. It must feature a high-quality glassmorphism effect and minimal iconography.
- **Primary Buttons:** High-contrast pill shapes using `primary_color_hex`. Text should be `label-caps` in the background color for maximum punch.
- **Architectural Cards:** No borders; use `secondary_color_hex` background. Imagery should be full-bleed or precisely inset with `gutter` spacing.
- **Form Inputs:** Dark-tinted fills with sharp corners and a 1px `border-stroke`. On focus, the border transitions to `primary_color_hex`.
- **Project Numbering:** Large-scale numbers (01, 02) placed vertically alongside section headers to provide an editorial rhythm.
- **Lists:** Clean, horizontal dividers between items. Use `mono-data` for list values to emphasize the engineering aspect.