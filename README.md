# Rosyida Learning Space — MVP

**Tagline:** Grow Academically. Thrive Personally.  
**Assistant:** Sahabat Rosyida  
**Visual:** warm and calming — sage green, beige, off-white  
**Language direction:** Indonesian + English (MVP UI currently Indonesian; bilingual copy is a planned iteration).

## What is included

- Responsive dashboard and navigation
- Research Navigator prompt form
- Methodology Center prompt form
- Writing Reviewer (text input in this MVP)
- Emotional Space (non-clinical reflection support)
- Sahabat Rosyida chat interface
- Progress Planner saved in browser localStorage
- Local profile preference (not real authentication)
- Cloudflare Worker backend proxy for Gemini API

## Important current limitations

1. **AI is not connected until deployment is configured.** In `app.js`, set `API_URL` to your deployed Cloudflare Worker URL.
2. The profile is a local profile only, not a secure account. Supabase authentication/database are intentionally deferred to the next stage.
3. Progress and profile data are stored in the browser's localStorage on the current device/browser. They do not sync across devices.
4. Writing Reviewer currently accepts pasted text. PDF/DOCX upload and extraction are planned.
5. UI is Indonesian-first. English language toggle is a placeholder for bilingual localization.
6. Emotional Space provides supportive reflection, not clinical assessment, diagnosis, or therapy.
7. AI responses can be inaccurate. Verify academic claims and references.

## Run locally

Open `index.html` in a modern browser, or serve the folder with a local static server. Most UI features work without AI.

## Connect Gemini API using Cloudflare Workers

### 1. Create a Gemini API key

- Open Google AI Studio: https://aistudio.google.com/app/apikey
- Create an API key.
- Check current free-tier availability, regional eligibility, rate limits, and data-use terms before using it with real student content.
- Do not paste the key into `app.js`, HTML, or a public GitHub repository.

### 2. Deploy the Worker

- Create a Cloudflare account: https://dash.cloudflare.com/
- Open Workers & Pages and create a Worker.
- Paste the contents of `worker.js` into the Worker editor, or deploy with Wrangler.
- In Worker Settings → Variables and Secrets, add a secret:
  - Name: `GEMINI_API_KEY`
  - Value: your Gemini API key
- Optional variable:
  - Name: `GEMINI_MODEL`
  - Value: a model currently available to your Gemini API project. Verify the current model name in official documentation.
- Deploy and copy the Worker URL.

### 3. Connect the website

In `app.js`, replace:

```js
const API_URL = "";
```

with:

```js
const API_URL = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev";
```

Commit the change to GitHub Pages and reload the website.

### 4. Test

Try these:
- "Saya mahasiswa S1 Pendidikan. Bantu saya mengembangkan ide penelitian tentang literasi digital."
- "Apa perbedaan studi kasus dan fenomenologi?"
- "Tolong beri masukan pada paragraf latar belakang berikut..."
- "Saya kehilangan motivasi mengerjakan tesis. Bisa temani saya berefleksi?"

If AI returns an error, check Worker logs, secret configuration, provider quota, and selected model availability.

## Security and privacy before public launch

- Add rate limiting and abuse protection to the Worker. CORS alone is not authentication.
- Restrict allowed origins to the actual GitHub Pages domain once deployed.
- Add a clear privacy notice and consent before users submit manuscript or emotional content.
- Avoid collecting student identity, sensitive personal details, or confidential research data unnecessarily.
- Add authenticated accounts and private database access (e.g. Supabase) before promising cross-device personal history.
- Consider a crisis-response notice and locally appropriate support resources for Emotional Space.
- Review provider terms and data retention before production use.

## Planned next iterations

1. Bilingual Indonesian/English UI.
2. Supabase authentication and private user data.
3. PDF/DOCX upload and text extraction.
4. Rubric-based review templates for thesis, dissertation, and journal articles.
5. Curated academic knowledge base with verifiable citations.
6. Exportable review reports and progress summaries.
