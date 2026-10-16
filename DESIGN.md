---
name: Major Tech
description: Light teal desk and public tender record, in the manner of a banking app.
colors:
  canvas: "#F4F7F8"
  surface: "#FFFFFF"
  ink: "#122027"
  muted: "#3E5159"
  line: "#D5E0E3"
  teal: "#006E78"
  teal-ink: "#F4FFFE"
  teal-wash: "#E6F3F4"
  highlight: "#F26B1D"
  danger: "#9F2D2D"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  control: "0.5rem"
  surface: "1rem"
spacing:
  page: "1.5rem"
  section: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.teal-ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-active:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.teal-ink}"
  band:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.teal-ink}"
    padding: "64px 24px"
  highlight-figure:
    textColor: "{colors.highlight}"
    typography: "{typography.display}"
---

## Overview

Major Tech is a light procurement register. The public site opens on one deep-teal band. The desk is the same palette, quieter, built for scanning a pipeline. Orange appears once on a view, on a large figure or a single count. No bank logo, no dark theme.

## Colors

Teal `#006E78` carries headers, primary buttons, and the public band, with `#F4FFFE` text. Canvas is `#F4F7F8`. Cards and the desk sidebar are white. Ink is `#122027`. Secondary text is `#3E5159`, which stays readable on the canvas. Highlight `#F26B1D` is never small text on white. Danger `#9F2D2D` is for archive and field errors.

## Typography

Outfit for titles. Source Sans 3 for interface text. Headings use `text-balance`. Paragraphs use `text-pretty` and stay under about 65 characters. Money and dates use tabular figures.

## Layout

Public pages sit in a `max-w-6xl` column. The first viewport is the teal band: headline and action on the left, two counts on the right, stacked on a narrow screen. Below that, notices are rows with a divider, not cards. The desk is a left rail plus a main column. Narrow screens replace the rail with a sheet.

## Elevation & Depth

Dividers and selected nav use a border. The teal band is a flat field. Do not stack a border and a wide shadow on the same surface.

## Shapes

Base radius is `1rem`. Nested surfaces follow outer radius = inner radius + padding. Buttons use the shadcn control radius. Press feedback is `scale(0.96)` over 150ms on transform only.

## Components

shadcn on Radix, themed with the tokens above. Status is a badge. Destructive confirmation is an alert dialog. Icon-only buttons need an accessible name. Lucide is the only icon set.

## Do's and Don'ts

Do keep bids, scores, evaluator notes, AI drafts, and contact details off the public site. Do mark model text Suggested until a person reviews it. Don't add a dark theme, a gradient, or a second accent on the same view. Don't use the FNB name or logo.
