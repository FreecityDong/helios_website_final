# Helios website

React / Vite product website. Run commands from this directory.

## Development

```sh
npm ci
npm run dev
```

Local preview: http://127.0.0.1:5176/

## Production build

```sh
npm run lint
npm test
npm run build
```

Deploy the contents of `dist/`. Vite uses a relative base path and the site uses hash routes, so it can be hosted under a GitHub Pages repository path. GitHub Pages must build the source with an Actions workflow or receive the compiled output; it cannot serve the JSX source directly.

Fonts and JavaScript dependencies are bundled locally. Images are local WebP files; the room model is a local GLB. External manufacturer links are navigation links, not runtime resource dependencies.

The experience form prepares a local download. It does not submit an application to a server.

## Repository contents

Keep `src/`, `public/`, `tests/`, package manifests, lockfile and build configuration. `licenses/` and `public/licenses/` preserve third-party notices.

Build output, installed dependencies, local environment settings, generated previews, source artwork, internal Markdown notes and asset-generation manifests are ignored. Original images remain locally in `output/source-images/`; published versions are in `public/assets/`.
