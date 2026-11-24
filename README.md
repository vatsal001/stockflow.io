# StockFlow — Premium Inventory & Business Management SaaS

StockFlow is a production-grade, full-stack Inventory and Trade Management web application designed for enterprise inventory tracking, multi-line order fulfillment, purchasing workflows, vendor relations, and business analytics.

Developed as a technical assessment for the **Full Stack Developer** role at **SasthaSoft**.

---

## 🚀 Live Demo & Key Highlights

- **Single Source of Truth:** A centralized reactive state architecture with immediate localStorage persistence guarantees zero desynchronization across modules.
- **Strict Stock Invariants:** 
  - Prevents negative inventory.
  - Automatically validates available physical stock prior to sale order creation.
  - Idempotent purchase receiving ensures stock counts are incremented exactly once upon shipment arrival.
  - Automatic dual-entry stock movement ledger (`Purchase In`, `Sale Out`, `Manual Adjustment`).
- **Dynamic Calculation Engine:** All KPI summary cards, inventory health donuts, revenue trends, and analytical reports derive directly from real transactional state.
- **Print-Ready Documents:** Integrated printable tax invoices and purchase orders styled with business branding, GST breakdowns, and vendor/client credentials.
- **Responsive & Dark Mode Native:** Built with modern CSS logical properties for seamless internationalization and responsive design from mobile devices to 4K displays.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.4.6 | App Router, Turbopack, React 19.3.1 |
| **Styling** | Tailwind CSS v4.1 | `@theme` CSS tokens, class-based dark mode (`.dark`) |
| **Primitives** | Base UI + CVA | `@base-ui/react` primitives styled with `class-variance-authority` |
| **Data Visualization** | ApexCharts 7.1 | Area revenue trends, donut inventory health charts |
| **State & Persistence** | React Context + LocalStorage | Centralized reactive store with automatic browser storage sync |
| **Data Tables** | TanStack Table + Base UI | Sorting, filtering, search, pagination, and CSV data export |
| **Language** | TypeScript 5.9 | Strict typing across all domain models, schemas, and actions |
| **Internationalization** | next-intl 4.14 | Clean path routing with zero unwanted URL locale prefixes |

---

## 📦 Application Modules

### 1. Executive Dashboard (`/`)
* **5 Dynamic Metric Cards:** Total Products, Total Stock Valuation (at purchase cost), Total Sales Revenue, Pending Purchase Orders, and Low Stock Priority Count.
* **Sales Overview Chart:** Interactive 7-day or 30-day revenue chart with percentage comparison against the previous period.
* **Inventory Health Donut:** Real-time breakdown of In Stock ($> \text{Min}$), Low Stock ($\le \text{Min}$), and Out of Stock ($\le 0$).
* **Low Stock Alerts Table:** Highlights products requiring reorders with direct one-click restock procurement triggers.
* **Recent Activity Feed:** Real-time chronological audit trail of completed sales, received purchases, and stock adjustments.

### 2. Inventory Management (`/inventory`)
* **Product Catalog Table:** Columns for Product Name, SKU, Category, Unit, Available Stock, Min Stock, Purchase Cost, Selling Price, Status Badge, and Actions.
* **Add / Edit Product Modal:** SKU generation, multi-category selection, margin indicators, and opening stock validation.
* **Stock Movement Audit Ledger Drawer:** Detailed chronological ledger tracking Date, Reference ID, Movement Type, Quantity change ($\pm$), Previous Stock, and Updated Stock.
* **Manual Stock Level Adjustment:** Direct physical audit capability with required reason logging.
* **Export:** One-click CSV export of the product catalog.

### 3. Sales & Tax Invoicing (`/sales`)
* **Interactive 5-Step Order Creation:**
  1. *Customer Selection:* Choose registered corporate client.
  2. *Line Item Addition:* Real-time stock validation prevents ordering more units than available in warehouse.
  3. *Financial Calculation:* Dynamic subtotal, custom discount, and configurable GST tax calculation.
  4. *Payment Terms:* Assign status (`Paid`, `Partial`, `Unpaid`).
  5. *Order Finalization:* Atomically decrements warehouse stock and generates `Sale Out` ledger entries.
* **Printable Tax Invoice:** Complete tax invoice with business header, client details, itemized table, and browser print trigger (`window.print()`).

### 4. Purchase Management & Restocking (`/purchases`)
* **Procurement Workflow:**
  * Draft or issue purchase orders to registered suppliers.
  * Real-time calculation of purchase outlay, discounts, and tax.
* **Idempotent Stock Receiving:**
  * One-click "Receive Stock" action.
  * Strictly increases physical inventory exactly once and logs `Purchase In` entries into the movement ledger.
  * Prevents duplicate stock updates if clicked multiple times.

### 5. Customers Directory (`/customers`)
* Corporate client database managing Company Name, Contact Person, Phone, Email, and Billing Address.
* Lifetime value and total order count calculated dynamically from actual sales records.
* Complete historical sales ledger per customer with one-click access to original invoices.

### 6. Suppliers Directory (`/suppliers`)
* Vendor directory managing Supplier Name, Corporate Contact, Email, Phone, and Warehouse Dispatch Address.
* Cumulative outlay spend and total purchase order count tracked per vendor.
* Complete procurement history ledger per supplier.

### 7. Reports & Business Analytics (`/reports`)
* **Stock Valuation Report:** Asset valuation at purchase cost vs. projected retail value and potential profit margin percentage.
* **Sales Performance Report:** Revenue trends, realization rate (paid vs. unpaid), and transaction log.
* **Procurement Outlay Report:** Spending trends, received inventory vs. pending commitments, and PO audit log.
* **CSV Export:** Full CSV data export available across all three reporting views.

### 8. Business & System Settings (`/settings`)
* Legal Business Name, Email, Phone, and Warehouse Address.
* Configurable Currency (Default: `₹ INR`, support for `USD`, `EUR`, `GBP`, `AED`).
* Configurable GST / Tax Rate (Default: `18%`).
* **1-Click Demo Reset:** "Reset Demo Data" button restores the application to its pristine sample state at any time.

---

## 🏃 Local Development Instructions

### Prerequisites
* **Node.js:** `v20.9.0` or later (tested on `v24.2.0`).
* **npm:** `v10.0.0` or later.

### Installation & Execution

1. Clone or navigate to the repository root:
   ```bash
   cd free-nextjs-admin-dashboard-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

5. Production build test:
   ```bash
   npm run build
   npm run start
   ```

---

## 🏛️ Architecture & State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      StockFlow State                        │
│                 (LocalStorage Persistent)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Purchases   │        │  Inventory   │        │    Sales     │
│  Management  │───────►│  Catalog &   │◄───────│  Management  │
│  (PO Inflow) │        │ Stock Ledger │        │(Sale Outflow)│
└──────────────┘        └──────┬───────┘        └──────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│     Executive Dashboard      │        │    Business & Tax Reports    │
│  (Live KPIs & Health Donut)  │        │ (Valuation, Sales & PO Logs) │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## 🔑 Demo Credentials

* **Authentication:** Not required for this assessment demo.
* State initializes automatically with 10 realistic products, 5 corporate clients, 4 verified suppliers, 8 completed sales invoices, and 6 purchase orders.
