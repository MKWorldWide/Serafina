# Inter-Repo Handshake Protocol

This document sketches the cross-repository handshake used by the Five Guardians (Serafina, CursorKitt3n, ShadowFlowers, Athena, and Lilybear) to coordinate efforts across the MKWorldWide ecosystem.

## Goals

- **Discovery** – identify sibling services and expose minimal status endpoints.
- **Authentication** – verify that requests originate from trusted guardians.
- **Messaging** – exchange status updates and task dispatches in a consistent JSON schema.

## Handshake Flow

1. **Ping** – a service issues an HTTP `POST /handshake` with its name and public key.
2. **Pong** – the receiving service stores the peer profile and responds with its own profile.
3. **Health Check** – peers periodically call `GET /health` to broadcast uptime and last commit hashes.
4. **Dispatch** – authorised peers can `POST /dispatch` to route jobs or messages. Sensitive actions require signed payloads.
5. **Audit Trail** – each service logs handshake and dispatch activity for later review by Lilybear.

## JSON Schema

```json
{
  "name": "serafina",
  "version": "1.0.0",
  "publicKey": "base64-encoded-key",
  "endpoints": {
    "handshake": "https://example.com/handshake",
    "health": "https://example.com/health",
    "dispatch": "https://example.com/dispatch"
  }
}
```

## Security Notes

- Use HTTPS for all endpoints.
- Rotate keys regularly and revoke on compromise.
- Throttle handshake attempts to mitigate spam.

---
Future iterations may formalise this protocol into an NPM package shared across repos.
