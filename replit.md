# Beetle Catalog

A small natural-history catalog for browsing beetle records loaded from a hosted JSON file.

## Run & Operate

- `pnpm --filter @workspace/beetle-catalog run dev` — run the catalog preview
- `pnpm --filter @workspace/beetle-catalog run typecheck` — check the Angular app
- `pnpm --filter @workspace/beetle-catalog run build` — build the static site
- Update `artifacts/beetle-catalog/src/app/data-config.ts` to set the hosted JSON URL.
- The hosted server must allow browser requests from the catalog's origin (CORS).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Angular 19, standalone components and Angular Router
- Dev server and static build: Vite
- Catalog data: fetched as JSON by the browser; no database or catalog API is required

## Where things live

- `artifacts/beetle-catalog/src/app/` — app shell, pages, routes, and JSON loader
- `artifacts/beetle-catalog/src/app/data-config.ts` — hosted JSON URL
- `artifacts/beetle-catalog/public/data/beetles.json` — the user's current 10 beetle records
- `artifacts/beetle-catalog/public/images/beetle-specimen.png` — shared illustrative placeholder for records without their own image

## Architecture decisions

- The catalog accepts either a top-level JSON array or an object with a `beetles` array. Each record can include arbitrary extra attributes.
- The groups page supports order, suborder, superfamily, family, tribe, and genus; empty values and `"0"` are grouped as not recorded.
- Angular uses its runtime compiler with Vite so the catalog does not require a separate Angular CLI build service.

## Product

- Home page links to the specimen collection, alphabetical name index, and taxonomy groups.
- Collection cards display available beetle fields, support search, and have stable fragment links.
- Index entries link directly to their matching collection cards.
- Groups page organizes the collection by order, suborder, superfamily, family, tribe, or genus, with links back to each record card.
- Loading, empty, and fetch/parse error states are shown explicitly.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Replace the sample URL in `data-config.ts` with the hosted JSON file URL. The remote host must send CORS headers allowing the catalog origin.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
