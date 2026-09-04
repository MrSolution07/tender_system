# Government Tender Intelligence and Transparency Platform

**Source:** `task1.docx`  
**Document:** System Design and Project Planning  
**Group:** Major Tech

This is a faithful markdown conversion of the system-design document. Combined with [02-software-solution.md](./02-software-solution.md), it is the design contract for this repository.

---

## 1. Client profile and description

The proposed client is a South African government procurement environment, represented by a government department or public-sector procurement office responsible for purchasing goods and services through tenders. The client works with procurement officers, evaluators, administrators, contractors and members of the public. The platform is designed for an environment where procurement information must be managed securely while appropriate information is made available to the public.

The system is **not** intended to replace procurement officials or statutory decision-making. It provides digital tools for organising information, analysing documents, monitoring deadlines and compliance, and improving transparency.

## 2. Client requirements

### 2.1 Functional requirements

- User authentication and role-based access for administrators, procurement officers, evaluators, contractors and public users.
- Create, edit, publish, close and archive tender records.
- Upload and store tender documents and supporting files.
- Use AI-assisted document analysis to generate summaries and highlight closing dates, mandatory requirements, compliance information and evaluation criteria.
- Allow procurement officers to review and approve AI-generated information before it is used operationally.
- Allow contractors to search available tenders, view requirements and submit bids.
- Allow evaluators to access assigned bids, record scores, comments and compliance decisions.
- Track tender lifecycle stages from draft and publication through evaluation, award and completion.
- Maintain contractor profiles and relevant compliance information.
- Provide dashboards for tender pipeline, closing dates, compliance flags, evaluation progress, project progress and expenditure.
- Provide a public portal for awarded tenders, contractor information, project progress and expenditure summaries.
- Generate searchable reports and audit-friendly records.
- Send notifications and alerts for important events such as closing dates, evaluation tasks and status changes.

### 2.2 Non-functional requirements

| Concern | Requirement |
| --- | --- |
| Security | Sensitive procurement information must be protected using authentication, authorisation and database-level access controls. |
| Privacy | Personal and confidential information must not be exposed through the public portal. |
| Performance | Common screens and searches should respond within an acceptable time under normal school-project test conditions. |
| Availability | The system should be available whenever authorised users need to manage procurement activities. |
| Usability | Screens should be simple, responsive and suitable for mobile and desktop use. |
| Scalability | The database and storage design should allow the number of tenders, documents, bids and users to grow. |
| Reliability | Transactions and important procurement records should be stored consistently without accidental data loss. |
| Maintainability | The application should use modular services, clear naming and established design patterns. |
| Auditability | Important actions such as tender updates, evaluations and awards should be traceable. |
| AI safety | AI output is advisory and must be reviewed by a human before being treated as an official procurement decision. |

## 3. Background information on the system

Government procurement can involve large numbers of tenders, lengthy documents, multiple stakeholders and strict deadlines. When information is distributed across documents and systems, officials may spend significant time locating requirements, checking compliance and monitoring tender progress. Members of the public can also find it difficult to obtain a clear picture of awarded contracts, contractors, project progress and expenditure.

The proposed Tender Intelligence and Transparency Platform addresses this problem by creating a central source of procurement information. **Supabase PostgreSQL is the single source of truth**, while separate clients present information according to the user's role. **Row Level Security (RLS)** is used at the database level so that permissions are not dependent only on what the interface displays.

The solution has three main client experiences:

1. **Internal Mobile App** for administrators, procurement officers and evaluators
2. **External Mobile App** for contractors and public users
3. **Role-based dashboards** for analytics and reporting

AI-assisted analysis helps summarise tender documents and identify important information. The AI is an assistance mechanism rather than a final decision-maker: officials remain responsible for procurement decisions, evaluation outcomes and approvals.

## 4. High-level system design

The system follows a layered architecture. The presentation layer contains the mobile applications and web dashboard. The application/service layer handles authentication, tender management, document processing, AI analysis, bid evaluation, notifications and reporting. The data layer uses Supabase PostgreSQL for structured procurement data, with secure file storage for tender documents. Database RLS policies enforce which records each authenticated role can read or modify.

### 4.1 Major components

| Component | Responsibility |
| --- | --- |
| Authentication and Role Management | Sign-in and permissions. |
| Tender Management | Tender records, dates, status, categories, budgets and requirements. |
| Document Management | Stores tender documents and links them to tender records. |
| AI Document Analysis | Extracts or summarises key information and flags items for human review. |
| Bid Management | Contractor submissions and submission status. |
| Evaluation Module | Authorised evaluators score bids and record comments and recommendations. |
| Compliance Monitoring | Tracks mandatory requirements and identifies missing or potentially non-compliant information. |
| Project and Expenditure Tracking | Awarded projects, progress and expenditure summaries. |
| Transparency Portal | Publishes appropriate award and project information to public users. |
| Dashboards and Reporting | Pipeline, spend, compliance, deadlines and performance indicators. |
| Notification Service | Alerts for closing dates, assigned evaluations and important status changes. |

### 4.2 Data flow overview

1. An authorised procurement officer creates a tender and uploads the relevant documents.
2. Documents are stored securely and associated with the tender record.
3. The AI analysis service processes the documents and proposes a summary, requirements, closing date and evaluation criteria.
4. A procurement officer reviews the AI output and confirms or corrects important information.
5. The tender is published to the contractor-facing application.
6. Contractors submit bids before the closing date.
7. Evaluators access authorised bids and record scores, comments and compliance findings.
8. An authorised official records the award and updates the tender status.
9. Approved award, contractor, project and expenditure information is exposed through the public transparency portal according to publication rules.
10. Dashboards calculate and display procurement and project indicators for authorised users.

### 4.3 Technology overview

| Area | Proposed technology / approach |
| --- | --- |
| Database | Supabase PostgreSQL with Row Level Security (RLS). |
| Authentication | Role-based authenticated accounts; permissions enforced in the application and database. |
| Applications | Internal mobile client, external mobile client and web-based role dashboards. |
| File storage | Secure object/file storage for tender documents and supporting files. |
| AI | AI-assisted document summarisation and extraction of key tender information. |
| Reporting | Role-based dashboards, searchable records and procurement reports. |
| Notifications | In-app and/or push/email-style alerts depending on implementation scope. |

### 4.5 Systems architecture

The platform follows a multi-client, service-oriented architecture around a centralised data source. Supabase PostgreSQL is the single source of truth. Different applications connect to the same backend services and database, but the functionality and information available to each user are controlled according to their role.

Four layers: **Client**, **Application/Service**, **Data and Storage**, **AI and Notification Services**.

#### 4.5.1 Client layer

**Internal Mobile Application** — government employees and authorised officials. Procurement officers create and manage tenders, upload documents, review AI-generated summaries, manage requirements and monitor tender progress. Evaluators access assigned bids, perform compliance checks, record scores and provide evaluation comments. Administrators manage users, roles and system settings.

**External Mobile Application** — contractors and members of the public. Contractors create or maintain a company profile, search available tenders, view requirements, submit bids and monitor submission status. Public users access approved procurement information: awarded tenders, contractor details, project progress and expenditure summaries.

**Web-Based Role-Based Dashboard** — detailed reporting and analytics for desk-based monitoring. Adapts to the authenticated user's role: tender pipeline, upcoming closing dates, compliance flags, evaluation progress, project progress, expenditure and SLA timers.

#### 4.5.2 Application and service layer

Common services own procurement rules. Clients do not re-implement them.

- Authentication Service
- Tender Management Service
- Document Management Service
- AI Document Analysis Service
- Bid Management Service
- Evaluation Service
- Compliance Service
- Award Service
- Project Management Service
- Expenditure Service
- Notification Service
- Reporting and Analytics Service
- Transparency Service

Separate services keep each major area of functionality to a defined responsibility.

#### 4.5.3 Data and storage layer

Supabase PostgreSQL stores:

- User accounts and roles
- Contractor profiles
- Tender information and requirements
- Evaluation criteria
- Tender documents and document metadata
- Bids and bid requirement responses
- Evaluations
- Awards
- Projects and expenditure
- Notifications

RLS enforces access control at the database level. A contractor can only access their own bid information. An evaluator can only access bids and evaluations they are authorised to work with. Access restrictions are not dependent solely on the application's user interface.

#### 4.5.4 Document storage

Tender documents (specifications, schedules, application forms, supporting documents) are stored separately from the relational database using secure object/file storage. The database stores metadata and a reference to the stored file.

#### 4.5.5 AI document analysis

1. A procurement officer uploads a tender document.
2. The document is securely stored.
3. The Document Management Service sends the document or extracted text to the AI Document Analysis Service.
4. The AI analyses the content.
5. The AI produces a proposed summary and identifies closing dates, mandatory requirements, compliance requirements and evaluation criteria.
6. Results are stored against the document/tender record.
7. The procurement officer reviews the AI-generated information.
8. The official can correct or approve the extracted information before it is used operationally.

The AI component is an assistive tool, not an autonomous decision-maker.

#### 4.5.6 Security architecture

Defence in depth:

1. Users must authenticate before accessing protected functionality.
2. The application uses role-based authorisation to determine which screens and operations are available.
3. Supabase PostgreSQL RLS provides database-level protection.
4. Sensitive internal information (confidential bids, evaluator comments) is separated from information intended for the public. The Transparency Service exposes only approved fields to public users.

#### 4.5.7 Overall system flow

```
User → Client Application → Authentication → Application Services
  → Supabase Database / Storage → AI or Notification Services → Client Application
```

When a procurement officer creates a tender, the request is sent from the Internal Mobile Application to the Tender Management Service. The service validates the request and stores the tender in Supabase PostgreSQL. Uploaded documents go to secure storage and may be passed to the AI Document Analysis Service. The resulting analysis is saved and presented to the procurement officer for verification.

When a contractor submits a bid, the External Mobile Application communicates with the Bid Management Service. The service validates the submission, stores the bid and associates it with the relevant tender and contractor. Evaluators subsequently access authorised bids through the Evaluation Service.

After a tender is awarded, project and expenditure information can be recorded. Approved information is then made available through the Transparency Service.

## 5. UML diagram

The use-case diagram identifies the main actors and their interactions with the platform:

- Administrators manage users and system configuration
- Procurement officers manage tenders and documents
- Evaluators assess bids
- Contractors submit bids
- Public users access transparency information

The original Word file contained a diagram image that is not reproduced here. Recreate it from this actor list when preparing the final report.

## 6. ER diagram

The ER diagram represents the proposed core relational database. It can be expanded during implementation with audit logs, tender requirements, bid documents and additional compliance tables.

The original Word file contained a diagram image that is not reproduced here. The working schema for this repo is [../architecture/schema.sql](../architecture/schema.sql) and [../architecture/data-model.md](../architecture/data-model.md).

### 6.1 Main entities and purpose

| Entity | Purpose |
| --- | --- |
| Users | Authenticated platform users and their roles. |
| Tenders | Title, description, category, closing date, status and budget. |
| Documents | Metadata and secure file references for tender documents and AI summaries. |
| Contractors | Contractor/company profiles and compliance status. |
| Bids | Contractor submissions, amounts, dates and submission status. |
| Evaluations | Evaluator scores, comments and evaluation decisions. |
| Projects | Awarded project details, progress and project dates. |
| Expenditure | Project expenditure entries used for reporting. |
| Notifications | Alerts delivered to platform users. |

## 7. Description of design patterns

| Pattern | Use in this platform |
| --- | --- |
| Repository | Separates database access from business logic. |
| Service layer | Groups operations into TenderService, DocumentAnalysisService, EvaluationService, ReportingService. |
| Factory | Different notification, document-processing or AI provider implementations without changing calling code. |
| Strategy | Role-specific or configurable behaviours (notification channels, document-analysis strategies). |
| Observer / pub-sub | Notifications and status changes. |
| Dependency injection | Services and repositories provided to controllers/view-models. |
| MVC / MVVM | Client applications separate interface concerns from application/data logic. |

## 8. Project management

### 8.1 Project plan and timeline

| Period | Task | Activities | Deliverable |
| --- | --- | --- | --- |
| Week 1 | Requirements analysis | Confirm problem, stakeholders, roles, functional/non-functional requirements. | Approved requirements specification |
| Week 2 | System analysis and design | Architecture, use cases, database design, security model and UI planning. | UML + ERD + design specification |
| Week 3 | Database and authentication | Create Supabase schema, relationships, RLS policies and role handling. | Working database and authentication |
| Week 4 | Tender management | Build tender CRUD, search, status workflow and document upload. | Tender management module |
| Week 5 | AI document analysis | Document processing, AI summary and key-field extraction with human review. | AI-assisted analysis module |
| Week 6 | Bids and evaluations | Contractor submissions, evaluator scoring and compliance tracking. | Bid/evaluation module |
| Week 7 | Transparency portal and dashboards | Public award/project views and role-based analytics. | Public portal + dashboards |
| Week 8 | Testing and refinement | Functional, security, usability and integration testing; fix defects. | Tested application |
| Week 9 | Documentation and demonstration | Finalise report, screenshots, diagrams, user guide and presentation/demo. | Final project submission |

Repo sequencing for this plan: [../BUILD.md](../BUILD.md).

### 8.2 Responsibilities

| Role | Responsibilities |
| --- | --- |
| Project Lead / Developer | Requirements, architecture, coding, integration, testing and final documentation. |
| Database Developer | Supabase schema, relationships, RLS policies, data validation and backups/testing. |
| AI/Integration Developer | Document processing, prompt design, extraction logic, AI validation workflow and error handling. |
| UI/UX Developer | Mobile screens, dashboard layouts, responsive design and role-specific navigation. |
| Tester | Test cases, role/permission testing, validation, defect reporting and regression testing. |

### 8.3 Milestones

1. Requirements and scope approved.
2. UML, ERD and architecture completed.
3. Database, authentication and RLS operational.
4. Tender and document management operational.
5. AI-assisted analysis operational with human review.
6. Bidding, evaluation and compliance features operational.
7. Public transparency portal and dashboards operational.
8. Testing completed and major defects resolved.
9. Final documentation and demonstration completed.

### 8.4 Risks and mitigation

| Risk | Mitigation |
| --- | --- |
| Incorrect AI output | Treat AI results as suggestions; require human review and confirmation before official use. |
| Unauthorised access | Authentication, role-based authorisation and Supabase RLS policies. |
| Data leakage | Separate public and internal data views; never publish confidential information. |
| Missed tender deadlines | Closing-date validation, dashboard SLA timers and notifications. |
| Poor data quality | Required fields, validation rules and controlled status values. |
| System integration problems | Build and test modules incrementally; maintain clear service interfaces. |
| Scope expansion | Prioritise core tender, bid, evaluation, transparency and reporting features before optional enhancements. |

## 9. Conclusion

The Government Tender Intelligence and Transparency Platform provides a practical digital response to the challenges of managing and monitoring public procurement information. By combining a central PostgreSQL database, role-based access control, AI-assisted document analysis, tender and evaluation workflows, dashboards and a public transparency portal, the proposed system can improve the accessibility and organisation of procurement information.

The design deliberately keeps humans responsible for procurement decisions. AI assists with information discovery and summarisation, while authorised officials remain responsible for verifying requirements, evaluating bids and approving procurement outcomes.

## Suggested core user roles

- **Administrator** — manages users, roles, system configuration and oversight.
- **Procurement Officer** — creates and manages tenders, documents, requirements and procurement progress.
- **Evaluator** — reviews assigned bids, records scores and provides evaluation comments.
- **Contractor** — maintains company information, searches tenders and submits bids.
- **Public User** — views published awards, contractors, project progress and expenditure summaries.
