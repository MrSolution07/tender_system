# Docs index

Source Word documents were converted here so agents and humans share one readable contract.

| File | Origin | Role |
| --- | --- | --- |
| [references/01-research-proposal.md](./references/01-research-proposal.md) | `major tech Government_Tender_Intelligence_Proposal.docx` | Problem, aim, objectives |
| [references/02-software-solution.md](./references/02-software-solution.md) | `Tender_Platform_Software_Solution_Proposal.docx` | Chosen stack and solution architecture |
| [references/03-system-design.md](./references/03-system-design.md) | `task1.docx` | Requirements, design, plan, risks |

Working architecture for this repo (not a conversion — the build contract):

| File | Contents |
| --- | --- |
| [architecture/overview.md](./architecture/overview.md) | Layers, clients, data flow |
| [architecture/data-model.md](./architecture/data-model.md) | Entities, statuses, relationships |
| [architecture/schema.sql](./architecture/schema.sql) | Target Postgres schema |
| [architecture/security.md](./architecture/security.md) | Auth, RLS, AI safety |
| [architecture/services.md](./architecture/services.md) | Service boundaries |
| [architecture/clients.md](./architecture/clients.md) | App responsibilities |
| [BUILD.md](./BUILD.md) | Init order so implementation stays smooth |
