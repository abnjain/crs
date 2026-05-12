# CRS Frontend Architecture

## MVC-Style Structure

```
src/
├── components/          # Views / UI
│   ├── common/          # Reusable: Button, Badge, Dialog, ErrorBoundary, etc.
│   ├── layout/          # Layouts: MainLayout, ProtectedRoute
│   └── landing/         # Landing-specific sections
├── pages/               # Route-level views (screens)
├── context/             # Context APIs: Auth, Theme
├── services/            # Models / API layer (auth, health, api)
├── router/              # Route definitions
└── styles/              # Modular Tailwind-compatible CSS
    ├── variables/       # Design tokens
    ├── base.css         # Reset, base components
    ├── components/      # Component-specific (dialog, etc.)
    └── *.css            # Feature styles (landing, auth, dashboard, errors)
```

## Key Patterns

- **Context APIs**: AuthProvider, ThemeProvider for global state
- **Error Boundaries**: App wrapped in ErrorBoundary for crash recovery
- **Layouts**: MainLayout (Header + main + Footer), ProtectedRoute for auth
- **Dialogs**: Reusable Dialog component for modals
- **Static Builds**: `npm run build` → `dist/` for NGINX deployment
