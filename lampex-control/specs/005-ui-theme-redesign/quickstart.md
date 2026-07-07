# Quickstart & Validation Guide: UI Theme Redesign

This guide describes how to run and validate the newly applied IFES & LAMPEX institutional theme.

## Prerequisites

- Node.js installed on your local machine.
- Project dependencies installed via:
  ```bash
  npm install
  ```

## Development & Run Commands

Start the local development server:
```bash
npm run dev
```
Open the browser at the local URL (usually `http://localhost:5173`).

---

## Validation Scenarios

### 1. Login Screen Colors (P1)
- **Path**: Navigate to `/login`.
- **Validation**:
  1. Inspect the page background: must be white (`#ffffff`).
  2. Confirm the "Entrar no Sistema" button background is `#008744` with white text.
  3. Hover over the button: verify it shifts to a darker green (`#005c2e`).
  4. Focus inside the "E-mail Corporativo" or "Senha" field: verify the border changes to green (`#008744`).
  5. Attempt to login with invalid details: check that the error message is displayed in red (`#d62d20`).

### 2. Manager Dashboard Clean Design (P2)
- **Path**: Log in as a gestor or navigate directly to `/manager-dashboard`.
- **Validation**:
  1. Verify the navigation bar (Navbar) background is green (`#008744`) and contains white text.
  2. Check that the title "Painel de Gestão e Coordenação" uses solid green (`#008744`) without blue or purple gradients.
  3. Click between "Fila de Auditoria" and "Mapa de Calor" tabs: verify the active tab has a green text and border indicator, and inactive tabs are gray/dark-text, never white-on-white.
  4. Verify the "Exportar para o SRC" button follows the primary green button style guidelines.

### 3. Global CSS Contrast & Theme Compliance (P3)
- **Path**: Navigate to any monitor profile or other app route.
- **Validation**:
  1. Ensure no dark mode backgrounds or dark glass containers with white text exist.
  2. Open browser developer console and verify there are no errors in `style.css` loading.
  3. Run Lighthouse accessibility check to ensure color contrast ratio is at least 4.5:1 on text elements.
