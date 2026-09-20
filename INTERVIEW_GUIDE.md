# Mini B2B RFQ Marketplace - Technical Interview Guide

This guide is designed to help you confidently explain every component of this codebase during technical interview rounds. It breaks down the architecture, design choices, security implementations, database constraints, and provides answers to likely technical questions.

---

## 1. System Architecture

The project follows a clean **Client-Server-Database** 3-tier architecture:

```text
React Frontend (Vite)
       │
       │  HTTP / REST (JSON with Bearer JWT)
       ▼
Express.js Backend (Node.js)
       │
       │  Prisma Query Engine (ORM)
       ▼
PostgreSQL Database
```

### 1.1 Frontend Architecture (`client/`)
* **State Management**: Lightweight `AuthContext` utilizing React Context API and `localStorage` to manage `user`, `token`, and `role`. Avoids unnecessary heavy dependencies like Redux for a 2-role marketplace.
* **API Layer**: Centralized Axios client (`src/api/client.js`) configured with:
  * **Request Interceptors**: Automatically injects `Authorization: Bearer <token>` into outgoing requests.
  * **Response Interceptors**: Catches `401 Unauthorized` responses and cleans expired sessions.
* **Routing**: React Router v6 with a reusable `<ProtectedRoute allowedRoles={['BUYER']}>` higher-order wrapper that prevents unauthorized views on the client.
* **Design System**: Modular CSS design system with CSS custom properties (variables) for consistent typography, badges, stat cards, and full tablet/mobile responsiveness without third-party CSS bloat.

### 1.2 Backend Architecture (`server/`)
* **Layered Separation of Concerns**:
  * **Routes (`src/routes/`)**: Mount endpoints and chain middleware.
  * **Middleware (`src/middleware/`)**: JWT verification, Role-Based Access Control (RBAC), and centralized error handling.
  * **Validators (`src/validators/`)**: Pure validation logic executed before any controller or database operation.
  * **Controllers (`src/controllers/`)**: Business logic, database interactions via Prisma, and HTTP response formatting.
  * **Services (`src/services/`)**: Helper routines (e.g. deadline checks, Prisma client singleton).
* **Centralized Error Handling**: Express error middleware intercepting operational errors, Prisma exceptions (e.g. `P2002` duplicate unique constraints), and returning consistent JSON payloads: `{ success: false, message: ... }`.

### 1.3 Database Architecture (`server/prisma/`)
* Relational PostgreSQL managed through **Prisma ORM**.
* Models: `User`, `RFQ`, and `Quotation`.
* Strict foreign keys with `onDelete: Cascade`.
* Unique compound constraint `@@unique([rfqId, supplierId])` to prevent duplicate quotation spam.

### 1.4 Request Flow Walkthrough
1. **User Action**: A Supplier clicks "Submit Quotation".
2. **Client Validation**: React form verifies `quotedPrice > 0` and `estimatedDelivery` is present.
3. **Axios Client**: Attaches Bearer JWT in headers and sends `POST /api/rfqs/1/quotations`.
4. **Express Middleware**:
   * `authenticateToken`: Decodes JWT using `JWT_SECRET`; extracts `{ id, email, role }` and attaches to `req.user`.
   * `authorizeRole('SUPPLIER')`: Checks `req.user.role === 'SUPPLIER'`. If not, halts with `403 Forbidden`.
   * `validateQuotation`: Sanitizes and validates numeric price and string delivery time.
5. **Controller Logic**:
   * Verifies RFQ exists in DB.
   * Checks `rfq.status === 'OPEN'` and `new Date(rfq.deadline) > new Date()`.
   * Checks for duplicate bid from this supplier.
6. **Database Execution**: Prisma executes SQL insert into `quotations`.
7. **Response**: HTTP `201 Created` returned with new quotation payload.

---

## 2. Authentication Deep-Dive

### 2.1 Registration Flow
* Endpoint: `POST /api/auth/register`
* Input: `{ name, email, password, role }`
* **Validation**: Email format regex, minimum 6-character password, role must be `BUYER` or `SUPPLIER`.
* **Duplicate Prevention**: Database checks `prisma.user.findUnique({ where: { email } })`. If found, returns `409 Conflict`.
* **Password Hashing**: `bcryptjs.hash(password, 10)` generates a 60-character salted hash. Plain-text passwords never touch disk or logs.
* **Safe Return**: The controller strips `passwordHash` before returning user data.

### 2.2 Login Flow
* Endpoint: `POST /api/auth/login`
* Input: `{ email, password }`
* Finds user by email. If missing, returns `401 Unauthorized`.
* Calls `bcryptjs.compare(password, user.passwordHash)` (constant-time comparison).
* Generates a signed JWT:
  ```javascript
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  ```
* Returns token and safe user profile.

### 2.3 JWT Lifecycle & Verification
* The client persists the JWT in `localStorage` under key `rfq_token`.
* `src/api/client.js` sends it on every protected request via the standard `Authorization: Bearer <token>` header.
* On the server, `authenticateToken` middleware calls `jwt.verify(token, JWT_SECRET)`.
* If expired or tampered with, responds with `401 Unauthorized`.

---

## 3. Role-Based Authorization (RBAC)

The application enforces **strict backend authorization**, not just frontend hiding.

### 3.1 Middleware Implementation (`src/middleware/authMiddleware.js`)
```javascript
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only ${allowedRoles.join(' or ')} can access this resource.`
      });
    }
    next();
  };
}
```

### 3.2 Authorization Rules Enforced
1. **Suppliers cannot create RFQs**: `POST /api/rfqs` is guarded by `authorizeRole('BUYER')`. Attempted calls by a supplier return `403 Forbidden`.
2. **Buyers cannot submit quotations**: `POST /api/rfqs/:id/quotations` is guarded by `authorizeRole('SUPPLIER')`.
3. **Buyers cannot view another buyer's received quotations**: In `GET /api/rfqs/:id/quotations`, the controller checks:
   ```javascript
   if (rfq.buyerId !== req.user.id) {
     return res.status(403).json({ success: false, message: 'Forbidden: You can only view quotations for your own RFQs.' });
   }
   ```
4. **Ownership on Modifications**: `PUT /api/rfqs/:id` and `DELETE /api/rfqs/:id` verify `rfq.buyerId === req.user.id`.

---

## 4. Database Schema & Relational Design

### 4.1 Models & Tables
1. **`User` (`users`)**:
   * Primary key: `id` (autoincrement).
   * Unique constraint on `email`.
   * Stored `role` as an ENUM (`BUYER`, `SUPPLIER`).
2. **`RFQ` (`rfqs`)**:
   * Foreign key `buyerId` references `User(id)` with `onDelete: Cascade`.
   * Tracks `productName`, `description`, `quantity`, `deliveryLocation`, `deadline`, and `status`.
   * Indexes on `buyerId`, `status`, and `deadline` for fast query filtering.
3. **`Quotation` (`quotations`)**:
   * Foreign keys: `rfqId` $\rightarrow$ `RFQ(id)`, `supplierId` $\rightarrow$ `User(id)`.
   * `quotedPrice`, `estimatedDelivery`, and optional `message`.
   * Indexes on `rfqId` and `supplierId`.

### 4.2 The Unique Constraint (`unique(rfqId, supplierId)`)
In `schema.prisma`:
```prisma
@@unique([rfqId, supplierId])
```
* **Why this matters**: In procurement, allowing a supplier to submit multiple competing quotes creates race conditions and bidding spam.
* **How it is enforced**:
  1. **Application level**: `supplierController.js` checks `findUnique` before insert and returns `409 Conflict`.
  2. **Database level**: PostgreSQL enforces a composite unique index on `(rfqId, supplierId)`. If a duplicate insert ever bypassed application checks, PostgreSQL throws error `23505` (Prisma `P2002`), safely caught by `errorMiddleware.js`.

---

## 5. Validation Architecture: Frontend vs Backend

| Validation Layer | Purpose | Examples in this Codebase |
|---|---|---|
| **Frontend Validation** | **Instant UX Feedback**; prevents avoidable network round-trips. | Form checks for empty inputs, email formatting, minimum password length, and ensuring quantity $> 0$ before triggering Axios. |
| **Backend Validation** | **Absolute Security Boundary**; guarantees integrity regardless of client (curl, Postman, automated scripts). | `authValidator.js`, `rfqValidator.js`, and `quotationValidator.js` validate types, bounds, string lengths, and date timestamps before touching database queries. |

### Why Backend Validation is Mandatory
* Frontend validation can be bypassed by opening DevTools or sending raw HTTP requests via curl or Postman.
* The backend independently verifies:
  * `quantity > 0` and is an integer.
  * `quotedPrice > 0`.
  * `deadline` is a valid ISO date strictly in the future (`new Date(deadline) > new Date()`).
  * `status` is one of the valid enum values.

---

## 6. Security Checklist

* **Password Protection**: Salted bcrypt hashing with 10 rounds.
* **Token Security**: Signed JWTs with standard expiration (24h).
* **Sanitized Responses**: Password hashes are strictly omitted from JSON responses.
* **CORS Protection**: Express CORS configured to restrict access to trusted origins defined in `CLIENT_URL`.
* **Secrets Management**: Sensitive credentials (`DATABASE_URL`, `JWT_SECRET`) loaded via environment variables (`.env`). `.gitignore` excludes `.env` from Git.
* **SQL Injection Immunity**: Prisma ORM uses parameterized SQL queries under the hood, neutralizing SQL injection vectors.
* **Ownership Verification**: Resource-level checks prevent Insecure Direct Object References (IDOR).
* **Safe Error Messages**: In production, stack traces are withheld from clients.

---

## 7. Key Files Tour

| File | Primary Responsibility |
|---|---|
| [`server/prisma/schema.prisma`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/server/prisma/schema.prisma) | Declarative PostgreSQL models, relations, enums, indexes, and compound unique constraint. |
| [`server/src/middleware/authMiddleware.js`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/server/src/middleware/authMiddleware.js) | JWT verification (`authenticateToken`) and role authorization checks (`authorizeRole`). |
| [`server/src/services/rfqService.js`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/server/src/services/rfqService.js) | Centralized deadline verification logic (`isRfqExpired`, `getEffectiveStatus`). |
| [`server/src/controllers/rfqController.js`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/server/src/controllers/rfqController.js) | CRUD endpoints for RFQs, query filters (search, location, status), and ownership checks. |
| [`server/src/controllers/supplierController.js`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/server/src/controllers/supplierController.js) | Quotation submissions with deadline validation and duplicate prevention. |
| [`client/src/api/client.js`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/client/src/api/client.js) | Axios singleton configured with request token injection and 401 response handling. |
| [`client/src/context/AuthContext.jsx`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/client/src/context/AuthContext.jsx) | Global authentication state and login/register/logout actions. |
| [`client/src/components/ProtectedRoute.jsx`](file:///C:/Users/ajayp/.gemini/antigravity-ide/scratch/rfq-marketplace/client/src/components/ProtectedRoute.jsx) | Route gatekeeper redirecting unauthenticated or mismatched-role users. |

---

## 8. Anticipated Technical Interview Q&A

### Q1: How did you design the relationship between Buyers, RFQs, and Quotations?
**Answer**:
> "I modeled a classic 1-to-many relationship where a Buyer (`User`) owns multiple `RFQ` records. Each `RFQ` can receive multiple `Quotation` records from different Suppliers (`User`).
> To strictly prevent a supplier from submitting multiple quotes on the same RFQ, I added a composite unique constraint: `@@unique([rfqId, supplierId])` in Prisma. This enforces uniqueness at both the database level and application layer."

### Q2: How does the system prevent a supplier from quoting on an expired RFQ?
**Answer**:
> "We enforce this on the backend rather than relying solely on the frontend UI. In `supplierController.js`, when a `POST /api/rfqs/:rfqId/quotations` request arrives, the server queries the RFQ from PostgreSQL and verifies:
> 1. `rfq.status === 'OPEN'`
> 2. `new Date(rfq.deadline) > new Date()`
> If the deadline has elapsed, the backend rejects the request with a `400 Bad Request` stating 'RFQ deadline has passed'. On the frontend, if the RFQ is expired, the quotation submission form is replaced with a notice: 'Quotations are closed for this RFQ.'"

### Q3: How do you protect buyer-only endpoints from unauthorized supplier access?
**Answer**:
> "I created a higher-order Express middleware function called `authorizeRole(...allowedRoles)`. When chained after `authenticateToken`, it inspects `req.user.role`.
> If a Supplier tries to create an RFQ or inspect another buyer's received quotes, `authorizeRole('BUYER')` detects the mismatch and immediately responds with `403 Forbidden`."

### Q4: How is authentication persisted on the frontend?
**Answer**:
> "On successful login or registration, the backend returns a signed JWT and safe user object. We store the token and user in `localStorage`.
> Our `AuthContext` restores this session on initial page load. An Axios request interceptor attaches the token as `Bearer <token>` in the `Authorization` header for all requests, and a response interceptor automatically handles `401 Unauthorized` by clearing `localStorage` and redirecting to `/login`."

### Q5: How do you handle password security?
**Answer**:
> "We use `bcryptjs` with 10 salt rounds. Salted hashing prevents rainbow table attacks. The password hash is computed asynchronously during registration. In login, `bcrypt.compare` performs a constant-time comparison to protect against timing attacks. Furthermore, our controllers explicitly exclude `passwordHash` when returning user objects to the client."

### Q6: What happens if an RFQ is deleted? What happens to its quotations?
**Answer**:
> "In `schema.prisma`, we configured `onDelete: Cascade` on the `rfq` relation in `Quotation`. When a buyer deletes their RFQ, PostgreSQL automatically cascades and deletes all associated quotations in a single atomic transaction, preventing orphaned quotation records."

### Q7: Why did you choose Prisma ORM over raw SQL or Sequelize?
**Answer**:
> "Prisma provides type-safe query building, automatic database migrations, and clean schema definitions. It prevents SQL injection attacks via query parameterization and makes relationships and compound unique constraints (`@@unique`) easy to maintain and understand."

### Q8: How are search and filters implemented for suppliers browsing RFQs?
**Answer**:
> "In `rfqController.js`, the `GET /api/rfqs` endpoint accepts query parameters: `search`, `location`, and `status`. We construct a dynamic Prisma `where` clause:
> * Case-insensitive substring matching (`mode: 'insensitive'`) across `productName`, `description`, and `deliveryLocation`.
> * Status filtering defaults to `OPEN` and `deadline > now` so suppliers never see expired RFQs by default.
> On the frontend, input changes are debounced by 300ms to prevent unnecessary server requests while typing."

### Q9: What HTTP status codes does the API return and when?
**Answer**:
> * `200 OK`: Successful reads (`GET`) and updates (`PUT`).
> * `201 Created`: Successful resource creation (`POST /api/rfqs`, `POST /api/auth/register`, quotation submission).
> * `400 Bad Request`: Input validation failures (e.g. quantity $\le 0$, invalid email format, expired deadline).
> * `401 Unauthorized`: Missing, invalid, or expired JWT.
> * `403 Forbidden`: Role mismatch (Supplier calling buyer route) or ownership violation (Buyer trying to edit another buyer's RFQ).
> * `404 Not Found`: Target RFQ or user ID does not exist.
> * `409 Conflict`: Duplicate email registration or duplicate quotation from the same supplier (`unique(rfqId, supplierId)`).
> * `500 Internal Server Error`: Unhandled exceptions caught by centralized error middleware.

### Q10: If you had more time, what would you improve?
**Answer**:
> "I would add:
> 1. Email notifications to alert buyers when a new quote is submitted and suppliers when an RFQ is awarded.
> 2. PDF export for purchase orders and quotation comparison sheets.
> 3. File attachments for engineering drawings and CAD files stored in AWS S3 or Supabase Storage."
