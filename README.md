# EnesDev

Personal portfolio built with React, TypeScript, Vite and Three.js, live at https://enesdevofficial.github.io.

## Run locally

```bash
npm install
npm run dev
```

The site runs at http://localhost:5174.

## Editing content

All text, links, projects and images live in `src/content.json` and `public/uploads/`. Edit them in the CMS at `#/admin`:

- On localhost, Save writes straight to those files. Commit and push to publish.
- On the live site, unlock with a fine-grained GitHub token (Contents: read and write on this repo). Publish commits to GitHub and the site redeploys automatically.
