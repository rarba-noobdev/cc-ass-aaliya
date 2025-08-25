# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

---

## Project-specific notes & verification

This workspace contains a simple image analysis demo. I cleaned up the main page component to use plain Svelte reactive variables so UI bindings (like radio buttons) work correctly.

To verify locally:

1. Install deps: `pnpm install` or `npm install`
2. Run dev server: `pnpm run dev` or `npm run dev`
3. Open the app, upload an image, and try each analysis radio option — selection should switch immediately and requests to `/api/vision` should include the selected `mode`.

If you want, I can add a small test or a visible debug readout that shows the current `mode` in the UI.
