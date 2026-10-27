# Sō

**We create the foundation, so you can build.**

This is the React web version of Sō, built step by step. Done so far:

- **Home**: "What are you building?" with a big textarea. First-time users see example chips; returning users see their 3 most recent projects and "View all".
- **Projects**: every project as a card with a blueprint of its structure and a progress ring (e.g. 3/5). Open or delete from the ⋯ menu.
- **Step 1: Define the project**: after Continue, Sō suggests a project name from the description (editable), then asks for the objective, users, platform, requirements and constraints. Required fields are marked with *.
- **Step 2: Structure**: Claude drafts the information architecture (sections and screens) from the Step 1 brief, once. It shows as a visual sitemap; click any box to rename it, describe it, switch screen/dialog, move it or delete it. Without Claude (e.g. `npm run dev`), copy the prompt into any AI chat and paste the answer back, or build it by hand.
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
  data/ai.js                      Prompt, Claude call and answer parsing for Step 2
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
