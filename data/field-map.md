# Project Import — Field Map

How the project importer turns source rows into **draft** CMS Projects. The current source is
an Excel workbook; the **same pipeline** reads from the ERP later via a source-adapter swap
(`IMPORT_SOURCE=erp`) — the "Future ERP field" column below is the contract for that work.

The importer is an operational tool run locally by Hermes/admin. The workbook is **gitignored**
(`./data/`), and only **web-safe** fields are ever written to the CMS.

---

## 1. Imported fields (web-safe only)

| Excel column (`Client List`) | Canonical field | CMS Projects field | Future ERP field | Notes |
|---|---|---|---|---|
| `Client` | `clientName` (internal) | _not stored on the site_ | `customer.name` | Used only for de-dup + the gitignored crosswalk. Written to CMS **only** if `clientPublic = true` (MD-approved). |
| — (derived) | `title` | `name` | — | Anonymized label, e.g. `Electrical EPC project (2024)`. Never contains the client name while `clientPublic = false`. |
| — (constant) | `clientPublic = false` | `clientPublic` | — | Anonymized until the MD approves naming. |
| — (constant) | `sector = "TODO"` | `sector` (left blank) + `needsSectorReview = true` | `job.sector` | Sector is **not** in the data — never guessed. Flagged for Hermes/MD. |
| `Service Lines` | `services[]` + `proposedServices[]` | `services` (relationship) + `importNotes` | `job.serviceLines[]` | Mapped via the taxonomy in §3. |
| `Last Activity` / `Last FY`, plus `Quotations & Jobs` won/billed dates | `year` | `year` | `job.completedAt` | Latest won/billed year wins; non-financial. |
| `Category` | `category` | `importNotes` (hint) | `customer.industry` | Non-identifying industry hint to help assign the sector. |
| — (computed) | `importKey` | `importKey` (indexed) | hash of `customer.id` | Opaque SHA-256 prefix of the client name; stable de-dup key. |
| — (constant) | `source` | `importSource` | `"erp"` | Which adapter produced the draft. |
| — | `status = draft` | `_status = "draft"` | — | Always a draft; the importer never publishes. |

### Left blank for Hermes (narratives — NOT generated here)
`summary`, `challenge`, `solution`, `outcome`, `scaleNote`, `gallery`. Hermes writes the
narrative from real project data after a draft is approved.

## 2. NEVER imported (sensitive — stays in the workbook)

`Contact Person`, `Contact Number`, `Address`, `Win Rate`, `Quoted Value (BDT)`,
`Won Value (BDT)`, `Billed Value (BDT)`, `Opportunity / Follow-up` (pipeline notes),
`Folder Path`, and every `Source File Path` / `Value (BDT)` in `Quotations & Jobs`. These are
never written to the CMS, the site, or any committed file (including the import report).

## 3. Service taxonomy

| Source keyword(s) in `Service Lines` | Canonical service |
|---|---|
| Solar, Renewable, PV | **Solar & Energy** (`solar-energy`) |
| MEP, Electrical works, Generator, Transformer, Substation, Panel, Switchgear, Cable, Busbar/BBT | **Electrical EPC** (`electrical-epc`) |
| LPS, Lightning protection, Earthing, Earth Pit | **Grounding & Lightning Protection** (`grounding-lightning-protection`) |
| Lighting, Fan | **Smart Systems** (`smart-systems`) |
| IR & ER Testing, Thermal/Thermography, Inspection, Audit, Consultancy, Fire/Safety | **Testing, Inspection & Consultancy** — _NEW; flag for MD (may become a 5th service)_ |

The four canonical services are linked as a real relationship. The NEW category has no Service
document yet, so it is recorded in the draft's **Import metadata → notes** and surfaced in the
import report for the MD to decide.

## 4. Eligibility (won / completed only)

A client is **included** only if `Status == "Client — Work Won"` **or** `Jobs Won (PO) > 0`
**or** `Bills > 0`, and is **never** included if its status is a non-won stage:
`Lead — Not Yet Quoted`, `Quoted — Pending WO`, or `Engaged — No Formal Quote on File`
(the hard exclusion wins). Eligible clients are de-duplicated by client.

## 5. Switching to the ERP later

Implement `lib/import/erp-adapter.ts` against the same `ProjectSource` interface, emitting
`CanonicalProject` records with the same eligibility + field rules, then set `IMPORT_SOURCE=erp`.
No other code changes. The ERP is reached only by Hermes' importer on the ops tier — the web
tier holds no ERP credentials.
