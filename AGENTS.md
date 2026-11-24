# Architecture rules

- Username-only authentication maps normalized identifiers to the existing synthetic email domain for compatibility with existing accounts; signup succeeds only when Cloud Auth returns a session.
- Use the shared BrandLogo component for platform branding and global CSS semantic tokens for its appearance, so all pages use the same official image and theme.
- Keep platform media inside its homepage section and use only supplied screenshots for Studio, to avoid fictional product demonstrations.
- Display supplied Studio screenshots through the shared gallery with lazy-loaded images and accessible enlargement dialogs, so real interfaces remain inspectable on small screens.