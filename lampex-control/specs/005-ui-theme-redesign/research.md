# Research: UI Theme Redesign (IFES & LAMPEX Palette)

## 1. CSS Variable Mapping & Theme Transition

### Decision
Update the global CSS variables in `src/style.css` to transition the application from a dark mode theme (dark gray, blue, purple) to a light theme based on the IFES & LAMPEX institutional colors.

The old variables will be mapped/replaced as follows:
- `--bg-primary` & `--bg-secondary` -> `--color-bg-main` (`#ffffff`) for a pure white background.
- `--text-primary` -> `--color-text-dark` (`#1a1a1a`) to ensure text legibility on a light background.
- `--text-secondary` & `--text-muted` -> adjusted to darker gray shades (e.g., `#4b5563` and `#6b7280`) for proper contrast.
- `--accent-cyan` & `--accent-purple` -> replaced or mapped to `--color-primary` (`#008744`) and `--color-primary-dark` (`#005c2e`) to remove blue/purple tones.
- `--accent-red` -> mapped to `--color-accent` (`#d62d20`).
- `--border-color` -> mapped to `--color-border` (`#d1d7d1`).
- `--border-focus` -> mapped to `--color-primary` (`#008744`).

### Rationale
By mapping existing CSS variables directly to the new design tokens, we minimize code churn across Vue files that already reference variable names like `var(--accent-red)` or `var(--border-color)`. We also ensure that other screens of the application automatically inherit the light theme colors.

### Alternatives Considered
- **Direct inline styling / Tailwind Utility override**: Rejected because maintaining centralized CSS variables in `src/style.css` is much cleaner, prevents style duplication, and respects Principle I (clean View layer) and Principle IV (clean code).

---

## 2. Login Component Styling Adjustments

### Decision
Update `src/pages/Login.vue` to adopt a pure white background (`#ffffff`). The `.glass-card` styling will be adjusted to have a white background with a subtle border and shadow instead of a dark, semi-transparent background.
Any inline white text styling (like `color: #fff` on the `h2`) will be changed to use the primary text color (`#1a1a1a`). The button will use `--color-primary` (`#008744`) as the background and transicion to `--color-primary-dark` (`#005c2e`) on `:hover`. Error messages will be styled using `--color-accent` (`#d62d20`).

### Rationale
If inline styling of white text (`color: #fff`) is left unchanged, it would result in white text on a white background, making headers invisible. Adjusting the card to a light shadow card maintains premium aesthetics while conforming to the light theme.

### Alternatives Considered
- **Keeping the dark glass card on a white background**: Rejected because it looks visually inconsistent and violates the clean light-theme requirements of the IFES identity.

---

## 3. Manager Dashboard Styling Adjustments

### Decision
Update `src/pages/ManagerDashboard.vue` (and related elements):
- Replace the blue-purple gradient on the dashboard title with a solid color `--color-primary` (`#008744`).
- Update tab buttons (`.tab-btn`) so that the active tab uses `--color-primary` (`#008744`) for its text and bottom border.
- Inactive tabs will use `--color-text-dark` or `--color-text-muted` rather than hover to `#fff` which would make it invisible on the white page background. Hover state will change to `--color-primary-dark` (`#005c2e`).
- The primary buttons (like "Exportar para o SRC") will use `--color-primary` with hover transition to `--color-primary-dark`.

### Rationale
This removes the gradient and the dark-mode active/hover styles, ensuring high readability and compliance with the green/red institutional palette.

### Alternatives Considered
- **Keeping a green-to-red gradient for titles**: Rejected because green and red gradients look muddy and fail accessibility/aesthetic standards. A clean solid institutional green (`#008744`) looks much more premium.
