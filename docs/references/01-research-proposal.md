# Design and Development of a Government Tender Intelligence and Transparency Platform

**Source:** `major tech Government_Tender_Intelligence_Proposal.docx`  
**Group:** Major Tech  
**Authors:** Christian Bulabula (st10538419), Neo Yende (st10387834)  
**Lecturer:** Mr T Tshesebe  
**Period:** August 2026

This is a faithful markdown conversion of the original research proposal. Later design and stack decisions live in [02-software-solution.md](./02-software-solution.md) and [03-system-design.md](./03-system-design.md).

---

## 1. Problem statement

Government procurement involves thousands of tenders every year, making it difficult for departments, contractors and members of the public to efficiently monitor procurement activities. Manual document reviews, fragmented tender information and limited transparency can lead to delays, poor decision-making and reduced public confidence in how public funds are spent.

Inspired by the concerns surrounding procurement oversight highlighted by the Zondo Commission and the Mathlanga Commission, this project proposes a digital Tender Intelligence and Transparency Platform. The platform will assist government officials by:

- centralising tender information
- analysing tender documents using artificial intelligence
- tracking procurement progress
- identifying important information such as closing dates, compliance requirements and evaluation criteria

A public portal will allow citizens to monitor awarded tenders, project progress, contractor information and expenditure summaries, promoting greater transparency and accountability.

## 2. Motivation

Digital transformation of procurement can improve efficiency, fairness and accountability. An intelligent platform can reduce the time required to analyse lengthy tender documents while giving citizens greater visibility into government spending. The project demonstrates how modern technologies, including AI-assisted document analysis, can support better governance without replacing human decision-making.

### 2.1 Aim

To design and develop a Government Tender Intelligence and Transparency Platform that assists procurement officials in managing tenders while improving public access to procurement information.

### 2.2 Objectives

1. Develop a secure tender management system for authorised government officials.
2. Provide AI-assisted analysis to summarise tender documents and highlight important requirements.
3. Track the status of tenders from publication to award and completion.
4. Create a public transparency portal showing awarded tenders, contractors and project progress.
5. Generate dashboards and reports for procurement monitoring.
6. Improve accountability through searchable procurement records.

## 3. Analytical procedures (tech stack)

The project follows the Software Development Life Cycle (SDLC): requirements gathering, system design, implementation, testing and deployment.

The proposal originally listed a generic teaching stack (HTML/CSS/JS, Node/Express or ASP.NET, PostgreSQL or SQL Server). The **chosen implementation stack** is recorded in [02-software-solution.md](./02-software-solution.md):

| Area | Chosen stack |
| --- | --- |
| Internal & external mobile | React Native + Expo |
| Web dashboard | Next.js |
| Backend | Supabase (Postgres, Auth, RLS, Storage, Realtime, Edge Functions) |
| AI & notifications | Node.js services wrapping LLM / OCR / push / email |
| Version control | Git and GitHub |
| Testing | Functional, usability and security testing |

## 4. Scientific contribution

This project demonstrates how artificial intelligence and web technologies can improve procurement management and public transparency. It contributes a conceptual model for combining AI-assisted document analysis with procurement tracking and an open-data portal, helping decision-makers process complex tender information more efficiently while promoting accountability and public trust.
