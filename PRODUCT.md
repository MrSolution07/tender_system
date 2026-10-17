# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, Tailwind, shadcn/ui on Radix, pnpm workspace. Confirmed in `docs/BUILD.md` and the approved website plan. Expo apps are a later pass.

## Users

- Public visitors read awarded and published procurement notices. No account.
- Procurement officers draft tenders, move status, and review AI suggestions at a desk.
- Evaluators score assigned bids. Scores stay off the public site.
- Super admins see the same desk as officers in this preview.

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
- Desk sign-in is a local preview session, not Supabase Auth.
- No service-role key. No custom REST API.
- Live Auth and schema are not in this pass.

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
