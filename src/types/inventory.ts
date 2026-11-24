export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  description: string;
  createdAt: string;
}

export type MovementType =
  | "Purchase In"
  | "Sale Out"
  | "Manual Adjustment"
  | "Return In";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  date: string;
  reference: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  updatedStock: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReturnedItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  date: string;
}

export type PaymentStatus = "Paid" | "Partial" | "Unpaid";
export type InvoiceStatus = "Completed" | "Pending" | "Cancelled" | "Refunded";

export interface PaymentBreakdown {
  cash: number;
  upi: number;
  card: number;
  bankTransfer: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  notes?: string;
  source?: "POS" | "Standard";
  paymentBreakdown?: PaymentBreakdown;
  tenderedAmount?: number;
  changeReturn?: number;
  returnedItems?: ReturnedItem[];
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type PurchaseStatus = "Draft" | "Pending" | "Received" | "Cancelled";

export interface Purchase {
  id: string;
  orderNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  status: PurchaseStatus;
  receivedAt?: string;
  notes?: string;
}

export type ActivityType =
  | "purchase_received"
  | "sale_completed"
  | "stock_adjusted"
  | "product_added"
  | "purchase_created"
  | "sale_returned"
  | "cash_entry_added";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  referenceId?: string;
}

export interface BusinessSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencyCode: string;
  taxPercentage: number;
}

export type DaybookType = "cash_in" | "cash_out";
export type DaybookPartyType = "Customer" | "Vendor" | "Staff" | "Expense" | "Other";
export type DaybookPaymentMode = "Cash" | "UPI" | "Card" | "Bank Transfer";

export interface DaybookEntry {
  id: string;
  date: string;
  type: DaybookType;
  partyName: string;
  partyType: DaybookPartyType;
  amount: number;
  paymentMode: DaybookPaymentMode;
  category: string;
  reference?: string;
  notes?: string;
}

export interface ParkedOrder {
  id: string;
  parkedAt: string;
  customerName: string;
  customerId?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  notes?: string;
}

export function calculateStockStatus(currentStock: number, minimumStock: number): StockStatus {
  if (currentStock <= 0) return "Out of Stock";
  if (currentStock <= minimumStock) return "Low Stock";
  return "In Stock";
}
