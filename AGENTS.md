# Architecture rules

- Username-only authentication maps normalized identifiers to the existing synthetic email domain for compatibility with existing accounts; signup succeeds only when Cloud Auth returns a session.
- Remote MCP tools require managed OAuth issuer validation with the OAuth client claim; keep personal records unexposed and preserve the validated consent return path through authentication, including during maintenance.