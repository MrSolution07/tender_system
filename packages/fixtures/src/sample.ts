import type {
  AiReviewStatus,
  AppRole,
  BidStatus,
  ProjectStatus,
  TenderStatus,
} from "@tender/shared";

export type SampleTender = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  budgetCents: number;
  status: TenderStatus;
  publishedAt: string | null;
  closingAt: string | null;
  requirements: { id: string; body: string; mandatory: boolean }[];
  documents: { id: string; fileName: string }[];
};

export type SampleReview = {
  id: string;
  tenderId: string;
  reviewStatus: AiReviewStatus;
  summary: string;
  model: string;
};

export type SampleAward = {
  id: string;
  tenderId: string;
  contractor: string;
  awardedAt: string;
  projectTitle: string;
  projectStatus: ProjectStatus;
  progressPercent: number;
  locationLabel: string;
  spend: { id: string; label: string; amountCents: number }[];
};

export type SampleEvaluation = {
  id: string;
  tenderId: string;
  contractor: string;
  score: number | null;
  comments: string;
  compliancePass: boolean | null;
};

export type SampleBid = {
  id: string;
  tenderId: string;
  contractor: string;
  status: BidStatus;
  amountCents: number;
  note: string;
};

export type DeskRole = Exclude<AppRole, "contractor">;

export const DESK_PEOPLE: Record<DeskRole, string> = {
  procurement_officer: "Thandi Mokoena",
  evaluator: "Johan Pietersen",
  super_admin: "Ayesha Khan",
};

export const CONTRACTOR_PREVIEW = {
  name: "Lerato Dlamini",
  company: "Umhlaba Civils",
};

export const EMPTY_CATEGORY = "Harbour works";

export const sampleTenders: SampleTender[] = [
  {
    id: "t-voortrekker",
    title: "Resurfacing of Voortrekker Road, phase 2",
    description:
      "Mill and replace the asphalt wearing course between Main Reef Road and Ontdekkers Road, including new road markings and pedestrian crossings at two schools.",
    category: "Roads",
    department: "City of Johannesburg Roads",
    budgetCents: 18_400_000_00,
    status: "published",
    publishedAt: "2026-09-08T08:00:00.000Z",
    closingAt: "2026-10-02T16:00:00.000Z",
    requirements: [
      { id: "r-1", body: "CIDB grading of 7 CE or higher.", mandatory: true },
      {
        id: "r-2",
        body: "Traffic accommodation plan for a live urban corridor.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-1", fileName: "voortrekker-specification.pdf" }],
  },
  {
    id: "t-clinic",
    title: "Clinic consumables for Gauteng district facilities",
    description:
      "Twelve-month supply of examination gloves, syringes, and wound dressings for 40 primary clinics. Deliveries monthly to a central store in Auckland Park.",
    category: "Health supplies",
    department: "Gauteng Department of Health",
    budgetCents: 6_250_000_00,
    status: "published",
    publishedAt: "2026-09-12T08:00:00.000Z",
    closingAt: "2026-10-20T16:00:00.000Z",
    requirements: [
      {
        id: "r-3",
        body: "SAHPRA-listed products with batch traceability.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-2", fileName: "clinic-schedule-of-goods.pdf" }],
  },
  {
    id: "t-furniture",
    title: "Learner desks and chairs for 18 schools",
    description:
      "Manufacture and deliver hardwood-substitute desks and chairs sized for grades 4 to 7. Installation included at each school.",
    category: "Furniture",
    department: "Western Cape Education",
    budgetCents: 4_800_000_00,
    status: "published",
    publishedAt: "2026-09-01T08:00:00.000Z",
    closingAt: "2026-11-15T16:00:00.000Z",
    requirements: [
      {
        id: "r-4",
        body: "SANS 660-compliant seating, five-year frame warranty.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-3", fileName: "furniture-drawings.pdf" }],
  },
  {
    id: "t-water",
    title: "Replacement of ageing water mains in KwaMashu",
    description:
      "Replace 6.4 km of asbestos-cement main with uPVC, reconnect household leads, and reinstate verges. Night work required on two arterial crossings.",
    category: "Water",
    department: "eThekwini Water and Sanitation",
    budgetCents: 22_100_000_00,
    status: "evaluating",
    publishedAt: "2026-07-14T08:00:00.000Z",
    closingAt: "2026-08-28T16:00:00.000Z",
    requirements: [
      {
        id: "r-5",
        body: "CIDB grading of 8 CE and a pipe-laying method statement.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-4", fileName: "kwamashu-scope.pdf" }],
  },
  {
    id: "t-hall",
    title: "New sheeting for the New Brighton community hall roof",
    description:
      "Strip the failed corrugated roof, replace truss bracing where rotten, and fit insulated sheeting with new gutters.",
    category: "Buildings",
    department: "Nelson Mandela Bay Municipality",
    budgetCents: 3_150_000_00,
    status: "awarded",
    publishedAt: "2026-04-02T08:00:00.000Z",
    closingAt: "2026-05-06T16:00:00.000Z",
    requirements: [
      {
        id: "r-6",
        body: "Registered roofing contractor with fall-protection plan.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-5", fileName: "hall-roof-spec.pdf" }],
  },
  {
    id: "t-library",
    title: "Fit-out of the Mangaung central library mezzanine",
    description:
      "Shelving, lighting, and a children’s reading corner on the new mezzanine. Work happened around a library that stayed open.",
    category: "Buildings",
    department: "Mangaung Metro",
    budgetCents: 2_640_000_00,
    status: "completed",
    publishedAt: "2025-11-03T08:00:00.000Z",
    closingAt: "2025-12-01T16:00:00.000Z",
    requirements: [
      {
        id: "r-7",
        body: "Interior contractor with public-building references.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-6", fileName: "library-fitout.pdf" }],
  },
  {
    id: "t-refuse",
    title: "Three rear-loading refuse compactors",
    description:
      "Supply and commission three 19 m³ rear loaders for the west depot, with a two-year maintenance plan.",
    category: "Fleet",
    department: "City of Tshwane",
    budgetCents: 9_900_000_00,
    status: "closed",
    publishedAt: "2026-08-04T08:00:00.000Z",
    closingAt: "2026-09-01T16:00:00.000Z",
    requirements: [
      {
        id: "r-8",
        body: "Vehicles must meet current NRTA axle limits.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-7", fileName: "compactor-spec.pdf" }],
  },
  {
    id: "t-network",
    title: "Core network refresh for the procurement floor",
    description:
      "Replace end-of-life switches on two floors and recertify the fibre uplinks. Draft only. Not yet published.",
    category: "Technology",
    department: "National Treasury",
    budgetCents: 1_850_000_00,
    status: "draft",
    publishedAt: null,
    closingAt: "2026-12-04T16:00:00.000Z",
    requirements: [
      {
        id: "r-9",
        body: "OEM or authorised partner for the named switch family.",
        mandatory: true,
      },
    ],
    documents: [{ id: "d-8", fileName: "network-draft.pdf" }],
  },
];

export const sampleReviews: SampleReview[] = [
  {
    id: "a-clinic",
    tenderId: "t-clinic",
    reviewStatus: "needs_review",
    summary:
      "The schedule lists examination gloves, syringes, and dressings. Closing date in the document reads 20 October 2026. A line about cold-chain vaccines appears in an appendix and may not belong in this tender.",
    model: "sample-extractor",
  },
  {
    id: "a-water",
    tenderId: "t-water",
    reviewStatus: "needs_review",
    summary:
      "Scope is 6.4 km of main replacement in KwaMashu. The document names night work at two crossings. No award recommendation is present.",
    model: "sample-extractor",
  },
  {
    id: "a-furniture",
    tenderId: "t-furniture",
    reviewStatus: "approved",
    summary:
      "Eighteen schools, grades 4 to 7, desks and chairs, installation included. Quantities match the schedule of goods.",
    model: "sample-extractor",
  },
];

export const sampleAwards: SampleAward[] = [
  {
    id: "aw-hall",
    tenderId: "t-hall",
    contractor: "Umhlaba Civils",
    awardedAt: "2026-06-18T10:00:00.000Z",
    projectTitle: "New Brighton community hall roof",
    projectStatus: "in_progress",
    progressPercent: 62,
    locationLabel: "New Brighton, Gqeberha",
    spend: [
      { id: "s-1", label: "Sheeting and gutters", amountCents: 1_420_000_00 },
      { id: "s-2", label: "Truss repairs", amountCents: 380_000_00 },
    ],
  },
  {
    id: "aw-library",
    tenderId: "t-library",
    contractor: "Cedar & Pine Furniture",
    awardedAt: "2026-01-20T10:00:00.000Z",
    projectTitle: "Mangaung library mezzanine",
    projectStatus: "completed",
    progressPercent: 100,
    locationLabel: "Bloemfontein",
    spend: [
      { id: "s-3", label: "Shelving", amountCents: 980_000_00 },
      { id: "s-4", label: "Lighting and reading corner", amountCents: 640_000_00 },
    ],
  },
];

export const sampleEvaluations: SampleEvaluation[] = [
  {
    id: "e-water-umhlaba",
    tenderId: "t-water",
    contractor: "Umhlaba Civils",
    score: null,
    comments: "",
    compliancePass: null,
  },
  {
    id: "e-water-lekker",
    tenderId: "t-water",
    contractor: "Lekker Asphalt (Pty) Ltd",
    score: 71,
    comments: "Method statement covers night work. Plant list is thin on compaction.",
    compliancePass: true,
  },
];

export const sampleBids: SampleBid[] = [
  {
    id: "b-clinic",
    tenderId: "t-clinic",
    contractor: CONTRACTOR_PREVIEW.company,
    status: "submitted",
    amountCents: 5_980_000_00,
    note: "Monthly delivery to the Auckland Park store.",
  },
  {
    id: "b-furniture",
    tenderId: "t-furniture",
    contractor: CONTRACTOR_PREVIEW.company,
    status: "draft",
    amountCents: 4_550_000_00,
    note: "",
  },
];

export function tenderById(id: string): SampleTender | undefined {
  return sampleTenders.find((tender) => tender.id === id);
}

export function documentById(
  id: string,
): { fileName: string; tenderTitle: string } | undefined {
  for (const tender of sampleTenders) {
    const document = tender.documents.find((item) => item.id === id);
    if (document) {
      return { fileName: document.fileName, tenderTitle: tender.title };
    }
  }
  return undefined;
}
