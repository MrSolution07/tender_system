# Workers

Node.js processes that must not run in a mobile or browser bundle.

| Entrypoint | Job |
| --- | --- |
| `ai-document` | OCR (optional) + LLM extraction → `ai_analyses` (`needs_review`) |
| `notify` | Expo Push + email; later SMS; 24h closing reminders |

Not scaffolded. Create the package when Week 5 (AI) or Week 7 (notifications) starts. Service role key is allowed here. Edge Functions only forward events; long LLM calls stay in this package.
