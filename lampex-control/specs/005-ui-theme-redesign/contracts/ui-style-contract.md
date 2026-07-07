# UI Style Contract: UI Theme Redesign

This document outlines the layout rules and styling constraints for components to maintain consistency with the IFES & LAMPEX theme.

## 1. Global Layout Constraints

- **Background**: Page container backgrounds must resolve to `#ffffff`.
- **Contrast**: Text elements must follow WCAG AA guidelines with a minimum contrast ratio of 4.5:1. Primary text must use `#1a1a1a` on white backgrounds.
- **Inputs**: Text inputs must have a neutral border (`#d1d7d1`) by default, and change to Verde Institucional (`#008744`) on focus.

## 2. Interactive Elements (Buttons & Tabs)

### Primary Action Button (`.btn-primary`)
- **Default State**: Background `#008744` (Verde), text `#ffffff`.
- **Hover State**: Background `#005c2e` (Verde Escuro), text `#ffffff`.
- **Focus Outline**: `#008744` with offset.

### Tab Navigation Button (`.tab-btn`)
- **Inactive State**: Text color `#4b5563`.
- **Active State**: Text color `#008744`, bottom border `2px solid #008744`.
- **Hover State**: Text color `#005c2e`.

## 3. Badges & Status Roles

### Role: Gestor (Manager)
- **Background**: `#d62d20` (Vermelho Destaque)
- **Text**: `#ffffff`

### Role: Monitor
- **Background**: `#008744` (Verde Institucional)
- **Text**: `#ffffff`

### Errors & Critical Indicators
- **Text Color**: `#d62d20`
- **Icon / Alert Fill**: `#d62d20`
