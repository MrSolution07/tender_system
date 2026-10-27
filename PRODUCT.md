# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, Tailwind, shadcn/ui on Radix, pnpm workspace. Confirmed in `docs/BUILD.md` and the approved website plan. Expo apps are a later pass.

## Users

- Public visitors read awarded and published procurement notices. No account.
- Procurement officers draft tenders, add requirements and pack files, move status, and review AI suggestions at a desk.
- Evaluators score assigned bids. Scores stay off the public site.
- Super admins use the same desk, and also create accounts, set roles, and read the audit log.
- Contractors sign in on the external app, attach bid files, and submit while a notice is open.

## Product Purpose

Government Tender Intelligence and Transparency Platform for Group Major Tech. Officers manage the tender lifecycle. The public sees what was published and awarded. Success in this pass: both surfaces are clickable with realistic sample data.

## Positioning

One Postgres-backed procurement record, shown differently by role. The public site is a transparency projection. The desk is the operational record. AI suggests. An officer approves before any official field changes.

## Operating Context

South African public procurement. Currency is ZAR. Status path is draft, published, closed, evaluating, awarded, completed, archived. This pass has no live database. Sample rows stand in, labeled as a preview.

## Capabilities and Constraints

- Status values and `canTransition` come from `@tender/shared`.
- Public pages omit bids, scores, evaluator comments, AI drafts, and official contact details.
- Approving an AI suggestion does not rewrite closing dates, requirements, or criteria.
- Desk and mobile sign-in use Supabase Auth. Roles come from `profiles`.
- A super admin creates accounts through an Edge Function. The service role stays on that function.
- No service-role key in a client bundle. No custom REST API.
- Approving an AI suggestion still does not rewrite official tender fields. An officer can copy extracted lines only after the suggestion is approved or corrected, and only when those lines exist.

## Brand Commitments

Product name: Major Tech — Government Tender Intelligence. Do not use the FNB name, logo, or wordmark. The user bound the visual reference to the FNB app’s light teal-and-orange banking UI.

## Evidence on Hand

Domain enums in `packages/shared`. Schema contract in `docs/architecture/schema.sql`. No live tender records, photos, or logos. Sample departments and contractors are fictional and must stay labeled as sample data.

## Product Principles

- Public text is a projection of what may be shown, never the internal file.
- AI copy stays marked Suggested until a person reviews it.
- Status changes follow the shared transition map.
- The desk and the public site are one product, two audiences.
- Preview UI must not pretend to be a signed-in system.
