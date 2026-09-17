# MCM Intelligence (Concept Prototype)

A front-end concept prototype exploring how agentic AI, analytics and human judgment could work together across a lower-middle-market private equity investment lifecycle.

This is an independent concept built by Mahbub Ahmed. It is not an official MCM Capital Partners product. All companies, deals, financials and citations are synthetic demo data. Nothing is connected to any real system.

## Run locally

    npm install
    npm run dev

## Build

    npm run build

Output is in `dist/`, which can be deployed to Vercel, Netlify or GitHub Pages as a static site.

## Live AI (optional)

The app runs fully in Demo mode with synthetic data. To enable live Claude analysis:

1. Copy `.env.example` to `.env` (never commit `.env`).
2. Set `ANTHROPIC_API_KEY` and, optionally, `ANTHROPIC_MODEL_DEFAULT`.
3. On Vercel, add the same two variables under Project Settings, Environment Variables. The key is used only inside `api/ai.js`; it is never sent to the browser.

Locally, `npm run dev` runs the frontend only (Demo mode). To exercise the live endpoint locally, install the Vercel CLI and run `npm run dev:vercel`.

The top bar shows a small status: `Live AI` when the endpoint reports a configured key, otherwise `Demo mode`. Every live call falls back to the synthetic response if it fails, times out, or returns an invalid shape.

Architecture: React components call `src/services/aiClient.js`, which posts `{ task, input }` to `/api/ai`. The endpoint forces a schema-valid structured response through Anthropic tool use, and the client validates it again before use. Task prompts and schemas live in `src/services/aiSchemas.js`.
