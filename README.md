# FH6 Data Entry

A community-driven web application for cataloging car parts and upgrade data for **Forza Horizon 6**. Contributors can document in-game upgrade effects, verify each other's entries, and bulk-import data via CSV.

**Live app:** `https://shanpapa.github.io/fh6-data-entry/`

---

## Features

- **Car catalog** — add cars with base stats (PI, power, weight, etc.) and metadata (class, drivetrain, country, DLC)
- **Parts database** — record upgrade parts with PI change, price, and all stat effects per category/subcategory
- **Delta & Actual input modes** — enter values as deltas directly, or enter the final in-game value and let the app calculate the delta automatically
- **Verified parts** — verifiers can mark entries as confirmed; verified parts are locked for regular contributors
- **Bulk import** — upload a filled-in CSV template to add dozens of parts at once
- **Clone structure** — copy a car's part skeleton (categories/subcategories/names, without effects) to a new car
- **Role-based access** — Contributor vs. Verifier roles with an admin panel for managing users
- **Descriptions** — maintainable help text and tooltips for upgrade categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| CSV Parsing | PapaParse |
| Deployment | GitHub Pages via GitHub Actions |
| Fonts | Barlow Condensed, Space Mono (Google Fonts) |

---

## Project Structure

```
fh6-data-entry/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD → GitHub Pages
├── src/
│   ├── App.jsx               # Entire application (all views & components)
│   ├── main.jsx              # React DOM entry point
│   ├── index.css             # Global styles & dark theme base
│   └── lib/
│       ├── supabase.js       # Supabase client initialisation
│       └── categories.js     # Game constants (classes, categories, effect fields)
├── index.html                # HTML shell
├── vite.config.js            # Vite config (base path: /fh6-data-entry/)
└── package.json
```

---

## Database Schema

### `cars`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| make | text | |
| model | text | |
| year | integer | |
| stock_class | text | D / C / B / A / S1 / S2 / R / X |
| stock_pi | integer | |
| stock_drivetrain | text | RWD / FWD / AWD |
| car_type | text | |
| country | text | |
| collection | text | |
| dlc_pack | text | |
| is_dlc | boolean | |
| base_stats | jsonb | See `CAR_STAT_FIELDS` in `categories.js` |
| verified | boolean | |
| added_by | uuid FK → auth.users | |
| created_at | timestamptz | |

### `car_parts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| car_id | uuid FK → cars | |
| category | text | Top-level upgrade shop category |
| subcategory | text | |
| name | text | Part name |
| is_stock | boolean | Stock / base part flag |
| pi_change | integer | |
| price_cr | integer | Price in Credits |
| effects | jsonb | Delta values keyed by `EFFECT_FIELDS` keys |
| verified | boolean | |
| added_by | uuid FK → auth.users | |
| created_at | timestamptz | |

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK = auth.users.id | |
| username | text | |
| role | text | `contributor` or `verifier` |
| created_at | timestamptz | |

### `descriptions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| key | text | e.g. `parts_engine`, `tune_suspension` |
| title | text | |
| body | text | |
| created_at | timestamptz | |

### RPC Functions
- `get_car_part_counts()` — returns `(car_id, total_parts, parts_with_effects)` for all cars in one query

---

## Game Data Constants (`src/lib/categories.js`)

### Classes
`D (100–400) → C (401–500) → B (501–600) → A (601–700) → S1 (701–800) → S2 (801–900) → R (901–998) → X (999+)`

### Upgrade Categories
| Category | Subcategories |
|---|---|
| Engine | Intake, Fuel System, Ignition, Exhaust, Turbo, Single Turbo, Twin Turbo, Centrifugal Supercharger, Positive Displacement Supercharger, Stock Engine Block, Displacement, Camshaft, Valves |
| Platform and Handling | Springs & Dampers, Front & Rear Anti-Roll Bars, Chassis Reinforcement, Weight Reduction |
| Drivetrain | Clutch, Transmission, Differential |
| Tires and Rims | Tire Compound, Front & Rear Tire Width, Rims, Front & Rear Track Width |
| Aero and Appearance | Front Bumper, Rear Bumper, Rear Wing, Hood, Side Skirts, Body Kit |
| Body Kits and Conversions | Engine Swap, Drivetrain Swap |

### Effect Fields (stored in `car_parts.effects`)
| Group | Fields |
|---|---|
| Performance | Speed, Handling, Acceleration, Launch, Braking, Off-Road |
| Car Stat | Power (HP), Torque (Nm), Weight (kg), Front Weight %, PWR (hp/kg), Displacement (L) |
| Braking Distance | 97 km/h, 161 km/h |
| Lateral Gs | @ 97 km/h, @ 193 km/h |
| Acceleration & Speed | 0–97s, 0–161s, Top Speed |
| Aerodynamics | Efficiency, Balance |
| Chassis | Mechanical Balance |
| Flags | `unlocks_tuning`, `unlock_type`, `compound_type` |

---

## Views

### Garage
Grid view of all cars with search (make/model/year), class/drivetrain filters, and sort options. Shows completion percentage per car (how many parts have effects filled in).

### Car Detail
Hierarchical part list grouped by Category → Subcategory. Supports filtering to show only incomplete parts, bulk-verify all parts, and quick-add categories/subcategories.

### Part Modal
Add or edit a single part. Supports:
- **Delta mode** — type the `+/-` value shown in the upgrade shop
- **Actual mode** — type the final stat value; delta is auto-calculated using the car's base stats. Displacement accepts cc values (auto-converts to L if > 100)
- Name autocomplete with effect pre-fill from existing matching parts

### Clone Modal
Copy the part skeleton (categories, subcategories, part names) from any other car. Effects are left empty so they can be filled in with Actual mode.

### Import (CSV Bulk Import)
1. Download the blank import template
2. Download the car lookup CSV (use VLOOKUP to get `car_id` values)
3. Upload your filled CSV — preview validates the first 10 rows
4. Click **Import** to batch insert in chunks of 100 rows

### Descriptions
CRUD interface for category/setting descriptions used as help text throughout the app.

### Admin Panel *(verifiers only)*
View all registered users, toggle role between Contributor and Verifier.

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase project with the schema above applied

### Local Development

```bash
# Install dependencies
npm install

# Create a local env file
cp .env.example .env.local
# Edit .env.local and set:
# VITE_SUPABASE_URL=https://<your-project>.supabase.co
# VITE_SUPABASE_KEY=<your-anon-key>

# Start the dev server
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build   # Output in /dist
npm run preview # Preview the production build locally
```

---

## Deployment

The app is deployed automatically to **GitHub Pages** on every push to `main`.

Required GitHub repository secrets:

| Secret | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_KEY` | Supabase anonymous API key |

The workflow file is at `.github/workflows/deploy.yml`.

---

## Role System

| Action | Contributor | Verifier |
|---|---|---|
| Add cars & parts | ✅ | ✅ |
| Edit own unverified parts | ✅ | ✅ |
| Edit any part | ❌ | ✅ |
| Verify parts | ❌ | ✅ |
| Manage users (Admin Panel) | ❌ | ✅ |

---

## Contributing

1. Sign up for an account in the app (email + password)
2. Ask a verifier to set your role to **Contributor** if needed
3. Use **Actual mode** for entering effects — it's less error-prone than Delta mode
4. Leave `is_stock` checked for the base/stock part in each subcategory
5. Bulk imports are useful for adding many parts at once; download the template first

---

## License

This project is an unofficial fan tool and is not affiliated with Playground Games or Xbox Game Studios.
