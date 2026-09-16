# Yuchao Qin — academic website

The public website runs on GitHub Pages. A separate Cloudflare Worker and D1 database provide editable projects, papers, notes, and a private owner workspace. The new design uses the supplied CV; it does not reuse the former blog.

## Local preview

Use Node.js 24 (22 or newer also supported).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173. Preview content is in `site/content.json`; the CV is in `site/assets/yuchaoCV.pdf`. Hash routes support refresh and direct links on GitHub Pages without server rewrites. The homepage introduction and education are in `site/app.js`. The `Papers` page contains ESTroM, RAS, and ChronoMem; research and engineering projects appear separately.

```sh
npm test
npm run build
```

## Research Library

The main navigation links to `site/library/index.html`, with separate ABCD and
Torch-Helion collections. Torch-Helion contains twelve standalone HTML explainers;
ABCD contains seventeen, with MAHL, MACO, HSCO-Bench, and VeriOpt featured first.
Both collections include original diagrams, interactive teaching examples, and
public source links. No paper PDFs are hosted in this repository.

Edit the paper content in `scripts/library-content.mjs` and `scripts/library-more-papers.mjs` and the page/diagram
templates in `scripts/build-library.mjs`. ABCD content, source metadata, and
diagrams live in `scripts/library-abcd-content.mjs`, `scripts/library-abcd-sources.mjs`,
and `scripts/library-abcd-visuals.mjs`. Run `npm run library:build` to
regenerate the checked-in HTML. Shared presentation and interactions live in
`site/library.css` and `site/library.js`, with ABCD demos in `site/library-abcd.js`.
The Library works independently of the
Cloudflare API; all reading content and worked examples are available without
JavaScript. Interactive toy costs are separate from cited paper results.

`npm run build` includes all nested Library pages and versions their
shared asset links for GitHub Pages. Preview locally with `npm run dev`, then open
`http://127.0.0.1:4173/library/index.html`.

## Cloudflare setup

1. Sign in with `npx wrangler login`.
2. Create a database with `npx wrangler d1 create yuchao-content`; replace the database ID in `worker/wrangler.jsonc` with the returned ID.
3. Run `node scripts/prepare-worker.mjs` whenever shared styles or the public seed change.
4. Apply schema: `npx wrangler d1 migrations apply yuchao-content --remote --config worker/wrangler.jsonc`.
5. Optionally load the CV-derived public entries: `npx wrangler d1 execute yuchao-content --remote --file worker/seed.sql --config worker/wrangler.jsonc`. The seed uses INSERT OR IGNORE, so it never overwrites edits.
6. Deploy with `npm run worker:deploy` and note the Worker HTTPS origin.
7. Configure immediate owner access with `node scripts/create-access-key.mjs`. The script generates a 256-bit access key, saves it to the ignored `.private/workspace-access-key.txt` file with owner-only permissions, and stores only its SHA-256 hash as a Cloudflare secret. Open `<WORKER_ORIGIN>/signin` and enter that key. Do not commit or share it.

### Optional GitHub sign-in

Create a GitHub OAuth App in your GitHub developer settings. Homepage URL: `https://worldline22.github.io`. Callback URL: `<WORKER_ORIGIN>/auth/callback`. The application requests no repository permissions.
Put the OAuth client ID in `worker/wrangler.jsonc` as `GITHUB_CLIENT_ID`. Store the client secret using `npx wrangler secret put GITHUB_CLIENT_SECRET --config worker/wrangler.jsonc`; never put it in site files, Git, or a repository variable.
Deploy the Worker again. Open `<WORKER_ORIGIN>/auth/login` and sign in as worldline22. Authorization uses the verified numeric GitHub account ID `112759137`, not a browser-supplied username.

For local Worker development, apply migrations with `--local` instead of `--remote`, use `npm run worker:dev`, and use a separate development OAuth app/callback. There is no development authentication bypass.

## GitHub Pages

Use repository `worldline22/worldline22.github.io`, branch `main`. Set **Settings → Pages → Build and deployment → Source → GitHub Actions**. Set repository **Actions variable** `PUBLIC_API_BASE` to the Worker origin (HTTPS, no trailing path). The workflow builds and uploads only `dist/`; server code, secrets, tests, and database seed are excluded.

The build injects the Cloudflare origin into public config and removes `content.json` from the published artifact. Public content then always comes from the Worker. If the API is unavailable, an error is shown instead of falling back to a stale public copy of something since made private. Without `PUBLIC_API_BASE`, the site is a static CV preview and the private workspace displays its not-connected state.

For branch-based Pages deployments, copy only the contents of a built `dist/` to the Pages publishing root. Source files can be maintained in a separate directory or branch.

## Editing and privacy

The owner workspace supports creating and editing projects, papers, and notes, setting public/private visibility, previewing text, and archiving/restoring entries. New entries default to private. Body text supports paragraphs and `##` section headings; HTML is rendered as text. No fabricated research notes are included.

Private data lives only in D1. Every admin request verifies a server-side session. Personal access uses a cryptographically random 256-bit key; only its hash is stored on the server. Optional OAuth uses single-use state and PKCE. Sessions use hashed random tokens, a seven-day expiry, Secure/HttpOnly/SameSite cookies, and same-origin checks for mutations. The public API queries only public, non-archived entries, and responses are not cached. No secrets are sent to the frontend. GitHub OAuth tokens are not retained.

Previously published material, including the supplied CV and public seed data in Git history, cannot be made confidential retroactively. Enter confidential work only through the private workspace. Project visibility does not redact the static CV.

## Verification

`npm test` exercises owner access, private/public filtering, papers, archived records, immediate privacy changes, OAuth state and PKCE, wrong-account rejection, expired sessions, origin checks, logout, request size limits, and security headers against SQLite. Browser verification should cover desktop/mobile layouts, both themes, project filters, paper navigation, and the CV link. Personal-key sign-in works immediately after setup. Optional live OAuth needs the owner's configured GitHub OAuth App.

Reference documentation: [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), [Cloudflare Worker asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).
