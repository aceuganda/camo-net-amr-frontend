// Dev-only fixtures for the flat-export endpoints. Loaded only when
// NEXT_PUBLIC_EXPORT_MOCKS=1 outside production (see USE_EXPORT_MOCKS).
// Shapes follow the export API contract; values are synthetic.
import type {
  ColumnKind,
  ColumnProfile,
  DownloadRequest,
  DownloadResult,
  ExportOptions,
  ExportProfile,
  FlatProfile,
} from "@/types/exports";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deterministic pseudo-random numbers so fixtures are stable between renders.
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const slugFor = (source: string) =>
  source === "flemming data"
    ? "flemming"
    : source === "patient outcomes data"
      ? "outcomes"
      : source === "daring_data"
        ? "daring"
        : source;

const SECTIONS: [string, string][] = [
  ["waste", "Waste cost"],
  ["drugs", "Drug cost"],
  ["staff", "Staff time"],
];

export const mockOptions = async (source: string): Promise<ExportOptions> => {
  await delay(300);
  const slug = slugFor(source);
  const extras = ["catalogue.xlsx", "data_dictionary.xlsx"];
  if (source === "economic") {
    return {
      source,
      slug,
      available: true,
      description: "One CSV with a section per cost type, each with its own header row.",
      files: ["economic_data.csv", ...extras],
      row_count: null,
      patient_count: null,
      visit_count: null,
      column_count: null,
      built_at: null,
      expected_bytes: 31_000,
    };
  }
  const built = source !== "daring_data";
  return {
    source,
    slug,
    available: built,
    description:
      "Each row is one record, not one visit. A visit with several records, such as repeated cultures or different diagnoses, appears on several rows, with the visit's details repeated on each.",
    files: built ? [`${slug}.csv`, ...extras] : [],
    row_count: built ? 48210 : null,
    patient_count: built ? 3120 : null,
    visit_count: built ? 3400 : null,
    column_count: built ? 61 : null,
    built_at: built ? "2026-09-20T10:14:03" : null,
    expected_bytes: built ? 4_700_000 : null,
  };
};

const base = (
  name: string,
  kind: ColumnKind,
  rows: number,
  rand: () => number,
  extra: Partial<ColumnProfile> = {}
): ColumnProfile => {
  const nullPct = kind === "identifier" ? 0 : Math.round(rand() ** 2 * 9000) / 100;
  const nullCount = Math.round((rows * nullPct) / 100);
  const [baseVar, occ] = (() => {
    const m = /^(.*)_(\d+)$/.exec(name);
    return m ? [m[1], Number(m[2])] : [name, null];
  })();
  return {
    name,
    label: baseVar.replace(/_/g, " "),
    description: rand() > 0.4 ? `Synthetic description for ${baseVar}.` : null,
    sql_type: "varchar",
    kind,
    base_variable: baseVar,
    occurrence: occ,
    non_null: rows - nullCount,
    null_count: nullCount,
    null_pct: nullPct,
    distinct: null,
    min: null,
    max: null,
    mean: null,
    stddev: null,
    quantiles: null,
    histogram: null,
    top_values: null,
    top_values_note: null,
    ...extra,
  };
};

const numeric = (name: string, rows: number, rand: () => number, lo = 0, hi = 98) => {
  const mean = lo + (hi - lo) * (0.35 + rand() * 0.3);
  const buckets = 16;
  const histogram = Array.from({ length: buckets }, (_, i) => {
    const x = lo + ((i + 0.5) * (hi - lo)) / buckets;
    const z = (x - mean) / ((hi - lo) / 5);
    return { x: Math.round(x * 10) / 10, count: Math.round(rows * 0.12 * Math.exp(-z * z / 2) + rand() * 40) };
  });
  const span = hi - lo;
  return base(name, "numeric", rows, rand, {
    sql_type: "double",
    distinct: Math.round(span),
    min: lo,
    max: hi,
    mean: Math.round(mean * 10) / 10,
    stddev: Math.round((span / 5) * 10) / 10,
    quantiles: {
      p05: Math.round(lo + span * 0.06),
      p25: Math.round(mean - span * 0.14),
      p50: Math.round(mean),
      p75: Math.round(mean + span * 0.14),
      p95: Math.round(hi - span * 0.08),
    },
    histogram,
  });
};

const categorical = (name: string, rows: number, rand: () => number, values: string[]) => {
  let remaining = rows * 0.95;
  const top_values = values.slice(0, 10).map((value) => {
    const count = Math.round(remaining * (0.25 + rand() * 0.35));
    remaining -= count;
    return { value, count };
  });
  const rare = values.length > 10 ? values.length - 10 : Math.round(rand() * 3);
  return base(name, values.length === 2 ? "boolean" : "categorical", rows, rand, {
    distinct: values.length + rare,
    top_values: top_values.sort((a, b) => b.count - a.count),
    top_values_note: rare > 0 ? `${rare} rare values withheld` : null,
  });
};

const temporal = (name: string, rows: number, rand: () => number) =>
  base(name, "temporal", rows, rand, {
    sql_type: "date",
    distinct: 700 + Math.round(rand() * 300),
    min: "2019-01-03",
    max: "2024-11-28",
  });

const ORGANISMS = ["E. coli", "K. pneumoniae", "S. aureus", "P. aeruginosa", "A. baumannii", "Enterococcus spp.", "Salmonella spp.", "Proteus spp.", "No growth", "Other", "Mixed growth", "Candida spp."];
const ANTIBIOTICS = ["Ceftriaxone", "Amoxicillin", "Metronidazole", "Gentamicin", "Ciprofloxacin", "Cotrimoxazole", "Ampicillin", "Azithromycin", "Meropenem", "Vancomycin"];
const DIAGNOSES = ["Malaria", "Pneumonia", "Sepsis", "UTI", "Gastroenteritis", "Meningitis", "HIV", "TB", "Anaemia", "Other"];

const buildColumns = (shape: "long" | "wide", rows: number, seed: number): ColumnProfile[] => {
  const rand = seeded(seed);
  const cols: ColumnProfile[] = [
    base("PatientID", "identifier", rows, rand, { distinct: 3120 }),
    base("VisitID", "identifier", rows, rand, { distinct: 3400 }),
    numeric("Age", rows, rand),
    categorical("Gender", rows, rand, ["F", "M"]),
    categorical("Facility", rows, rand, ["Mulago", "Mbarara RRH", "Gulu RRH", "Lira RRH", "Arua RRH", "Kabale RRH"]),
    temporal("AdmissionDate", rows, rand),
    temporal("DischargeDate", rows, rand),
    numeric("LengthOfStay", rows, rand, 0, 60),
    numeric("Weight", rows, rand, 2, 110),
    base("ClinicalNotes", "text", rows, rand, { distinct: rows - 20, top_values_note: "Free text; values not listed" }),
    categorical("Outcome", rows, rand, ["Discharged", "Died", "Referred", "Absconded"]),
  ];
  if (shape === "long") {
    cols.push(
      categorical("Organism", rows, rand, ORGANISMS),
      categorical("Antibiotic", rows, rand, ANTIBIOTICS),
      categorical("Diagnosis", rows, rand, DIAGNOSES),
      categorical("Susceptibility", rows, rand, ["S", "I", "R"]),
    );
    return cols;
  }
  for (let i = 1; i <= 12; i++) cols.push(categorical(`Diagnosis_${i}`, rows, rand, DIAGNOSES));
  for (let i = 1; i <= 8; i++) cols.push(categorical(`Organism_${i}`, rows, rand, ORGANISMS));
  for (let i = 1; i <= 40; i++) {
    cols.push(categorical(`Antibiotic_${i}`, rows, rand, ANTIBIOTICS));
    cols.push(categorical(`Susceptibility_${i}`, rows, rand, ["S", "I", "R"]));
    cols.push(numeric(`MIC_${i}`, rows, rand, 0, 64));
    cols.push(temporal(`PrescriptionDate_${i}`, rows, rand));
    cols.push(numeric(`Dose_${i}`, rows, rand, 50, 2000));
    cols.push(numeric(`Duration_${i}`, rows, rand, 1, 21));
    cols.push(categorical(`Route_${i}`, rows, rand, ["IV", "Oral", "IM"]));
    cols.push(categorical(`Frequency_${i}`, rows, rand, ["OD", "BD", "TDS", "QID"]));
    cols.push(categorical(`Indication_${i}`, rows, rand, ["Empiric", "Targeted", "Prophylaxis"]));
  }
  // Occurrence columns thin out: later ones are mostly empty.
  return cols.map((c) =>
    c.occurrence && c.occurrence > 3
      ? { ...c, null_pct: Math.min(99.9, 60 + c.occurrence), null_count: Math.round(rows * (0.6 + c.occurrence / 100)) }
      : c
  );
};

// Per-session counter so the profile shows the "pending" state first.
const fetchCounts = new Map<string, number>();

export const mockProfile = async (source: string): Promise<ExportProfile> => {
  await delay(500);
  const slug = slugFor(source);
  const n = (fetchCounts.get(source) ?? 0) + 1;
  fetchCounts.set(source, n);

  const common = { source, slug, min_cell_count: 5 };

  if (source === "daring_data") {
    return { ...common, status: "unavailable", message: "The export files of this dataset have not been built yet.", flats: [] };
  }
  if (n < 2) {
    return { ...common, status: "pending", message: null, flats: [] };
  }

  let flats: FlatProfile[];
  if (source === "economic") {
    flats = SECTIONS.map(([section, title], i) => ({
      table: `flat_economic_${section}`,
      file: `economic_${section}.csv`,
      section,
      section_title: title,
      row_count: 1200 + i * 400,
      computed_at: "2026-09-20T10:15:00",
      columns: buildColumns("long", 1200 + i * 400, 7 + i).slice(0, 9 + i * 2),
    }));
  } else {
    flats = [
      {
        table: `flat_${slug}`,
        file: `${slug}.csv`,
        section: null,
        section_title: null,
        row_count: 48210,
        computed_at: "2026-09-20T10:15:00",
        columns: buildColumns("long", 48210, 42),
      },
    ];
  }
  return { ...common, status: "ready", message: null, flats };
};

export const mockDownload = async (req: DownloadRequest): Promise<DownloadResult> => {
  await delay(800);
  const slug = slugFor(req.source);
  const blob = new Blob(["mock export\n"], { type: "application/zip" });
  return { blob, filename: `${slug}.zip` };
};
