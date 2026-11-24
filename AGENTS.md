# Architecture rules

- Username-only authentication maps normalized identifiers to the existing synthetic email domain for compatibility with existing accounts; signup succeeds only when Cloud Auth returns a session.
- Use the shared BrandLogo component for platform branding and global CSS semantic tokens for its appearance, so all pages use the same official image and theme.
- Keep homepage media inside the platform section and render unavailable Studio imagery only after real screenshots are supplied, to avoid fictional product demonstrations.