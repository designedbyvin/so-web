# Sō

**We create the foundation, so you can build.**

This is the React web version of Sō, built step by step. Done so far:

- **Home**: "What are you building?" with a big textarea. First-time users see example chips; returning users see their 3 most recent projects and "View all".
- **Projects**: every project as a card with a blueprint of its structure and a progress ring (e.g. 3/5). Open or delete from the ⋯ menu.
- **Step 1: Define the project**: after Continue, Sō suggests a project name from the description (editable), then asks for the objective, users, platform, requirements and constraints. Required fields are marked with *.
- **Step 2: Structure**: Gemini drafts the information architecture (sections and screens) from the Step 1 brief through a Cloudflare Worker backend. The Gemini key is stored as a Worker secret and is never sent to the browser. The visual sitemap can then be edited by hand.
- **Rail**: Home, Projects, Settings.

Projects are saved in this browser (localStorage). Light mode only for now.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Files

```
src/
  App.jsx                         Projects state and which page is showing
  data/projects.js                Saving projects, name suggestion, dates
  pages/
    HomePage.jsx                  Textarea + recent projects (or examples)
    ProjectsPage.jsx              All projects
  components/
    SideNav.jsx                   Rail: Home, Projects, Settings
    Header.jsx                    Breadcrumb + step indicator inside a project
    ProjectCard.jsx               Full and compact project cards
    Blueprint.jsx                 The structure thumbnail on each card
    ProgressRing.jsx              The 3/5 ring
    Icon.jsx                      Icons from the Sō Design System
  steps/define/
    DescribeScreen.jsx            The big textarea
    DetailsForm.jsx               The Step 1 form
  steps/structure/
    StructureStep.jsx             Step 2: generate, paste, or start blank; then edit
    Sitemap.jsx                   The boxes-and-lines sitemap
    NodePanel.jsx                 Side panel for editing the selected box
  data/ai.js                      Prompt, Gemini API call and answer parsing for Step 2
  styles/
    tokens.css                    Sō Design System colours, spacing, type (light)
    app.css                       Layout and components
```


## Deploying to GitHub Pages

This project is configured for the custom domain `so.designedbyvin.com`.
The GitHub Actions workflow at `.github/workflows/deploy.yml` builds the Vite app
and publishes the generated `dist` directory. In GitHub, open **Settings → Pages**
and set **Build and deployment → Source** to **GitHub Actions**.

The custom-domain file is `public/CNAME`; Vite copies it to `dist/CNAME` during build.


## Gemini API setup (Cloudflare Worker backend)

The frontend does not ask visitors for an API key. It sends the prompt to a Cloudflare Worker, which calls Gemini using the server-side `GEMINI_API_KEY` secret.

### 1. Deploy the Worker

1. Create/sign in to a Cloudflare account at https://dash.cloudflare.com/.
2. Install Node.js 18+ on your computer if needed.
3. From this project folder, open a terminal and run:

   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   ```

4. Cloudflare will publish a Worker URL similar to `https://so-gemini-proxy.YOUR-SUBDOMAIN.workers.dev`. Copy your actual URL.
5. Set the Gemini key as a Worker secret (do not put it in this repository):

   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

   Paste your **replacement** Gemini key when prompted. Do not reuse a key shared in chat; revoke that key first.

6. In `worker/wrangler.toml`, set `ALLOWED_ORIGIN` to your actual website origin. The current value is `https://so.designedbyvin.com`; keep it only if that is the domain you use. No trailing slash.
7. Redeploy after changing the origin: `npx wrangler deploy`.

### 2. Configure GitHub Pages to use the Worker

1. Open this repository's **Settings → Secrets and variables → Actions → Variables**.
2. Add a repository variable named `VITE_GEMINI_PROXY_URL`.
3. Set its value to the Worker URL you copied, for example `https://so-gemini-proxy.YOUR-SUBDOMAIN.workers.dev` (no trailing slash, replace with your actual URL).
4. Commit/push the updated project files, or run the workflow manually from the **Actions** tab. The GitHub Actions workflow injects this public endpoint URL at build time. This URL is not a secret; the Gemini key remains a Worker secret.
5. Open the deployed site and click **Generate structure with Gemini**. No key entry is needed in the app.

### Notes

- `vite.config.js` uses `base: "/"` because this project is configured for the custom domain `so.designedbyvin.com` via the `CNAME` file. If you stop using that custom domain and use `https://designedbyvin.github.io/so-web/` instead, change the Vite base to `/so-web/`.
- GitHub Pages is static hosting; the Cloudflare Worker is the private backend.
- The Worker restricts browser requests to the configured `ALLOWED_ORIGIN`. This is a CORS/origin check, not full authentication; add rate limiting or authentication before broad public use to reduce abuse of your Gemini quota.
