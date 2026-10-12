# NexusERP backend specification

Give this file to the AI that will implement the API. It describes the **current frontend demo**, not a future wishlist.

- Product: **NexusERP** — Azerbaijani ERP for small shops (inventory, wholesale, retail POS, HR, finance).
- Frontend repo: `turallhasanov/NexusERP-Frontend` (Vite 8 + React 19 + JavaScript + Tailwind 4).
- UI language: **Azerbaijani**. Currency: **AZN** (`₼`). Dates in UI: `dd.MM.yyyy`.
- There is **no HTTP API today**. Behaviour lives in `src/store/*` and `src/features/*/api/*` (in-memory). Company is the only persisted record (`localStorage` key `nexuserp-company`).
- PDFs are generated **in the browser** (`pdf-lib` + Noto Sans). **Do not generate PDFs on the backend.** Return JSON; the client builds dekonts.

JSON field names below must stay as written so the frontend can swap stores for `fetch` later.

---

## 1. What to build

A multi-tenant REST API that reproduces the demo rules:

1. Login, then a company must exist before any module works.
2. Catalog, stock, purchases, sales/POS, HR, and finance for that company.
3. Same validation and **the same Azerbaijani error strings**.
4. Computed dashboard, mizan, store mizan, and payroll — do not persist report tables.

**Do not implement in v1:** roles/permissions, camera barcode, edit/delete of company/products/customers, VAT, supplier-vs-buyer split, multi-line wholesale invoices (POS is the only multi-line flow), audit log.

Keep a `role` field on users (`admin` in the demo) but do not enforce it yet.

---

## 2. Access flow (match the frontend)

Routes in `src/lib/routes.js` and `src/App.jsx`:

| Path | Gate | Page |
|------|------|------|
| `/login` | public | any email + password logs in |
| `/setup` | auth | create company |
| `/`, `/inventory`, `/stores`, `/products`, `/customers`, `/purchases`, `/sales`, `/pos`, `/hr`, `/finance` | auth **and** company | modules |

`RequireAuth`: no user → `/login`.  
`RequireCompany`: no company → `/setup`.  
Login: if company exists → dashboard, else → setup.  
Logout does **not** clear the company in the demo.

Suggested auth:

```
POST /api/auth/login   { email, password } → { token, user: { id, name, role } }
GET  /api/auth/me
POST /api/auth/logout
GET  /api/company      → null | { id, name, voen }
POST /api/company      { name, voen? }
```

`POST /company`: trim `name`; empty → `{ ok: false, error: "Şirkət adı tələb olunur." }`. `voen` optional (store `""` if missing). Demo `setCompany` always used `id: "1"`; use a real id and attach every other row to `companyId`.

Demo user (seed or first login):

```json
{ "id": "1", "name": "Aysel Məmmədova", "role": "admin" }
```

Today login only checks that email and password are non-empty (`E-poçt və şifrə tələb olunur.`). Real hashing is required on the backend. JWT (or session) must survive a full page reload — the in-memory frontend store does not.

Error envelope: `{ "ok": false, "error": "<Azerbaijani message>" }`.  
Success create/update: `{ "ok": true, ... }`.  
Ids may be UUID; **serialize them as strings**. List newest first.

Every authenticated request is scoped to the user's company. Never leak another tenant.

---

## 3. Glossary

| UI (AZ) | Code | Meaning |
|---------|------|---------|
| Şirkət | `company` | Tenant |
| Depo | `warehouse` | Warehouse. **Not** a store |
| Mağaza | `store` | Retail outlet. **Always linked to one warehouse** |
| Kontragent | `customer` | Counterparty used for **both** purchases and wholesale sales (no supplier table) |
| VÖEN | `voen` | Tax ID |
| Məhsul tipi | `productType` | Company-defined; not a hardcoded industry list |
| Ölçü vahidi | `productUnit` | e.g. ədəd, kq, litr |
| Alış | `purchase` | Incoming stock from a kontragent into a depo |
| Satış / qaimə | `order` | Wholesale **and** retail live in one table |
| Toptan | `wholesale` | Needs kontragent + depo |
| Pərakəndə | `retail` | Needs store; warehouse = `store.warehouseId` |
| POS | checkout | Retail, many lines → **one order row per line** |
| Mizan | period buckets | Income / expense / balance |
| Balans hesabatı | P&amp;L snapshot | Cards for current period |
| Dekont | voucher | Client-only PDF/print |
| Nağd / Kart | `cash` / `card` | `PAYMENT_CASH` / `PAYMENT_CARD` |

---

## 4. Data model

All business tables include `companyId`.

### 4.1 company

```
id, name, voen
```

### 4.2 user

```
id, companyId, name, email, passwordHash, role
```

Purchases store the acting user's **name** on the document (`user` field in the demo). Persist `userId` and join.

### 4.3 warehouse

```
id, companyId, name, code
```

`code`: `DPO-` + sequence padded to 3 (`DPO-001`). Create body: `{ name }` (required, trimmed). Error: `Depo adı tələb olunur.`

### 4.4 store

```
id, companyId, name, code, warehouseId
```

`code`: `MGZ-001`. `warehouseId` must exist in the same company. Error: `Depo tapılmadı.` Create: `{ name, warehouseId }` — both required (`Ad və depo tələb olunur.`).

### 4.5 customer

```
id, companyId, name, code, voen
```

`code`: `KNT-001`. Create: `{ name, voen }` — **both required** (`Ad və VÖEN tələb olunur.`).

### 4.6 product_type

```
id, companyId, name
```

Unique per company, case-insensitive.  
Errors: `Tip adı tələb olunur.` / `Bu tip artıq var.`

### 4.7 product_unit

```
id, companyId, name
```

Unique per company, case-insensitive.  
Errors: `Vahid adı tələb olunur.` / `Bu vahid artıq var.`

Display helper (client today): `` `${quantity} ${unitName}` ``.

### 4.8 product

```
id, companyId, name, sku, barcode, typeId, unitId, unitPrice, quantity, minQuantity
```

- `sku`: `STK-` + sequence padded to 3.
- `barcode`: required, trimmed, unique per company.
- `typeId` and `unitId` required and must exist.
- `unitPrice > 0`.
- `quantity` is the **sum of stock across warehouses** (keep in sync in the same transaction).
- `minQuantity >= 0`.
- Critical stock: `quantity <= minQuantity`.

New product in the demo dumps opening qty onto warehouse `"1"` (`stocks: { '1': quantity }`). Backend: accept optional `warehouseId` or use the company's first/default warehouse. Do not create a product with no stock row if `quantity > 0`.

Create errors:

- `Barkod tələb olunur.`
- `Bu barkod artıq var.`
- `Məhsul tipi tələb olunur.`
- `Ölçü vahidi tələb olunur.`
- `Qiymət 0-dan böyük olmalıdır.`
- Client also: `Məhsul adı tələb olunur.` / `Say 0-dan böyük olmalıdır.` / `Minimum ehtiyat 0 və ya daha çox olmalıdır.`

Barcode lookup: exact `barcode` **or** `sku` case-insensitive.

### 4.9 stock (product × warehouse)

```
productId, warehouseId, qty
```

Missing cell = `0`. POS catalog stock is **only** the selected store's warehouse.

**receiveStock** (purchase + manual receive): add qty; product.quantity += qty. Receive form allows decimals (`quantity > 0`). Errors: `Məhsul anbarda tapılmadı.` / `Depo tapılmadı.`

**deductStock** (sale / POS): if `available < qty` →  
`Bu depoda yalnız {formattedQty} var.`  
(`formattedQty` = quantity + unit name, e.g. `8 ədəd`). Then subtract.

### 4.10 purchase

```
id, companyId, number, customerId, productId, warehouseId, userId,
quantity, unitPrice, total, createdAt
```

Demo denormalizes names onto the row (`customer`, `voen`, `product`, `warehouse`, `user`). Persist FKs; **return both ids and display names** so tables keep working.

- `number`: `ALŞ-{year}-{seq 3}` e.g. `ALŞ-2026-001`
- `total = quantity * unitPrice`
- Side effect: `receiveStock`
- Create: logged-in user, customer, product, warehouse, `quantity >= 1`, `unitPrice > 0`
- Errors: `İstifadəçi tapılmadı.` `Kontragent tapılmadı.` `Məhsul anbarda tapılmadı.` `Depo tapılmadı.` plus client `Kontragent, məhsul və depo tələb olunur.` / `Say ən azı 1 olmalıdır.` / `Qiymət 0-dan böyük olmalıdır.`

Single product line per purchase (same as demo).

### 4.11 order (sales + POS)

```
id, companyId, number, type, customerId, storeId, warehouseId, productId,
quantity, unitPrice, total, payment, tendered, change, status, createdAt
```

- `type`: `wholesale` | `retail`
- `number`: `SAT-{year}-{seq 3}`
- `status`: `open` | `closed` — default `open`. Toggle flips.
- `payment`: `cash` | `card`
- `tendered`, `change`: numbers or `null` (card / wholesale form have no tender)
- `total = quantity * unitPrice`
- Side effect: `deductStock` (must fail the whole write if stock is short)

**Wholesale:** `customerId` + `warehouseId` required. Display `store` as `—`.  
**Retail:** `storeId` required; `warehouseId = store.warehouseId`. Display customer `Pərakəndə`, voen `—`.

Sales form qty: integer `>= 1`. Payment required.

Toggle: `open` → `closed` and back (`Bağla` / `Yenidən aç`). Does **not** restock.

### 4.12 POS checkout (must be one DB transaction)

```
POST /api/pos/checkout
{
  "storeId": "...",
  "payment": "cash" | "card",
  "tendered": 50,
  "lines": [{ "productId": "...", "quantity": 1, "unitPrice": 9 }]
}
```

Rules (`src/features/pos/api/checkout-pos.js`):

- `storeId` required → `Mağaza tələb olunur.`
- `lines` non-empty → `Səbət boşdur.`
- payment cash or card → `Ödəniş növü tələb olunur.`
- `total = Σ(quantity * unitPrice)`
- cash: `tendered >= total` else `Verilən məbləğ cəmidən az ola bilməz.` `change = tendered - total`
- card: `change = null`, ignore tendered
- **Each line becomes its own order** (`type: retail`), same payment
- `tendered` and `change` are stored **only on the last order**
- If any deduct fails, **roll back all lines** (the demo does not; the API must)

Response: `{ "ok": true, "change": 1.5 | null, "orders": [ ... ] }`

Cash note buttons `[1, 5, 10, 20, 50, 100, 200]` are UI only. Backend only receives `tendered`.

POS catalog for a store:

```json
{
  "id": "1",
  "name": "A4 surətkağızı",
  "sku": "STK-001",
  "barcode": "2000001000012",
  "typeId": "1",
  "typeName": "Kağız",
  "unitId": "1",
  "unitName": "ədəd",
  "unitPrice": 9,
  "stock": 120
}
```

`stock` = qty in that store's warehouse, else `0`. Filter/search is client-side today (name, barcode, sku, typeName).

### 4.13 expense (manual)

```
id, companyId, number, category, amount, createdAt
```

- `number`: `MƏX-{year}-{seq 3}`
- `category` one of: `Kirayə`, `Kommunal`, `Təchizat`, `Digər`
- `amount > 0`
- Errors: `Kateqoriya tələb olunur.` / `Məbləğ 0-dan böyük olmalıdır.`

Purchases and payroll appear on finance **reports** but are **not** inserted into this table.

### 4.14 employee

```
id, companyId, name, title, department, status, hiredAt, leftAt, salary
```

- `status`: `active` | `leave` | `left`
- Create: `{ name, title, department, hiredAt, salary }` → `active`, `leftAt: null`
- Departments in UI: `İdarə`, `Anbar`, `Satış`, `Maliyyə`
- `hiredAt`: `YYYY-MM-DD`
- `salary > 0`
- Error: `Ad, vəzifə, şöbə və işə qəbul tarixi tələb olunur.` / `Maaş 0-dan böyük olmalıdır.`

**Toggle leave:** `active ↔ leave`. Ignore if `left`.  
**Terminate:** `status = left`, `leftAt = today`. No-op if already `left`.  
Headcount: `status !== 'left'`. On leave: among those, `status === 'leave'`.

---

## 5. Periods and computed finance

Query `?period=day|month|year` (default `month`).

Period key of an ISO `createdAt`:

- day → `YYYY-MM-DD`
- month → `YYYY-MM`
- year → `YYYY`

`isInPeriod`: document key equals **current** period key (today / this month / this year).

UI labels (`periodCardLabels`):

| period | income | expense | balance | payroll |
|--------|--------|---------|---------|---------|
| day | Bu günkü mədaxil | Bu günkü məxaric | Bu günkü qalıq | Bu ayın maaş |
| month | Bu ayın mədaxil | Bu ayın məxaric | Bu ayın qalıq | Bu ayın maaş |
| year | Bu ilin mədaxil | Bu ilin məxaric | Bu ilin qalıq | Bu ilin maaş |

### 5.1 Payroll (not a table)

Employee counts in a month `YYYY-MM` if:

- `hiredAt` parses and `hiredAt <= last day of that month`
- and (`leftAt` is null **or** `leftAt > last day of that month`)

Month payroll = sum of those salaries.  
Year payroll = for each employee, `salary * (count of months in that year they were employed)`.  
`payrollForPeriod`: year → year total; **day and month → current month** (even on the daily dashboard card).

**Daily mizan does not add payroll** (`period !== 'day'`).

### 5.2 Dashboard `GET /api/dashboard?period=`

```json
{
  "wholesaleOpen": 0,
  "retailOpen": 0,
  "productCount": 3,
  "customerCount": 3,
  "storeCount": 2,
  "purchaseCount": 0,
  "criticalStock": 1,
  "wholesaleRevenue": 0,
  "retailRevenue": 0,
  "expenseTotal": 0,
  "balance": 0,
  "headcount": 3,
  "onLeave": 1,
  "payroll": 4100
}
```

- `wholesaleOpen` / `retailOpen`: count of orders with that `type` and `status === "open"` — **all time**, not filtered by period.
- `purchaseCount`, revenues, `expenseTotal`, `balance`: **current period only**.
- `expenseTotal` = period purchase totals + period manual expenses (**payroll excluded**).
- `balance` = wholesaleRevenue + retailRevenue − expenseTotal.
- `criticalStock` / counts: live catalog, not period-sliced.

### 5.3 Finance `GET /api/finance?period=`

Return shape used by `useFinanceLedger`:

```json
{
  "entries": [ /* period orders */ ],
  "expenses": [ /* virtual ledger rows, newest logic as below */ ],
  "months": [ /* mizan rows */ ],
  "storeMonths": [ /* store mizan rows */ ],
  "income": 0,
  "expenseTotal": 0,
  "payroll": 0,
  "balance": 0
}
```

**Virtual expense rows** (not stored):

1. If `period !== day` and payroll &gt; 0: `{ id: "payroll-current", number: "MAAŞ", category: "Maaş fondu", amount: payroll }`
2. Each period purchase: `{ id: "purchase-{id}", number, category: "Alış", amount: total, createdAt }`
3. Period manual expenses as stored

`income` = sum of period order totals.  
`expenseTotal` = purchases + manual expenses (**still without payroll**).  
`balance` = income − expenseTotal.  
`payroll` is a separate card.

### 5.4 Company mizan (`months`)

Bucket **all** orders / expenses / purchases (not only current period). Bucket key = `periodKey(createdAt, period)`.

- income += order.total
- expense += expense.amount + purchase.total
- Always include a bucket for the **current** period (even if empty)
- If `period !== day`: add payroll for that bucket (month key or year number)
- `balance = income - expense`
- Sort by `key` **descending**
- `{ key, label, income, expense, balance }`  
  `label`: day → `dd.MM.yyyy`, month → Azerbaijani month + year (`Yanvar 2026`), year → `2026`

### 5.5 Store mizan (`storeMonths`)

- Income: orders with `type === "retail"` matched to a store **by store name** (demo). Match by `storeId` on the backend.
- Expense: purchases whose warehouse is the store's warehouse (demo matches **warehouse name**). Match by `warehouseId`.
- No payroll.
- `{ key, store, slot, label, income, expense, balance }`
- Sort: `slot` descending, then store name `localeCompare(..., 'az')`.

---

## 6. REST map

Prefix `/api`. All except login require `Authorization`. All except login+create-company require a company.

| Method | Path | Body / notes |
|--------|------|----------------|
| POST | `/auth/login` | `{ email, password }` |
| GET | `/auth/me` | |
| POST | `/auth/logout` | |
| GET | `/company` | `null` or company |
| POST | `/company` | `{ name, voen? }` once per user/tenant as in demo |
| GET, POST | `/warehouses` | `{ name }` |
| GET, POST | `/stores` | `{ name, warehouseId }` |
| GET, POST | `/customers` | `{ name, voen }` |
| GET, POST | `/product-types` | `{ name }` |
| GET, POST | `/product-units` | `{ name }` |
| GET, POST | `/products` | `{ name, barcode, typeId, unitId, unitPrice, quantity, minQuantity }` |
| GET | `/products/by-barcode?code=` | barcode or sku |
| POST | `/stock/receive` | `{ productId, warehouseId, quantity }` |
| GET | `/pos/catalog?storeId=` | catalog array |
| POST | `/pos/checkout` | see §4.12 |
| GET, POST | `/purchases` | `{ customerId, productId, warehouseId, quantity, unitPrice }` |
| GET, POST | `/orders` | `{ type, customerId?, storeId?, warehouseId?, productId, quantity, unitPrice, payment }` |
| PATCH | `/orders/:id/status` | toggle open/closed |
| GET, POST | `/expenses` | `{ category, amount }` |
| GET, POST | `/employees` | `{ name, title, department, hiredAt, salary }` |
| PATCH | `/employees/:id/leave` | toggle |
| PATCH | `/employees/:id/terminate` | |
| GET | `/dashboard?period=` | §5.2 |
| GET | `/finance?period=` | §5.3 |
| GET | `/hr/payroll?period=` | `{ rows: [{ ...employee, amount }], total }` |

CORS: allow the Vite origin. JSON camelCase as above.

---

## 7. Document numbers

Per **company** (and year where shown):

| Kind | Pattern |
|------|---------|
| Purchase | `ALŞ-{year}-{seq}` |
| Sale / POS line | `SAT-{year}-{seq}` |
| Manual expense | `MƏX-{year}-{seq}` |
| Product SKU | `STK-{seq}` |
| Warehouse | `DPO-{seq}` |
| Store | `MGZ-{seq}` |
| Customer | `KNT-{seq}` |
| Virtual payroll row | `MAAŞ` |

`seq` is zero-padded to 3 in the demo.

---

## 8. Frontend screens the API must feed

| Nav | Route | Writes | Reads |
|-----|-------|--------|-------|
| İdarə paneli | `/` | — | dashboard + period filter |
| Anbar | `/inventory` | warehouses, receive stock | products, warehouses, stock value, critical count |
| Mağaza | `/stores` | stores | stores + warehouse names |
| Məhsul | `/products` | types, units, products | counts |
| Kontragent | `/customers` | customers | list |
| Alış | `/purchases` | purchase + stock in | purchases, dekont fields |
| Satış | `/sales` | wholesale/retail order + stock out, toggle status | orders, dekont |
| POS | `/pos` | checkout | catalog by store, types |
| İnsan resursları | `/hr` | employees, leave, terminate | payroll for period |
| Maliyyə | `/finance` | manual expense | ledger, mizan, store mizan |

Dekont titles (client): Satış dekontu, POS qəbzi, Alış dekontu, Anbar hesabatı, Xülasə hesabatı, Balans / Mizan / Mağaza mizan / Mədaxil / Məxaric hesabatı, Maaş hesabatı.

---

## 9. Optional demo seed (same as frontend)

Use only for empty companies if you want the UI to look like the current demo.

**Warehouses:** Mərkəzi anbar `DPO-001`, Gəncə anbarı `DPO-002`, Sumqayıt anbarı `DPO-003`.  
**Stores:** Bakı mağazası → warehouse 1, Gəncə mağazası → warehouse 2.  
**Customers:** Bakı Ofis MMC `1401234561`, Gəncə Ticarət `1702345672`, Sumqayıt Təchizat `1503456783`.  
**Types:** Kağız, Kartric, Qablaşdırma.  
**Units:** ədəd, kq, litr.  
**Products** (unit ədəd, all stock on warehouse 1):

| name | sku | barcode | type | price | qty | min |
|------|-----|---------|------|-------|-----|-----|
| A4 surətkağızı | STK-001 | 2000001000012 | Kağız | 9 | 120 | 40 |
| Mürəkkəb kartrici | STK-014 | 2000001000142 | Kartric | 28 | 8 | 10 |
| Bağlama lenti | STK-032 | 2000001000326 | Qablaşdırma | 4.5 | 54 | 20 |

**Employees:** Aysel Məmmədova Administrator İdarə active hired 2026-01-06 salary 1800; Elvin Quliyev Anbardar Anbar active 2026-02-10 1200; Nigar Əliyeva Satıcı Satış **leave** 2026-03-01 1100.

Empty `orders`, `purchases`, `expenses` is fine.

---

## 10. Source of truth in this repo

| Topic | File |
|-------|------|
| Routes / gates | `src/App.jsx`, `src/lib/routes.js` |
| Auth | `src/store/auth-store.js`, `src/features/auth/components/LoginForm.jsx` |
| Company | `src/store/company-store.js`, `src/features/company/api/create-company.js` |
| Stock | `src/store/inventory-store.js` |
| Types / units | `src/store/product-types-store.js`, `src/store/product-units-store.js` |
| Place sale | `src/features/sales/api/place-order.js` |
| POS | `src/features/pos/api/checkout-pos.js` |
| Purchase | `src/features/purchases/api/place-purchase.js` |
| Mizan | `src/features/finance/api/build-mizan.js`, `build-store-mizan.js`, `use-finance-ledger.js` |
| Dashboard | `src/features/dashboard/api/use-dashboard-summary.js` |
| Payroll | `src/features/hr/api/payroll.js`, `src/lib/date.js` |
| Payments | `src/lib/payment.js` |

---

## 11. Implementation notes for the backend AI

1. Stack is your choice (Nest, Laravel, FastAPI, Go, …). PostgreSQL recommended.
2. Wrap POS checkout and any stock + document pair in a **single transaction**.
3. Store FKs (`customerId`, `warehouseId`, …) even though the demo copies names onto orders/purchases. Return names in JSON.
4. Do not emit PDF. Do not reverse-engineer the dekont layout.
5. Do not implement RBAC yet; do not add camera endpoints.
6. Ship OpenAPI or a short README of the running server (port, env, migrate, seed).
7. Error `error` strings must match this document so the existing UI can show them unchanged.
8. Money is a decimal, not integer qəpik, in the demo (`4.5`, `step 0.01`). Use a numeric/decimal type, not float if possible.
9. `createdAt` ISO-8601 UTC or local consistent with `new Date().toISOString()`.
10. One company per logged-in demo user is enough for v1; designing `users` N:N `companies` can wait.
