# Product Ratings & Review Analytics Dashboard

A full-stack dashboard for analysing Amazon product ratings and reviews.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL |
| Frontend | React · TypeScript · MUI v5 |
| State | Redux Toolkit |
| Charts | Recharts |
| File Import | multer · xlsx |

---

## Features

- **File Import**: Upload `.xlsx`, `.xls`, or `.csv` — drag-and-drop or browse
- **Analytics Overview**
  - Summary cards: total products, avg rating, avg discount, total reviews
  - Bar chart: Products per Category
  - Bar chart: Top 10 Reviewed Products (horizontal)
  - Histogram: Discount % Distribution
  - Bar chart: Category-wise Average Rating
- **Products Table**
  - Server-side pagination
  - Search by product name (debounced)
  - Filter by main category
  - Filter by rating range (slider)
  - Columns: Name · Category · Price · MRP · Discount · Rating · Reviews · Review Title

---

## Quick Start

### Option 1: Docker Compose (recommended)

```bash
docker-compose up --build
```

- Frontend → http://localhost:3000  
- Backend API → http://localhost:4000  

### Option 2: Manual

**Prerequisites**: Node.js 18+, PostgreSQL 14+

#### 1. Database

```sql
CREATE DATABASE product_analytics;
```

#### 2. Backend

```bash
cd backend
cp .env.example .env        # edit DB credentials if needed
npm install
npm run dev                  # starts on :4000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm start                    # starts on :3000
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/import` | Upload Excel/CSV (multipart `file`) |
| GET | `/api/products` | Paginated product list |
| GET | `/api/categories` | List of categories with counts |
| GET | `/api/analytics` | All chart data + summary |

### GET `/api/products` Query Params

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | — | Product name search |
| category | string | — | Filter by main category |
| minRating | number | 0 | Min rating filter |
| maxRating | number | 5 | Max rating filter |

---

## Dataset Format

The Excel file must have these columns (row 1 = headers):

| Column | Description |
|---|---|
| product_id | Unique ID |
| product_name | Full product name |
| category | Pipe-separated category path |
| discounted_price | Sale price (supports ₹ prefix) |
| actual_price | MRP |
| discount_percentage | e.g. 0.64 or 64% |
| rating | Numeric (0–5) |
| rating_count | Number of reviews |
| about_product | Product description |
| user_name | Reviewer names (comma-separated) |
| review_title | Review titles |
| review_content | Review text |

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── db/index.ts           # PostgreSQL pool + schema init
│   │   ├── routes/index.ts       # Route definitions + multer
│   │   └── controllers/
│   │       └── productController.ts  # All business logic
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/index.ts          # Axios API calls
│   │   ├── store/index.ts        # Redux slices
│   │   ├── types/index.ts        # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── Charts.tsx        # All 4 Recharts charts
│   │   │   ├── Filters.tsx
│   │   │   └── ProductsTable.tsx
│   │   ├── pages/Dashboard.tsx
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
