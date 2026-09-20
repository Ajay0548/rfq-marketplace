# Mini B2B RFQ Marketplace

A full-stack, production-like **B2B RFQ (Request for Quotation) Marketplace** built with React, Vite, Node.js, Express, PostgreSQL, and Prisma ORM.

The platform streamlines corporate procurement by connecting **Buyers** who publish custom purchase requirements and **Suppliers** who review technical specifications and submit competitive commercial quotations.

---

## Architecture Diagram

```mermaid
graph TD
    Client["React 18 + Vite Frontend<br/>(React Router, Axios, CSS Modules)"]
    API["Express.js REST API Server<br/>(JWT Auth, RBAC Middleware, Validators)"]
    ORM["Prisma ORM Client"]
    DB[(PostgreSQL Database<br/>Users, RFQs, Quotations)]

    Client -->|"HTTP / REST API (Bearer JWT)"| API
    API -->|"Prisma Client Query Engine"| ORM
    ORM -->|"TCP Connection (Port 5432)"| DB
```

---

## Features

### Buyer Capabilities
* **Authentication & Session**: Secure registration and login as `BUYER` with password hashing (`bcryptjs`) and JWT session persistence.
* **Procurement Dashboard**: Real-time KPI cards displaying Total RFQs, Open RFQs, Closed/Expired RFQs, and Total Quotations Received.
* **Create RFQ**: Publish procurement requests with product/service name, technical description, quantity (`> 0`), delivery location, and mandatory future deadline.
* **RFQ Management ("My RFQs")**:
  * Filter and search across RFQ titles, specifications, and locations.
  * Live status tags (`OPEN` vs `CLOSED`).
  * Quotation counter for each RFQ.
  * Direct actions: **View Details**, **Edit Specifications**, **Delete RFQ** (with cascade deletion), and **View Quotations**.
* **Review Supplier Quotations**:
  * View all submitted proposals for an owned RFQ.
  * Ranked by best (lowest) quoted price.
  * Displays supplier name, quoted price, estimated delivery timeframe, unit price estimation, and commercial notes.
  * Automatic protection: other users cannot access another buyer's quotes.

### Supplier Capabilities
* **Authentication & Session**: Secure registration and login as `SUPPLIER`.
* **Bidding Dashboard**: Track submitted quotations, active marketplace opportunities, and total commercial value quoted.
* **Marketplace RFQ Browsing**:
  * Search live opportunities by keywords across product name, description, and location.
  * Filter by delivery destination and status (`OPEN` by default; closed RFQs are excluded from the default view).
* **RFQ Details & Quotation Submission**:
  * Inspect complete requirement specifications, quantities, location, and buyer details.
  * Submit commercial quotation with total price (`> 0`), estimated delivery time, and optional notes.
  * **Duplicate Prevention**: Database and backend logic enforce that a supplier can only submit **one quotation per RFQ** (`unique(rfqId, supplierId)`).
  * **Automatic Deadline Protection**: If an RFQ has passed its deadline or is marked closed, the submission form is disabled and replaced with `"Quotations are closed for this RFQ."`
* **"My Quotations"**: Track history of all submitted proposals, current status of each RFQ, price, and delivery commitments.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), React Router v6, Axios, Lucide React (SVG icons), Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv` |
| **Database & ORM** | PostgreSQL 16, Prisma ORM v5 (`@prisma/client`, `prisma`) |
| **Environment** | Cross-platform (Windows / macOS / Linux), Git version control |

---

## Database Schema & Relationships

The database utilizes PostgreSQL with strict relational constraints managed by Prisma ORM.

```prisma
enum Role {
  BUYER
  SUPPLIER
}

enum RFQStatus {
  OPEN
  CLOSED
}

model User {
  id           Int         @id @default(autoincrement())
  name         String
  email        String      @unique
  passwordHash String
  role         Role
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  rfqs         RFQ[]
  quotations   Quotation[]

  @@map("users")
}

model RFQ {
  id               Int         @id @default(autoincrement())
  buyerId          Int
  buyer            User        @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  productName      String
  description      String
  quantity         Int
  deliveryLocation String
  deadline         DateTime
  status           RFQStatus   @default(OPEN)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  quotations       Quotation[]

  @@index([buyerId])
  @@index([status])
  @@index([deadline])
  @@map("rfqs")
}

model Quotation {
  id                Int      @id @default(autoincrement())
  rfqId             Int
  rfq               RFQ      @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  supplierId        Int
  supplier          User     @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  quotedPrice       Float
  estimatedDelivery String
  message           String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([rfqId, supplierId]) // Enforces single quotation per supplier per RFQ
  @@index([supplierId])
  @@index([rfqId])
  @@map("quotations")
}
```

### Relational Integrity
1. **User (BUYER) $\rightarrow$ RFQ (1-to-many)**: Each RFQ is strictly owned by a registered buyer.
2. **RFQ $\rightarrow$ Quotation (1-to-many)**: An RFQ can receive multiple quotes from different suppliers. Deleting an RFQ cascades to delete all associated quotations.
3. **User (SUPPLIER) $\rightarrow$ Quotation (1-to-many)**: A supplier can submit quotes across different RFQs.
4. **`@@unique([rfqId, supplierId])`**: Compound unique constraint guaranteeing that no supplier can submit multiple competing quotes for the same RFQ.

---

## Authentication & Authorization

* **Password Security**: Passwords are never stored in plain text. Salted bcrypt hashes (10 rounds) are computed during registration.
* **Token-Based Sessions**: Successful logins return a signed JWT valid for 24 hours containing user `id`, `email`, and `role`.
* **Data Sanitization**: The server never returns `passwordHash` in any user response.
* **Backend Authorization Middleware**:
  * `authenticateToken`: Validates incoming `Authorization: Bearer <token>` headers.
  * `authorizeRole('BUYER')`: Restricts RFQ creation, editing, and quote viewing strictly to buyers.
  * `authorizeRole('SUPPLIER')`: Restricts quotation submissions and quote listings strictly to suppliers.
  * **Ownership Check**: Buyers can only edit or delete RFQs where `rfq.buyerId === req.user.id`.

---

## REST API Specification

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new `BUYER` or `SUPPLIER` |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### RFQ Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rfqs` | Public / Supplier | Browse open RFQs with search & location filters |
| `GET` | `/api/rfqs/:id` | Authenticated | Get full details of an RFQ |
| `POST` | `/api/rfqs` | `BUYER` only | Create a new RFQ (validates future deadline) |
| `PUT` | `/api/rfqs/:id` | `BUYER` (Owner) | Update an existing RFQ |
| `DELETE` | `/api/rfqs/:id` | `BUYER` (Owner) | Delete an RFQ and associated quotes |
| `GET` | `/api/rfqs/:id/quotations` | `BUYER` (Owner) | View quotations submitted for buyer's RFQ |
| `POST` | `/api/rfqs/:rfqId/quotations` | `SUPPLIER` only | Submit quotation (validates price & deadline) |

### Dashboard Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/buyer/rfqs` | `BUYER` only | Retrieve all RFQs owned by current buyer |
| `GET` | `/api/buyer/dashboard` | `BUYER` only | Metrics (Total, Open, Closed RFQs, Quotes count) |
| `GET` | `/api/supplier/quotations` | `SUPPLIER` only | Retrieve all quotes submitted by supplier |
| `GET` | `/api/supplier/dashboard` | `SUPPLIER` only | Metrics (Quotes count, Active RFQs, Quoted value) |
| `GET` | `/api/health` | Public | Server health status check |

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rfq_marketplace?schema=public"
JWT_SECRET="your_secure_jwt_secret_key_here"
CLIENT_URL="http://localhost:5173"
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Development Setup

### Prerequisites
* **Node.js**: v18 or higher (Node v20+ recommended)
* **npm**: v9 or higher
* **PostgreSQL**: PostgreSQL 14+ running locally on port 5432, or use the provided portable script.

### 1. Clone Repository
```bash
git clone https://github.com/Ajay0548/rfq-marketplace.git
cd rfq-marketplace
```

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment file
cp .env.example .env

# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed sample data (demo users, RFQs, quotes)
npm run prisma:seed

# Start backend development server
npm run dev
```
The server runs on **http://localhost:5000**.

*(Note: On Windows systems without a global PostgreSQL service, run `npm run db:setup` to bootstrap the portable PostgreSQL instance automatically).*

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install

# Copy environment file
cp .env.example .env

# Start Vite dev server
npm run dev
```
The client runs on **http://localhost:5173**.

---

## Demo & Testing Credentials

The seed script (`server/prisma/seed.js`) populates the database with pre-configured accounts:

| Role | Email | Password | Description |
|---|---|---|---|
| **BUYER** | `buyer@example.com` | `Buyer@123` | Demo Buyer with active & closed RFQs |
| **SUPPLIER** | `supplier@example.com` | `Supplier@123` | Demo Supplier with active submitted quotes |
| **SUPPLIER** | `supplier2@example.com` | `Supplier@123` | Competing Supplier account |

> **Evaluator Tip**: The login page includes one-click **"Demo Buyer"** and **"Demo Supplier"** buttons to auto-populate credentials for instant testing.

---

## Production Deployment Guide

### 1. Database (Neon / Supabase / Railway)
1. Create a managed PostgreSQL database.
2. Retrieve the pooled or direct connection string (`DATABASE_URL`).

### 2. Backend (Render / Railway)
1. Deploy from the repository with the root directory set to `server/`.
2. Build Command: `npm install && npx prisma generate && npx prisma db push`
3. Start Command: `node src/server.js`
4. Configure Environment Variables:
   * `PORT`: `5000` (or dynamic port provided by host)
   * `DATABASE_URL`: Your managed PostgreSQL URL
   * `JWT_SECRET`: A cryptographically secure random string
   * `CLIENT_URL`: `https://rfq-marketplace-tawny.vercel.app`

### 3. Frontend (Vercel)
1. Import the repository into Vercel.
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variable:
   * `VITE_API_URL`: `https://rfq-marketplace-rho3.onrender.com/api`

---

## Live URLs & Links
* **Live Application**:  `https://rfq-marketplace-tawny.vercel.app`
* **GitHub Repository**: `https://github.com/Ajay0548/rfq-marketplace`

---

## Assumptions & Design Trade-offs
1. **RFQ Expiration Logic**: An RFQ is considered `CLOSED` either if its database status is explicitly set to `CLOSED` or if `new Date(deadline) < new Date()`. The backend computes and validates this on every query and mutation.
2. **Quotation Pricing**: Quoted price is stored as a numerical float (representing Indian Rupees ₹ or user currency) and represents the total value for the requested quantity.
3. **Single Quote Policy**: Each supplier is permitted one quotation per RFQ to prevent duplicate submissions.

---

## Limitations (Intentionally Excluded)
* **Real-time WebSockets**: Kept as clean REST API endpoints per assignment requirements; no unnecessary WebSocket or polling overhead.
* **Payment Processing**: Sourcing and quotation bidding are completed on-platform; contract settlement and invoicing are handled out-of-band by enterprise ERPs.
* **File Uploads for Drawings**: Technical specifications are stored cleanly in the description text field rather than requiring S3 / Cloudinary configurations.
