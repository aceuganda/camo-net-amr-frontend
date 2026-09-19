# AMRDB — A Guided Walkthrough

8 slides. Figures read live from `https://amrdb.idi.co.ug/serve/api/v1` on 31 July 2026.

---

## Slide 1 — Introduction

### One door to Uganda's AMR data

AMRDB is the public interface to a central AMR data warehouse. It turns curated
surveillance and clinical datasets into something a researcher can find, understand,
request, and download — with the governance that sensitive health data requires.

**Who it serves**

| Audience | What they get |
|---|---|
| Researchers | Find curated datasets and request access for analysis |
| Clinicians | Read local resistance patterns to inform treatment |
| Policymakers | See national trends as evidence for interventions |
| Students | Learn on real data; publish models to the platform |

`amrdb.idi.co.ug` · Infectious Diseases Institute, Makerere University ·
CAMO-Net (226692/Z/22/Z), Wellcome Trust, Fleming Fund, MoH Uganda

---

## Slide 2 — Architecture

### A thin, governed layer over the data warehouse

The portal never holds the raw data. It reads from the warehouse through an API that
enforces who may see what, so access control lives in one place instead of in every screen.

```
AMR data warehouse
  Regional referral hospitals, microbiology labs, REDCap study collection
        ↓
Serve API — authentication, permissions, aggregation
  JWT sessions, role-based access, per-variable permissions, trend queries
        ↓
AMRDB web portal
  Catalogue, maps and trends, access requests, review, admin, models
```

**Four roles, one portal.** What you see is decided by your role. Visitors browse the
catalogue and trends; registered users request and download; referees validate datasets
they are assigned; admins approve requests, manage users and publish datasets.

**Built with:** Next.js 16 · React 19 · TypeScript · TanStack Query · Tailwind ·
Leaflet · Chart.js · Sentry · Docker / Kubernetes

> Every dataset ships under CC BY-NC 4.0 with anonymisation applied upstream — the
> portal's job is controlled distribution, not de-identification.

---

## Slide 3 — Walkthrough

### Start on the map, not on a login screen

The landing page answers the first question a visitor has — where is resistance
happening — before asking anything of them.

**What's on the home page**

1. **Choropleth of Uganda.** Resistant cases shaded across the nine regional referral
   hospitals; hover a facility for its count.
2. **Pathogen and antibiotic selectors.** Pick an organism and a drug to repaint the map
   for that pairing.
3. **Trend charts.** Resistance over time, by sex, by age band, by organism — drawn live
   from the warehouse.
4. **Direct route to the catalogue.** One button from "interesting pattern" to "the
   dataset behind it".

**Why it matters.** These views are open — no account needed. A clinician can check a
local resistance pattern in seconds, and a policymaker gets a national picture without
downloading anything. The guided tour is one click away in the navigation bar.

> The map reads the same warehouse the datasets come from, so what you see published and
> what you can request are always the same numbers.

---

## Slide 4 — Walkthrough

### Judge a dataset before you ask for it

The catalogue lists everything in the warehouse. Each entry opens a full dataset card so
the decision to request access is an informed one.

**Catalogue.** A searchable, filterable table — by organism, antibiotic, source, period
and region. The whole catalogue exports to file, and every dataset has a shareable link
you can cite or send to a colleague.

**Dataset card.** Title, acronym, protocol and ethics IDs, study design, collection
method, countries, period, record count, licence and DOI — plus who to cite.

| Panel | What it holds |
|---|---|
| Datasheet | The structured "datasheet for datasets" questionnaire: motivation, composition, collection, uses and limitations, answered by the data owner |
| Credibility panel | A quality score with the reasoning behind it, so users can weigh one source against another |
| Variables grid | Every column with its definition and type — you know exactly what you'd be receiving |
| Linked publications | Papers already produced from the dataset, so prior work is visible up front |

---

## Slide 5 — Walkthrough

### Access is a workflow, not a download button

Controlled data moves only after a request has been justified, agreed to and approved —
and every step is visible to the person who made it.

**The request path**

1. **Select variables.** Request only the columns the work needs, not the whole table.
2. **State the purpose.** Research justification and intended use are part of the submission.
3. **Sign the agreement.** Confidentiality terms and the data sharing policy are accepted in-flow.
4. **Admin decision.** Approved, denied, or returned — with the status on your dashboard throughout.
5. **Download.** Filtered to the approved variables; re-requests and downloads are counted.

**Oversight around it**

- **Referee review** — assigned domain experts validate a dataset and its datasheet before
  it is trusted in the catalogue.
- **Admin console** — requests, users and roles, dataset editing and publishing, model
  management, and an overview of activity by date range.
- **External submissions** — outside researchers can offer their own AMR datasets for
  processing and inclusion in the warehouse.

---

## Slide 6 — Walkthrough

### What gets built on top

The portal closes the loop: data goes out, and the outputs come back to the same place.

- **Publications library** — papers produced from the warehouse, with authors and links
  out to the journal, tied back to the datasets that produced them.
- **Hosted ML models** — pre-trained models from students and researchers, published
  against a dataset. Enter values in the generated form and get a prediction in the browser.
- **Your profile** — affiliation and research interests, your access requests and their
  status, granted permissions and download history in one place.
- **Guide & tour** — a written guide plus an interactive tour that walks new users through
  the navigation, catalogue filters and access table.

> Models are the clearest capacity-building signal on the platform — a student's work
> becomes something a clinician can run, rather than a file that stops at a thesis.

---

## Slide 7 — Where the platform stands

### Current standing

Live figures from the production warehouse, read on 31 July 2026.

| Datasets | Records | Resistant cases | Hospitals | Publications |
|---:|---:|---:|---:|---:|
| **5** | **31,575** | **25,014** | **9** | **8** |
| All curated and in the warehouse | Across the five datasets | Indexed, 2020–2025 | Regional referral, mapped | Listed from this data |

**Resistant cases indexed by year**

| Year | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---:|---:|---:|---:|---:|
| Cases | 2,264 | 6,407 | 2,947 | 7,224 | 1,546 | 4,626 |

Counts reflect what is currently loaded and curated in the warehouse, not disease
incidence. The 2024 dip follows the close of the Fleming II collection period, before the
DARING study began contributing in 2025.

**The catalogue today**

| Dataset | Period | Records | Status |
|---|---|---:|---|
| AMR Fleming II Human | Oct 2020 – Oct 2023 | 20,062 | Closed |
| Antimicrobial Use Fleming II | Oct 2020 – Oct 2023 | 8,992 | Closed |
| DARING Data | Jul – Dec 2025 | 1,913 | Ongoing |
| Clinical outcomes | Mar 2023 – Mar 2024 | 599 | Active |
| Economic data in clinical outcomes | Mar 2023 – Mar 2024 | 9 | Active |

Coverage October 2020 – December 2025. Every dataset is licensed CC BY-NC 4.0.

---

## Slide 8 — Conclusion

*To be drawn from the publication.*

- The finding or claim the publication makes about the portal's contribution
- What the platform changes for AMR research and policy in Uganda
- Limitations acknowledged in the paper
- What comes next — data sources, partners, or capability
- Citation and acknowledgements
