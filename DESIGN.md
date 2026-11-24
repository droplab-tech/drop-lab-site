---
name: Droplab
description: Custom-built sites and conversion pages, shown as a dark garage lit by a single cold blue beam.
colors:
  night: '#05070d'
  night-2: '#080c16'
  graphite: '#0b1220'
  graphite-2: '#101a2d'
  line: 'rgb(150 172 214 / 0.13)'
  line-strong: 'rgb(150 172 214 / 0.26)'
  tick: 'rgb(150 172 214 / 0.2)'
  tick-strong: 'rgb(150 172 214 / 0.42)'
  snow: '#f2f5fa'
  steel-body: '#a3aec2'
  steel-muted: '#7f8ca4'
  signal-blue-text: '#5aa2ff'
  signal-blue: '#0a6cff'
  signal-blue-deep: '#0757d1'
  cold-cyan: '#22d3ee'
  navy: '#0b1e4a'
  error: '#fb7185'
  success: '#34d399'
  whatsapp: '#25d366'
  day: '#eef1f6'
  day-2: '#e5e9f1'
  day-surface: '#ffffff'
  day-surface-2: '#f6f8fb'
  day-line: 'rgb(11 30 74 / 0.12)'
  day-line-strong: 'rgb(11 30 74 / 0.24)'
  day-heading: '#070b14'
  day-body: '#3a465a'
  day-muted: '#55627a'
  day-error: '#be123c'
  day-success: '#047857'
typography:
  display:
    fontFamily: 'Host Grotesk Variable, Host Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.6rem, 1.35rem + 5.2vw, 5.75rem)'
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Host Grotesk Variable, Host Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 1.3rem + 2.9vw, 3.75rem)'
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: '-0.038em'
  title:
    fontFamily: 'Host Grotesk Variable, Host Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.75rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: '-0.035em'
  body:
    fontFamily: 'Host Grotesk Variable, Host Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Geist Mono Variable, Geist Mono, ui-monospace, SFMono-Regular, monospace'
    fontSize: '0.72rem'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '0.08em'
    fontFeature: 'tnum'
rounded:
  tick: '2px'
  inset: '4px'
  control: '6px'
  panel: '10px'
spacing:
  gutter-mobile: '20px'
  gutter-tablet: '32px'
  gutter-desktop: '48px'
  container: '84rem'
  section-top: '64px'
  section-top-wide: '80px'
  section-bottom: '96px'
  section-bottom-wide: '128px'
components:
  button-primary:
    backgroundColor: '{colors.signal-blue}'
    textColor: '#ffffff'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    height: '48px'
    padding: '0 6px 0 20px'
  button-primary-hover:
    backgroundColor: '#1a78ff'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.snow}'
    rounded: '{rounded.control}'
    height: '48px'
    padding: '0 20px'
  button-arrow-box:
    backgroundColor: 'rgb(255 255 255 / 0.14)'
    textColor: '#ffffff'
    rounded: '{rounded.inset}'
    size: '36px'
  input:
    backgroundColor: '#070b14'
    textColor: '{colors.snow}'
    rounded: '{rounded.control}'
    padding: '14px 16px'
  plan-card:
    backgroundColor: '{colors.graphite}'
    rounded: '{rounded.panel}'
    padding: '36px'
  badge-recommended:
    backgroundColor: '{colors.signal-blue}'
    textColor: '#ffffff'
    typography: '{typography.label}'
    rounded: '{rounded.inset}'
    padding: '4px 8px'
---

# Design System: Droplab

## Overview

**Creative North Star: "Box noturno"**

A garage at night with one cold blue light on. The page is near-black (night), and the only light source is a diagonal beam that falls from the top right in a blur of signal blue and cold cyan. Everything the beam touches reads as prepared: graphite surfaces with 1px edges, hairline rulers with tick marks, tabular numbers for durations. The mood is the team the evening before a competition, calm and ready, not a stage show.

Hierarchy is made by scale alone. Headings are a large grotesque at medium weight with tight negative tracking; there is no label above a section title, and color is never what makes something important. A single ruler stitches the page together: every section opens on it, and a short lit segment on that ruler marks how far down the page the visitor is. The brand drop sits in the scene as a lit object, rim-lit from the beam's side and cut at the base by the ruler.

The light theme is the same garage by day: cool light gray, white surfaces, navy-tinted hairlines, the same ruler and the same beam at lower intensity. Motion is one-time and slow: the light switches on once at entry, content rises a short distance on scroll, nothing loops.

**Key Characteristics:**

- Near-black field, one diagonal blue-to-cyan beam as the only light
- Hierarchy by type scale, medium weight, negative tracking; no kickers
- Hairline ruler with 12px ticks and 96px major ticks opening every section
- Mono uppercase reserved for measurements (durations, captions, small fixed labels)
- Small-radius rectangles; primary actions carry an arrow in a square
- Light theme mirrors the dark one token-for-token

## Colors

A cold, nearly monochrome night palette where one saturated blue does all the signaling.

### Primary

- **Signal Blue** (signal-blue): the brand blue. Primary button fill, the lit ruler segment, the first process step, focus caret, selection, checkbox fill, nav underline, the recommended plan's border and badge. It is the color of light, so it appears where the beam lands.
- **Signal Blue Text** (signal-blue-text, dark theme) and **Signal Blue Deep** (signal-blue-deep, light theme): the AA-safe blue for small text, links, icons and process durations.

### Secondary

- **Cold Cyan** (cold-cyan): the hot end of the beam and the drop's highlight. Appears only inside light (beam gradient, drop gradient) and as the first tick in the hero proof strip; never as text or a fill.

### Neutral

- **Night** (night) and **Night 2** (night-2): page background and footer band.
- **Graphite** (graphite) and **Graphite 2** (graphite-2): panels, cards, the compare stage.
- **Hairline** (line, line-strong): 1px borders; line-strong for inputs, secondary buttons and the compare stage.
- **Tick** (tick, tick-strong): the ruler's minor and major marks and its baseline.
- **Snow** (snow): headings and primary text on dark.
- **Steel Body** (steel-body) and **Steel Muted** (steel-muted): running text and secondary text.
- **Navy** (navy): brand constant; in the build it tints the light theme's hairlines and ticks rather than filling surfaces.
- **Day set** (day, day-2, day-surface, day-surface-2, day-heading, day-body, day-muted, day-line, day-line-strong): the light-theme equivalents, each mapped to the same role.
- **Status** (error, success; day-error, day-success): form validation only. **WhatsApp green** (whatsapp) only on the floating WhatsApp button.

### Named Rules

**The One Light Rule.** There is one light source per scene: the diagonal beam (rotated about 22 to 28 degrees, heavily blurred, masked out toward the bottom). Glows elsewhere (primary button, lit ruler segment, first step dot, recommended plan) are that light landing on an object, always blue, never a second color.

**The Role Mirror Rule.** Every color is consumed through a theme role (bg, surface, line, heading, body, muted, accent-text, tick, beam). A new surface that hardcodes a dark-only value breaks the day garage.

## Typography

**Display Font:** Host Grotesk Variable (with ui-sans-serif, system-ui)
**Body Font:** Host Grotesk Variable (same family)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace), measurement labels only

**Character:** One grotesque carries everything from the 5.75rem hero to body text, at medium weight with tightening tracking as size grows; a small tabular mono does the measuring.

### Hierarchy

- **Display** (500, clamp 2.6 to 5.75rem, 0.98, -0.04em): the hero title only, held to about 13ch so it breaks into three or four lines.
- **Headline** (500, clamp 2 to 3.75rem, 1.02, -0.038em): section titles, left column of a bottom-aligned split with supporting text on the right.
- **Title** (500, 1.45 to 1.75rem, tight, about -0.03em): plan names, process steps, mobile menu items.
- **Body** (400, 1.0625rem, 1.6): running text in steel-body; supporting paragraphs held to about 28 to 34rem; 0.95rem for lists and card copy.
- **Label** (Geist Mono, 0.72rem, 0.08em, uppercase, tabular numerals): durations, compare captions, footer column labels, the recommended badge (0.62rem), the logo slogan (0.6rem).

### Named Rules

**The Scale-Only Rule.** Importance is shown by size, not by color or weight. All headings are weight 500 in heading color; the step from body to headline is a jump of three to five times.

**The Measure Rule.** Mono uppercase is a measuring instrument: durations, ticks, captions, fixed labels. It never sits above a heading as a kicker.

## Layout

A single centered container (max 84rem) with gutters of 20px on mobile, 32px from sm, 48px from lg. Sections stack full-width; inside, a 12-column grid at lg places a section title in columns 1 to 7 and its supporting paragraph in columns 9 to 12, aligned on the baseline. Section rhythm is 64px top and 96px bottom on mobile, 80px and 128px from sm, with the ruler sitting at the top edge of each section. Section headings keep 56px (80px from sm) of space before content.

The hero fills the viewport (100svh): title left, the drop right at roughly 40% width and cut at the base by the proof ruler; on mobile and tablet the drop moves below the actions. Grids collapse to one column below lg; the process line turns from a horizontal ruler into a vertical rail. Mobile first: the primary action stays reachable in the header (sm and up), in the mobile menu, and through the floating WhatsApp button.

## Elevation & Depth

Depth comes from light, not stacked shadows. Surfaces are flat graphite with a 1px hairline; the panel shadow is a faint top highlight plus a long, very soft drop that reads as the surface sitting in a dark room. Blue glows only appear where the beam's light lands.

### Shadow Vocabulary

- **Panel** (`0 1px 0 rgb(255 255 255 / 0.04) inset, 0 24px 48px -28px rgb(0 0 0 / 0.9)`; light: `0 1px 2px rgb(11 30 74 / 0.06), 0 24px 48px -30px rgb(11 30 74 / 0.35)`): form panel and other raised surfaces.
- **Primary glow** (`0 12px 32px -14px rgb(10 108 255 / 0.85)`, hover `0 16px 40px -14px rgb(10 108 255 / 1)`): under the primary button.
- **Lit segment** (`0 0 18px 2px rgb(10 108 255 / 0.55)`): the ruler's position marker; same family on the first process dot.
- **Lit card** (`0 30px 70px -40px rgb(10 108 255 / 0.7)`): the recommended plan only, paired with a local blurred beam inside the card.
- **Input focus ring** (`0 0 0 4px rgb(10 108 255 / 0.2)`).

### Named Rules

**The Lit-Not-Lifted Rule.** Nothing rises on hover with a heavier shadow or a translate. A surface becomes important by being lit (blue border, beam inside, blue glow), not by floating.

## Shapes

Small-radius rectangles throughout, in four steps: 2px for ruler marks and step dots, 4px for things inset inside a control (the arrow square, badge, checkbox), 6px for controls (buttons, inputs, icon buttons, success mark), 10px for panels and cards (plans, form panel, compare stage). Borders are always 1px. Circles appear only on the floating WhatsApp button and avatars. The brand drop is the one organic silhouette, and it is treated as an object in the scene, not as a decorative shape repeated around the page.

## Components

### Buttons

Rectangular and calm; the arrow square is the signature.

- **Shape:** gently squared corners (6px); heights 40 / 48 / 56px for sm / md / lg.
- **Primary:** signal-blue fill, white medium text, blue glow beneath. With `arrow`, the right padding collapses and a 28 / 36 / 40px square (4px radius, white at 14%) holds an up-right arrow.
- **Hover / Focus:** fill brightens to #1a78ff and the glow deepens; the arrow shifts 2px up and right. Transitions 300ms on the soft ease-out. Focus is a 2px accent-text outline offset 4px.
- **Secondary:** transparent with a line-strong border and heading text; hover strengthens the border toward heading at 50% and adds a 4% heading wash. Arrow square in heading at 7%.
- **Ghost:** heading text turning accent-text on hover.
- In full-width placements (plan cards, form, mobile menu) the label and arrow square justify to opposite ends.

### Cards / Containers

- **Plan card:** 10px radius, 28px padding (36px from sm). Standard plans sit on graphite at 40% with a hairline; the recommended plan is full graphite with a signal-blue border at 60%, its own blurred diagonal beam inside, the lit-card glow, a blue mono "Recomendado" badge, and a primary button where the others get secondary. Timeline sits as a mono measure behind a 24px hairline; feature list sits under a hairline with 16px accent-colored checks.
- **Panel:** graphite, hairline, panel shadow, 10px radius; used for the contact form.

### Inputs / Fields

- **Style:** 6px radius, line-strong 1px border, input background (#070b14 dark, white light), 14px by 16px padding, heading-color text, muted placeholder. Labels sit above at 0.9rem medium in heading color.
- **Focus:** border turns signal-blue with a 4px blue ring at 20%.
- **Error:** border turns error; message below in error with an icon, announced politely.
- **Select:** native appearance removed, a rotated arrow in muted at the right.
- **Checkbox:** 20px square, 4px radius, line-strong border; fills signal-blue with a drawn white check that scales in.

### Navigation

- **Header:** transparent over the hero, 68px tall; on scroll it gains a hairline bottom border and an 80% night background with strong blur. Links at 0.9rem in body color turn heading on hover and current, with a 1px signal-blue underline that draws from the left (400ms expo ease). A small primary arrow button stays at the right.
- **Mobile:** a right-side sheet on night with a hairline left edge, a ruler under the logo, large 1.6rem items separated by hairlines each with a muted up-right arrow, and a full-width large primary button at the foot.

### The Ruler and Section Frame

The ruler is the system's spine: a 1px tick-strong baseline, minor ticks every 12px (6px tall) and major ticks every 96px (11px tall). Every section opens on a 12px-tall ruler; an optional lit segment (3px tall, 9% wide, signal-blue with the lit-segment glow) is positioned by the section's place on the page (0 to 1), so the segment walks left to right as the visitor scrolls. The hero ends on the same ruler with three proof items, each led by a 12px vertical tick. The process steps reuse it as a horizontal rail at lg (vertical on mobile), with the first step's dot lit.

### The Light Drop

The brand drop rendered as a lit object: a body gradient from cyan through signal blue to deep navy, a dark core at the lower left, a cyan key light and white rim on the upper right (the beam's side), soft specular highlights, and an optional blurred, faded reflection. In the hero it is cut at the base by the ruler. It switches on with the beam.

### Beam and Motion

The beam is an absolutely positioned gradient band (transparent, beam-a, beam-b, beam-a, transparent), rotated, blurred 36 to 42px and masked toward the bottom; its alpha values are lower in the light theme. Entry: light switches on once over 1800ms on the expo ease-out after 150ms. Scroll reveals: 18px rise and fade over 900ms on the expo ease-out, staggered 90 to 120ms. Reduced motion disables both. Theme switches are instant (transitions suppressed during the swap).

## Do's and Don'ts

### Do:

- **Do** open every section with the ruler, and place the lit segment by the section's position on the page.
- **Do** build hierarchy with the display and headline scales at weight 500 and negative tracking, and let headings break short (12 to 16ch).
- **Do** use Geist Mono uppercase with tabular numerals for durations, captions and fixed measurement labels.
- **Do** keep a single diagonal beam per scene, and show importance by lighting a surface (blue border, inner beam, blue glow).
- **Do** use the arrow-in-a-square on primary and conversion actions, and justify label and square apart in full-width buttons.
- **Do** consume colors through theme roles so the day garage stays a faithful mirror, with AA contrast in both themes.
- **Do** keep motion one-time: light on at entry, short reveals, nothing looping, all of it off under reduced motion.

### Don't:

- **Don't** put a mono or uppercase label above a section or card title as a kicker; section headings have no label above them.
- **Don't** add a second light color, a neon glow in another hue, or a gradient that is not the blue-to-cyan beam.
- **Don't** lift cards on hover with translate or heavier gray shadows.
- **Don't** round controls past 6px or cards past 10px, and don't introduce pill buttons; circles are only for the floating WhatsApp button and avatars.
- **Don't** use typed glyph arrows (such as ← → ↗) as icons; use the inline SVG icon set.
- **Don't** use cold-cyan as text or as a fill outside light effects.
