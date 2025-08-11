# Therame API-signing example (Express + TypeScript)

This folder contains a minimal Express app in TypeScript that verifies Therame webhook signatures.
It mirrors the verification logic in the NestJS app at the repository root.

## Features

- Uses `express.raw({ type: 'application/json' })` to collect the raw body only for the webhook route
- Verifies `x-therame-signature: sha256=<hex>` using HMAC-SHA256 with a shared secret

## Quick start

1. Install deps

```sh
pnpm i # or: npm i / yarn
```

2. Run in dev mode

```sh
pnpm dev
```

3. Send a signed test request from your client or API tool of choice. You should see "Signature verified successfully" in the server logs and a JSON `{ status: 'ok' }` response.

## Configuration

- `WEBHOOK_SECRET`: shared secret used to compute/verify HMAC. Defaults to the same demo value used in the NestJS app.
- `PORT`: defaults to `3100` for this sub-app.

Create an `.env` file to override:

```
WEBHOOK_SECRET=replace_me
PORT=3100
```

## Notes

- The raw body must be used for signature verification; don't stringify/parse before computing HMAC.
- The signature header must be in the format `sha256=<hex>`.
