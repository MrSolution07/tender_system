# Dashboard and Reporting UI Contribution

## Changes in this contribution

- Updated the staff pipeline page with a more prominent procurement workspace header, quick links, four summary metrics, and a financial overview metric.
- Added a Reports page at `/desk/reports`.
- Added a Reports item to the staff navigation for procurement officers and super administrators.
- Added search across tender title, department, category, and status.
- Added CSV exports for the tender register and awarded project/expenditure data, plus an export of filtered tender results.
- Added an explicit notice that the displayed records and amounts are sample data, not live or audited procurement data.

## Files changed

- `apps/web/app/desk/page.tsx`
- `apps/web/components/desk-shell.tsx`
- `apps/web/app/desk/reports/page.tsx` (new)

## Important limitations

This is a UI contribution to the existing preview app. It uses the project's current browser-local sample store. It does not connect to a live government procurement database or add server-side authentication, persistence, or audited financial reporting.

## Run and verify locally

From the repository root, use Node.js 22 and pnpm 10 as specified by the project:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, sign in using the preview flow as a procurement officer or super administrator, and visit `/desk` and `/desk/reports`. Test the search field and both CSV export buttons. Also test on a narrow browser width.

The changes were not build-tested in the authoring environment because the pnpm package manager could not be downloaded from the npm registry in this environment. Run the project's lint and typecheck commands locally before merging.
