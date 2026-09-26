# InGenius web app (prototype)

This is a responsive web prototype of InGenius, running on sample data. It has four persona views: loan officer, lender executive, recruiter, and account executive. It includes a Home page with widgets you can pick, Action items, a Kanban pipeline board (deals for loan officers and account executives, recruits for executives and recruiters), Reports dashboards, census-tract heat maps, Sankey charts for loan officer movement (Coming or Going) and loan retention, and the Genie AI assistant with briefings.

It is plain HTML, CSS, and JavaScript. There is no build step and nothing to install.

## Run it

```bash
npm start            # serves at http://localhost:8080 (uses python3 -m http.server)
# or just open index.html in a browser: it also works from file://
npm test             # headless smoke test across every persona, tab and report
```

## Click through the sample data

- **Switch persona:** click the avatar in the top right.
- **Deep links:** URL parameters jump straight to a view:
  - `index.html?persona=exec&tab=reports&report=flow` opens the lender executive's LO movement Sankey.
  - `index.html?persona=rec&tab=reports&report=map` opens the recruiter's Harris County tract map.
  - `index.html?persona=ae&tab=reports&report=accounts` opens the account executive's loyalty dashboard.
  - `persona`: `lo`, `exec`, `rec`, or `ae`
  - `tab`: `home`, `explore`, `actions`, `reports`, or `crm`
  - `report`: `map`, `flow`, or any `id` in `src/data/reports.js`
  - `compare=off`: simulates an org that hides other LOs' lender data
- **Customize Home:** use the Customize Home button to turn widgets on or off. Each persona starts with its own defaults in `HOME_DEFAULTS`. The LO movement widget opens the movement report.
- **Pipeline board:** drag a card to another stage, or open a card and use its move buttons. You can also switch to List or Activity, filter by priority or owner, or add a deal or recruit.
  - `index.html?persona=rec&tab=crm` opens the recruiter's board.
- **Genie:** the lamp button at the bottom right opens Genie. On a report, a bubble offers "I can summarize this for you!" with a Summarize button and a bell. Summarize opens the briefing in Genie. The bell (hover: "Turn off Summary Notifications") stops the bubble everywhere, and the Summary notifications switch in the Genie panel turns it back on. Briefings live only in Genie; each report shows a report panel beside its chart instead.
  - `index.html?persona=lo&tab=reports&report=retain` opens the LO's loan retention Sankey.
- **Below 768px** the same page switches to the phone layout. It is a breakpoint, not a separate app.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Page shell and the app template (`{{holes}}`, `<sc-if>`, `<sc-for>`) |
| `src/runtime.js` | Tiny renderer: fills the template from `renderVals()` and re-renders on `setState` |
| `src/app.js` | The app component: state, navigation, and every value the template reads |
| `src/main.js` | Boot, the breakpoint, and URL parameters |
| `src/data/personas.js` | **Sample data:** personas, home views, action items, Genie prompts |
| `src/data/reports.js` | **Sample data:** the report library for each persona (rows and columns) |
| `src/data/generators.js` | Seeded random helpers, so the sample data is identical on every load |
| `src/lib/table.js` | Cell formatting, Notion-style filter operators, per-report dashboard config |
| `src/lib/map.js` | Heat map measures, persona defaults, sample values, fifths, map briefings |
| `src/lib/flow.js` | LO movement sample moves and movement briefings |
| `src/lib/sankey.js` | Multi-column Sankey layout, loan retention sample data (`RETAIN`) and retention briefings |
| `src/data/pipeline.js` | **Sample data:** pipeline deals and recruits per persona, stages, team, and Home widget defaults |
| `src/ui/styles.css` | Base styles plus the InGenius design-system component classes |
| `src/ui/style-tokens.js` | Shared inline style tokens (navy `#24285D`, orange `#F89624`, fonts) |
| `assets/data/ig-geo.js` | Pre-projected SVG boundaries: US states, all counties, TX and AZ census tracts |
| `tools/build-geo.py` | Rebuilds `ig-geo.js` from the source boundary files |
| `tests/smoke.test.js` | Node smoke test with no dependencies |

## Replacing sample data with real data

Every screen reads plain JavaScript objects, so moving to an API means changing what fills those objects. The rendering code stays the same.

- **Reports:** each entry in `REPORTS` is `{ id, label, desc, cols, data, ai }`. The `cols` describe the columns (`t` is the type: text, num, money, pct, pts, yrs, days, or trend). The `data` is the rows. The `ai` entries are the Genie suggestion pills and the filters they apply.
- **Heat map tables:** `mapTables()` in `src/lib/map.js` returns sample lenders and brokers, then loan officers, for the area on screen. Replace it with HMDA lender aggregates and NMLS loan officer data for that GEOID.
- **Heat map:** `mapValue()` in `src/lib/map.js` returns a sample value for each area. Replace it with a lookup by GEOID, using ACS 5-year estimates or HMDA aggregates.
- **LO movement:** `flowMoves()` in `src/lib/flow.js` returns `{ name, from, to, m, units, tenure, window }` records. In production these come from NMLS license changes.
- **Pipeline:** each item in `PIPELINES` is `{ id, name, sub, value, stage, pri, owner, date, days, tag, nextStep }`. A move calls `pipeMove()` in `src/app.js`, which is where you would write the new stage back to the CRM.
- **Loan retention:** `RETAIN` holds borrower counts for each cohort, split by what happened to the home and who made the next loan. In production this comes from matching past loans to later deed and mortgage records.
- **Genie briefings:** `mapBrief()`, `tableBrief()`, and `flowBrief()` build every sentence from the data on screen, so the numbers always match. Swap them for an LLM call that is given the same numbers. Keep the "numbers checked" step: compare each figure in the response against the data before showing it.

## Map boundaries

- States and counties come from [us-atlas](https://github.com/topojson/us-atlas) v3. It is ISC licensed and derived from the Census Bureau's cartographic boundary files.
- Census tracts are the 2010 TIGER tracts for Texas and Arizona. The copy used is [arcee123/GIS_GEOJSON_CENSUS_TRACTS](https://github.com/arcee123/GIS_GEOJSON_CENSUS_TRACTS).
- `tools/build-geo.py` simplifies and projects the boundaries into SVG paths. It needs `shapely`.
- To cover every state, feed it the 2020 `cb_2023_<state>_tract_500k` files from census.gov. For all 50 states you will probably want to load one state per file on demand instead of a single bundle.

## Notes for moving to a production stack

The template and component pattern maps directly onto React or Vue:
- Each `{{hole}}` is a prop.
- Each `<sc-for>` is a `.map()`.
- Each `<sc-if>` is a conditional.
- `renderVals()` is the render function.

The design tokens come from the InGenius design system: navy `#24285D`, orange `#F89624` (never used as text on white), Montserrat for headings, and IBM Plex Sans for text.

## Deploy

There is no build step. Any static host serves the repo root as is. On Vercel, import the repo with the "Other" preset and leave the build command and output directory empty. Static files live in `assets/`, not `public/`, because Vercel would serve only a `public/` folder and skip `index.html`.
