# Todo App

A single-page TODO web app built with React, Vite, and TypeScript.

## Features

- Add, toggle, edit, and delete todos
- Filter by all / active / completed
- Persists to `localStorage` under key `todo-app-2:v1`

## Commands

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build
npm test         # run tests in watch mode
npm run test:run # run tests once
npm run deploy   # build and publish to GitHub Pages
```

## Deploy to GitHub Pages

1. Set `homepage` in `package.json` to `https://<owner>.github.io/<repo>`.
2. Push your source branch: `git push -u origin master`
3. Deploy: `npm run deploy`

GitHub repo settings: **Pages → Source → Deploy from branch → `gh-pages` / `/ (root)`**.

Site URL: https://trimblesolutionscorporation.github.io/todo-app-gascity-demo

## Stack

- Vite 6 + React 18 + TypeScript (strict)
- Vitest + Testing Library for unit/component tests
