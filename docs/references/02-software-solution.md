# Proposed Software Solution

**Source:** `Tender_Platform_Software_Solution_Proposal.docx`  
**Title:** Government Tender Intelligence & Transparency Platform  
**Subtitle:** System Design, Architecture & Technology Recommendation — Major Tech

This is a faithful markdown conversion of the software-solution proposal. It is the **authoritative stack recommendation**. The fuller system-design write-up is [03-system-design.md](./03-system-design.md).

---

## 1. Executive summary

This document proposes a practical, easy-to-implement software solution for the Government Tender Intelligence and Transparency Platform. The solution is built around three client applications sharing one common backend:

- an internal mobile app for government officials
- an external mobile app for contractors and the public
- role-based dashboards that surface the right information to the right user

The recommended stack — **React Native (Expo)** for both mobile apps, **Supabase** as the primary backend, and a **lightweight Node.js service** for notifications — was chosen specifically because it lets a small team ship a secure, real-time, multi-role platform quickly, without maintaining heavy custom infrastructure.

## 2. Recommended solution overview

The platform is organised around a single source of truth (Supabase Postgres) accessed by three purpose-built clients. Each client renders different screens, dashboards and permissions depending on the authenticated user's role, enforced both in the UI and at the database level using Row Level Security (RLS).

- **Internal Mobile App** — used by procurement officers, evaluators and administrators to manage tenders, review AI-generated document summaries, evaluate bids and monitor compliance on the go.
- **External Mobile App** — used by contractors to search and apply for tenders, track submission status and receive alerts, and by members of the public to browse awarded tenders, contractor details and expenditure summaries.
- **Role-Based Dashboards** — analytics and reporting screens (tender pipeline, spend, compliance flags, SLA timers) that adapt to the signed-in user's access level, available inside both apps and as a web dashboard for desk-based staff.

## 3. User roles and access levels

Access is controlled through role-based permissions defined in Supabase Auth and enforced with Row Level Security policies on every table, so a user can only ever query the data their role permits — even if the API is called directly.

| Role | App | Access level and key permissions |
| --- | --- | --- |
| Super Admin | Internal | Full system access: manage users and roles, configure departments, view audit logs, override statuses. |
| Procurement Officer | Internal | Create and publish tenders, upload documents, view AI summaries, track status, generate reports. |
| Evaluator / Bid Committee | Internal | View assigned tenders and bid submissions, score and evaluate, view AI compliance flags. |
| Contractor / Supplier | External | Search open tenders, submit bids, track own submission status, receive award notifications. |
| Public / Citizen | External | Read-only access to awarded tenders, contractor information, expenditure summaries and project progress. |

## 4. Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Internal & External Mobile Apps | React Native + Expo | Single codebase family for iOS and Android; Expo speeds up builds, OTA updates and access to native modules (camera, file picker, push, biometrics) without ejecting. |
| Web Admin Dashboard | React / Next.js | Larger-screen reporting and administration for desk-based procurement managers and executives; reuses the same Supabase client and design tokens as the mobile apps. |
| Backend-as-a-Service | Supabase | Managed Postgres database, authentication, row-level security, file storage, and realtime subscriptions — removes the need to build and host a custom REST backend. |
| Notification Service | Node.js | Dedicated service that listens for Supabase database events (via Edge Functions/webhooks) and dispatches push, email and SMS notifications, plus scheduled jobs for tender-deadline reminders. |
| AI Document Service | Node.js | Wraps an LLM API to summarise tender documents, extract closing dates and compliance requirements, and flag missing information as soon as a document is uploaded. |
| Database | Supabase Postgres | Structured storage for tenders, bids, users, audit logs and expenditure records, with full-text search and RLS built in. |
| File Storage | Supabase Storage | Secure storage for tender documents, bid attachments and supporting evidence, with signed URLs for controlled access. |

## 5. Recommended additional APIs and services

These services complement the core stack. They have generous free tiers for a student/proof-of-concept build, and can be swapped later without re-architecting the system.

| Service | Recommended option | Why it is needed |
| --- | --- | --- |
| Push notifications | Expo Push Notification Service | Sends push notifications to both mobile apps through one API; Expo handles FCM (Android) and APNs (iOS). |
| Document summarisation | Claude API or OpenAI API | Powers AI-assisted analysis: summarising lengthy tender documents and extracting compliance requirements and evaluation criteria. |
| OCR for scanned PDFs | Google Document AI or AWS Textract | Many tender documents are scanned; OCR converts them to text before the LLM can summarise them. |
| Transactional email | Resend or SendGrid | Registration confirmations, tender award notices and password resets. |
| SMS alerts | Twilio | Critical deadline reminders (e.g. tender closing in 24 hours) for contractors who may not check email or the app daily. |
| Search | Meilisearch (self-hosted) or Algolia | Fast, typo-tolerant search and filtering across thousands of tenders. |
| Error & performance monitoring | Sentry | Crashes and errors across Expo apps, the web dashboard and Node.js services. |
| Maps | Mapbox or Google Maps API | Project locations on the public transparency portal. |
| Charts / data viz | Victory Native (mobile) & Recharts (web) | Tender pipeline, spend over time, compliance status. |
| Bot protection | Cloudflare Turnstile | Protects public-facing search and submission forms from automated abuse. |

## 6. System architecture

The architecture is organised into three layers: a client layer (the two Expo mobile apps and the web dashboard), an application and backend layer (Supabase plus the two Node.js services), and a layer of external APIs the backend calls out to.

Supabase Edge Functions act as the glue: they fire on database events (a document upload, a status change) and trigger the Node.js notification and AI services. Mobile apps never poll — they subscribe to Supabase Realtime and receive changes as they happen.

### How the pieces fit together

- All three clients authenticate through Supabase Auth and talk to Postgres through Supabase's auto-generated REST/RPC layer, with RLS enforcing what each role can see or change.
- When a procurement officer uploads a tender document, it lands in Supabase Storage, an Edge Function fires, and the AI Document Service pulls in the LLM and OCR APIs to generate a summary that's written back to Postgres — appearing in the app moments later via Realtime.
- When a tender's status changes (published, closing soon, awarded), an Edge Function triggers the Node.js notification service, which fans the update out over push, email and SMS.
- Search queries from any client go to the search service rather than the primary database, keeping full-text search fast even as the number of tenders grows.

The working architecture diagram for this repo is in [../architecture/overview.md](../architecture/overview.md).

## 7. Use case diagram

Actors group into **internal users** (Super Admin, Procurement Officer, Evaluator) and **external users** (Contractor, Public/Citizen). Each maps to the actions their role permits. See [03-system-design.md](./03-system-design.md) section 5.

## 8. Key workflows

### 8.1 Tender publishing and AI analysis

1. A procurement officer creates a tender and uploads supporting documents from the Internal App.
2. Documents are stored in Supabase Storage; an Edge Function triggers the AI Document Service.
3. The AI service runs OCR (if needed) and calls the LLM API to summarise the document and extract closing dates, compliance requirements and evaluation criteria.
4. The summary is written back to Postgres and appears instantly in the app via Realtime, along with any flagged missing requirements.

### 8.2 Bid submission and evaluation

1. A contractor searches and finds a relevant tender in the External App and submits a bid with supporting documents.
2. The Node.js notification service alerts the assigned evaluators.
3. Evaluators score and comment on submissions from the Internal App; AI-flagged compliance issues are shown alongside each bid.
4. Once a decision is made, the tender status updates to “Awarded,” automatically notifying the winning and unsuccessful contractors and publishing the result to the public portal.

### 8.3 Public transparency

1. A citizen opens the External App without logging in and browses awarded tenders, contractor details and expenditure summaries.
2. Search and filter requests are served by the search service for fast results even as the tender archive grows.
3. Project locations, where available, are plotted on a map using the Maps API.

## 9. Implementation roadmap

| Phase | Focus | Key deliverables |
| --- | --- | --- |
| 1 — Foundation | Setup & core data model | Supabase project, database schema, RLS policies, Auth & role setup, Expo app scaffolding (internal & external). |
| 2 — Internal App | Officials' workflows | Tender creation, document upload, AI summarisation integration, evaluator scoring screens. |
| 3 — External App | Contractor & public workflows | Tender search, bid submission, status tracking, public transparency portal (read-only). |
| 4 — Notifications & Dashboards | Real-time & reporting | Node.js notification service, push/email/SMS integration, role-based dashboards on mobile and web. |
| 5 — Hardening & Testing | Quality & security | Functional, usability and security testing; monitoring (Sentry) wired in; performance tuning. |
| 6 — Deployment | Go-live | App store / Play Store submission (internal distribution or TestFlight/Play internal track), production Supabase environment, documentation. |

The repo build order that follows this roadmap is [../BUILD.md](../BUILD.md).

## 10. Security and compliance considerations

- Row Level Security on every table so access control lives in the database, not just the app — a stolen API key cannot expose data outside a user's role.
- All file access via Supabase Storage signed URLs with short expiry, rather than public buckets.
- Audit logging of key actions (tender creation, status changes, evaluation scores) for accountability.
- Multi-factor authentication for internal accounts (Super Admin, Procurement Officer, Evaluator) through Supabase Auth.
- Rate limiting and bot protection (Cloudflare Turnstile) on public-facing search and submission endpoints.
- Environment-separated deployments (development / staging / production) so AI and notification integrations can be tested safely before reaching real users.

## 11. Conclusion

This solution keeps the team's chosen tools — React Native Expo, Supabase and Node.js — at the centre, while filling in the remaining gaps (AI document analysis, OCR, notifications, search, monitoring) with well-supported managed APIs rather than custom infrastructure. The result is a platform that is realistic to build within a student project timeline, while still delivering the full brief: a secure internal tool for procurement officials, a public-facing app for contractors and citizens, and role-aware dashboards that make procurement activity easy to monitor at every level.
