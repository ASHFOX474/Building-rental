# Building Rental Management (মনি লজ)

A two-part system for a single residential building — **মনি লজ (Moni Lodge)**, Noakhali:

1. **Public To-Let Showcase** — Bangla, no login. Hand-drawn building view → floor blueprint → room-by-room photos/videos (Google Drive) + rent details.
2. **Owner Admin Panel** — elderly-friendly, 4-digit PIN. Rent ledger & income, To-Let switch + Drive uploader, dynamic floors/flats.

Full specifications: [`docs/public_page_specification.txt`](docs/public_page_specification.txt) and [`docs/admin_panel_specification.txt`](docs/admin_panel_specification.txt).

## Tech Stack

| Layer    | Choice                                             |
| -------- | -------------------------------------------------- |
| Frontend | React + Vite (one app: public routes + `/admin`)   |
| Backend  | Node.js + Express                                  |
| Database | PostgreSQL                                         |
| Media    | Google Drive API v3 (OAuth2 refresh token)         |

## Folder Structure

```
.
├── docs/                    # Project specifications
├── database/
│   ├── migrations/          # SQL schema (run in order)
│   └── seeds/               # Sample data (5 floors × 2 flats)
├── server/                  # Express API
│   └── src/
│       ├── config/          # env, db pool, Google Drive client
│       ├── routes/          # public + admin route definitions
│       ├── controllers/     # request handlers
│       ├── services/        # business logic (rent status, Drive upload)
│       ├── middleware/      # PIN auth, error handler, upload
│       └── db/              # query helpers
└── client/                  # React (Vite) frontend
    └── src/
        ├── api/             # fetch wrappers
        ├── assets/svg/      # roof, blueprint illustrations
        ├── components/      # shared UI (badges, buttons, lightbox)
        ├── lib/             # Bangla numerals / dates helpers
        ├── pages/public/    # Home, FloorMap, FlatDetails
        ├── pages/admin/     # PinLogin, Ledger, ToLet, Floors
        └── styles/          # Terracotta & Chuna theme variables
```

## Getting Started

```bash
# 1. Database
createdb building_rental
psql building_rental -f database/migrations/001_initial_schema.sql
psql building_rental -f database/seeds/001_sample_building.sql

# 2. Server
cd server && cp .env.example .env && npm install && npm run dev

# 3. Client
cd client && npm install && npm run dev
```
