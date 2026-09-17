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

## Document analysis (CIM upload)

CIM Analyzer accepts a PDF (up to 3 MB, up to 100 pages) and sends it to `/api/document`, which runs two passes: a grounded review with page citations, then normalization into the deal record that cannot add claims absent from the first pass. Extracted metrics are compared with the existing record; differences appear as data conflicts that an analyst resolves (accept, keep, or mark for review). Findings also create intelligence events on the Command Center and a record in the Research Library.

Two synthetic test documents ship in `public/samples/`: `falcon-cim-synthetic.pdf` (8 pages) and `falcon-august-operating-report.pdf` (3 pages, shows a 44% customer concentration that conflicts with the CIM's 31%).

The PDF is held in memory for the request only; nothing is written to disk or stored in the browser. Live analysis requires the API key; in Demo mode the upload control is disabled and the synthetic CIM remains available.

## Workflow state (Phase 4)

Company Analysis, Red Team and CIM Analyzer can push questions into the Due Diligence tracker ("Push to diligence"). Each question keeps its workstream, source and page, severity, creator, and a human-controlled status and owner. IC Memo drafts are generated from the full deal record (deal context, latest document extraction, red team findings and dispositions, diligence tracker, resolved conflicts) and always carry the review disclaimer; Refresh keeps the previous version for comparison. MCM Knowledge retrieves records lexically (synthetic examples, uploaded documents, generated analyses, analyst-approved findings) and asks Claude to synthesize only from what was retrieved, keeping provenance labels attached. Outreach drafts use confirmed facts only and list what was held back as unverified; nothing is sent.

All of this lives in session state (`src/services/storage.jsx`) and survives navigation. Reset demo workspace on the Agent Activity page restores the synthetic dataset.

## Exports (Phase 5)

All Export and Download controls produce real files in the browser. PDF reports (Company Intelligence Brief, Preliminary CIM Review, Red Team Report, IC Memo) are built with jsPDF and carry the MCM Intelligence header, generation time, data status, a status column on every table (Confirmed, Inferred, Estimated, Unknown, Risk), sources and page references, and a review disclaimer on every page. Excel workbooks (Target Discovery, Diligence Tracker, Financial Extraction, Risk Register, Evidence Register) are built with SheetJS and include a Provenance sheet. Exporting never upgrades a status: an estimate stays Estimated in the file.

## QA checklist (Phase 6)

Automated here: production build; undefined-identifier lint over app, services, utils and API; server-side render of all 18 routes; client fallback contract (no key, network failure, timeout, schema mismatch, upstream error) with a mocked network; endpoint validation paths for documents (type, corrupt, encrypted, oversized, page limit); PDF and XLSX generation.

Manual, with `ANTHROPIC_API_KEY` set:
1. Precision MedTech: Ask Intelligence with a free-text question (Live tag); Run full analysis (Live banner); re-run and Compare with previous; Push questions to diligence; Brief PDF; Evidence XLSX.
2. Thesis Builder: edit the rationale, Analyze thesis and score universe, Save thesis version, Open priority targets (scores tagged Live in Target Discovery), Export XLSX.
3. Red Team: Run, disposition each finding, Push questions to diligence, Export report PDF.
4. CIM Analyzer: Analyze new document with `public/samples/falcon-cim-synthetic.pdf` (Uploaded chip, clickable pages), then the August operating report (conflict cards), resolve a conflict, Push to diligence, Export review PDF, Financials XLSX.
5. Due Diligence: new questions present with status and owner controls; Tracker XLSX; Risk register XLSX.
6. IC Memo: Generate memo, Refresh memo, Compare versions, Export draft PDF.
7. MCM Knowledge: search "customer concentration in medical molding"; supporting records show provenance labels.
8. Agent Activity: AI call log shows each task with model and latency; audit trail lists the human actions above; Reset demo workspace with confirmation.

Manual, with the key removed (redeploy): the pill reads Demo mode; every action above still completes with the synthetic content; the document upload button is disabled with a visible reason; no control errors or shows raw failures.
