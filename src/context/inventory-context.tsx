"use client";

import {
  initialActivities,
  initialCustomers,
  initialDaybookEntries,
  initialProducts,
  initialPurchases,
  initialSales,
  initialSettings,
  initialStockMovements,
  initialSuppliers,
} from "@/data/seed-data";
import {
  BusinessSettings,
  Customer,
  DaybookEntry,
  ParkedOrder,
  PaymentBreakdown,
  PaymentStatus,
  Product,
  Purchase,
  PurchaseStatus,
  RecentActivity,
  ReturnedItem,
  Sale,
  StockMovement,
  Supplier,
} from "@/types/inventory";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "stockflow_app_data_v2";

export interface CreateSaleInput {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface CreatePosSaleInput {
  customerId?: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount: number;
  paymentBreakdown: PaymentBreakdown;
  tenderedAmount: number;
  changeReturn: number;
  notes?: string;
}

export interface CreatePurchaseInput {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount: number;
  status: PurchaseStatus;
  notes?: string;
}

interface InventoryContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  stockMovements: StockMovement[];
  activities: RecentActivity[];
  settings: BusinessSettings;
  daybookEntries: DaybookEntry[];
  parkedOrders: ParkedOrder[];
  isLoaded: boolean;

  // Product Actions
  addProduct: (product: Omit<Product, "id" | "createdAt">) => { success: boolean; product?: Product; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };
  adjustStock: (productId: string, newStock: number, reason: string) => { success: boolean; error?: string };

  // Customer Actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => { success: boolean; error?: string };
  deleteCustomer: (id: string) => { success: boolean; error?: string };

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => { success: boolean; error?: string };
  deleteSupplier: (id: string) => { success: boolean; error?: string };

  // Sales & POS Actions
  createSale: (input: CreateSaleInput) => { success: boolean; sale?: Sale; error?: string };
  createPosSale: (input: CreatePosSaleInput) => { success: boolean; sale?: Sale; error?: string };
  returnSaleItem: (saleId: string, returnData: { productId: string; quantity: number; refundAmount: number; reason: string }) => { success: boolean; error?: string };

  // Parked Orders (POS)
  parkOrder: (order: Omit<ParkedOrder, "id" | "parkedAt">) => { success: boolean; parkedOrder: ParkedOrder };
  resumeOrder: (id: string) => ParkedOrder | undefined;
  deleteParkedOrder: (id: string) => void;

  // Daybook Actions
  addDaybookEntry: (entry: Omit<DaybookEntry, "id" | "date"> & { date?: string }) => { success: boolean; entry: DaybookEntry };

  // Purchases Actions
  createPurchase: (input: CreatePurchaseInput) => { success: boolean; purchase?: Purchase; error?: string };
  receivePurchase: (purchaseId: string) => { success: boolean; error?: string };
  cancelPurchase: (purchaseId: string) => { success: boolean; error?: string };

  // Settings & System Actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetToSampleData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [activities, setActivities] = useState<RecentActivity[]>(initialActivities);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [daybookEntries, setDaybookEntries] = useState<DaybookEntry[]>(initialDaybookEntries);
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.activities) setActivities(parsed.activities);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.daybookEntries) setDaybookEntries(parsed.daybookEntries);
        if (parsed.parkedOrders) setParkedOrders(parsed.parkedOrders);
      }
    } catch (e) {
      console.error("Failed to load inventory data from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        products,
        customers,
        suppliers,
        sales,
        purchases,
        stockMovements,
        activities,
        settings,
        daybookEntries,
        parkedOrders,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save inventory data to localStorage", e);
    }
  }, [
    products,
    customers,
    suppliers,
    sales,
    purchases,
    stockMovements,
    activities,
    settings,
    daybookEntries,
    parkedOrders,
    isLoaded,
  ]);

  // Product Actions
  const addProduct = (data: Omit<Product, "id" | "createdAt">) => {
    const existingSku = products.find((p) => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (existingSku) {
      return { success: false, error: `A product with SKU "${data.sku}" already exists.` };
    }

    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    if (data.currentStock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        date: new Date().toISOString(),
        reference: "INITIAL-STOCK",
        type: "Purchase In",
        quantity: data.currentStock,
        previousStock: 0,
        updatedStock: data.currentStock,
        notes: "Opening inventory balance",
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "product_added",
      title: `New product added: ${newProduct.name}`,
      description: `SKU: ${newProduct.sku} with initial stock of ${newProduct.currentStock} ${newProduct.unit}.`,
      timestamp: new Date().toISOString(),
      referenceId: newProduct.sku,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true, product: newProduct };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return { success: false, error: "Product not found." };

    if (updates.sku && updates.sku.toLowerCase() !== existing.sku.toLowerCase()) {
      const conflict = products.find(
        (p) => p.id !== id && p.sku.toLowerCase() === updates.sku?.toLowerCase()
      );
      if (conflict) {
        return { success: false, error: `SKU "${updates.sku}" is already in use by another product.` };
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return { success: false, error: "Product not found." };

    const inSales = sales.some((s) => s.items.some((i) => i.productId === id));
    if (inSales) {
      return {
        success: false,
        error: "Cannot delete this product because it is referenced in existing sales records.",
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  const adjustStock = (productId: string, newStock: number, reason: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    if (newStock < 0) return { success: false, error: "Stock cannot be negative." };

    const diff = newStock - product.currentStock;
    if (diff === 0) return { success: true };

    const previousStock = product.currentStock;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: newStock } : p))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      date: new Date().toISOString(),
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      type: "Manual Adjustment",
      quantity: Math.abs(diff),
      previousStock,
      updatedStock: newStock,
      notes: reason || "Manual stock level adjustment",
    };
    setStockMovements((prev) => [movement, ...prev]);

    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "stock_adjusted",
      title: `Stock adjusted: ${product.name}`,
      description: `Adjusted from ${previousStock} to ${newStock} (${diff > 0 ? "+" : ""}${diff}). Reason: ${reason || "Manual audit"}.`,
      timestamp: new Date().toISOString(),
      referenceId: product.sku,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true };
  };

  // Customer Actions
  const addCustomer = (data: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    return { success: true };
  };

  const deleteCustomer = (id: string) => {
    const hasSales = sales.some((s) => s.customerId === id);
    if (hasSales) {
      return {
        success: false,
        error: "Cannot delete customer with recorded sales history.",
      };
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Supplier Actions
  const addSupplier = (data: Omit<Supplier, "id" | "createdAt">) => {
    const newSupplier: Supplier = {
      ...data,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    return { success: true };
  };

  const deleteSupplier = (id: string) => {
    const hasPurchases = purchases.some((p) => p.supplierId === id);
    if (hasPurchases) {
      return {
        success: false,
        error: "Cannot delete supplier with recorded purchase orders.",
      };
    }
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    return { success: true };
  };

  // Standard Sales Workflow with Strict Stock Validation
  const createSale = (input: CreateSaleInput) => {
    const customer = customers.find((c) => c.id === input.customerId);
    if (!customer) return { success: false, error: "Selected customer does not exist." };
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Sale must contain at least one product item." };
    }

    // Step 1: Validate available stock for all items
    for (const item of input.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found for item.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Quantity for "${prod.name}" must be greater than zero.` };
      }
      if (prod.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${item.quantity}. Negative inventory is not allowed.`,
        };
      }
    }

    // Step 2: Calculate financial figures
    let subtotal = 0;
    const saleItems = input.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      };
    });

    const discount = Math.max(0, input.discount || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = settings.taxPercentage;
    const tax = Math.round((taxableAmount * taxRate) / 100);
    const grandTotal = taxableAmount + tax;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${2000 + sales.length + 1}`;
    const nowIso = new Date().toISOString();

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      date: nowIso,
      customerId: customer.id,
      customerName: customer.companyName || customer.name,
      items: saleItems,
      subtotal,
      discount,
      tax,
      taxRate,
      grandTotal,
      paymentStatus: input.paymentStatus,
      invoiceStatus: "Completed",
      source: "Standard",
      notes: input.notes,
    };

    // Step 3: Decrement stock and record stock movements
    const newMovements: StockMovement[] = [];
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = input.items.find((i) => i.productId === prod.id);
        if (!soldItem) return prod;

        const previousStock = prod.currentStock;
        const updatedStock = previousStock - soldItem.quantity;

        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          date: nowIso,
          reference: invoiceNumber,
          type: "Sale Out",
          quantity: soldItem.quantity,
          previousStock,
          updatedStock,
          notes: `Fulfilled invoice ${invoiceNumber} to ${customer.companyName || customer.name}`,
        });

        return {
          ...prod,
          currentStock: updatedStock,
        };
      })
    );

    setStockMovements((prev) => [...newMovements, ...prev]);
    setSales((prev) => [newSale, ...prev]);

    // Record Activity
    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "sale_completed",
      title: `Sale Invoice ${invoiceNumber} completed`,
      description: `${saleItems.length} item(s) sold to ${customer.companyName || customer.name} for ${settings.currency} ${grandTotal.toLocaleString("en-IN")}.`,
      timestamp: nowIso,
      referenceId: invoiceNumber,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true, sale: newSale };
  };

  // Retail POS Checkout Action with Multi-Tender Split & Daybook Sync
  const createPosSale = (input: CreatePosSaleInput) => {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Cart is empty. Add products to checkout." };
    }

    // Validate available stock for all items
    for (const item of input.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found for item.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Quantity for "${prod.name}" must be greater than zero.` };
      }
      if (prod.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, In Cart: ${item.quantity}.`,
        };
      }
    }

    // Calculate line totals
    let subtotal = 0;
    const saleItems = input.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      };
    });

    const discount = Math.max(0, input.discount || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = settings.taxPercentage;
    const tax = Math.round((taxableAmount * taxRate) / 100);
    const grandTotal = taxableAmount + tax;

    // Resolve customer info
    let customerName = input.customerName || "Walk-in Customer";
    let customerId = input.customerId || "walk-in";
    if (input.customerId && input.customerId !== "walk-in") {
      const found = customers.find((c) => c.id === input.customerId);
      if (found) {
        customerName = found.companyName || found.name;
        customerId = found.id;
      }
    }

    const invoiceNumber = `POS-${new Date().getFullYear()}-${3000 + sales.length + 1}`;
    const nowIso = new Date().toISOString();

    const newSale: Sale = {
      id: `sale-pos-${Date.now()}`,
      invoiceNumber,
      date: nowIso,
      customerId,
      customerName,
      items: saleItems,
      subtotal,
      discount,
      tax,
      taxRate,
      grandTotal,
      paymentStatus: "Paid",
      invoiceStatus: "Completed",
      source: "POS",
      paymentBreakdown: input.paymentBreakdown,
      tenderedAmount: input.tenderedAmount,
      changeReturn: input.changeReturn,
      notes: input.notes,
    };

    // Decrement stock and create movements
    const newMovements: StockMovement[] = [];
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = input.items.find((i) => i.productId === prod.id);
        if (!cartItem) return prod;

        const previousStock = prod.currentStock;
        const updatedStock = previousStock - cartItem.quantity;

        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          date: nowIso,
          reference: invoiceNumber,
          type: "Sale Out",
          quantity: cartItem.quantity,
          previousStock,
          updatedStock,
          notes: `POS Counter checkout ${invoiceNumber} to ${customerName}`,
        });

        return { ...prod, currentStock: updatedStock };
      })
    );

    setStockMovements((prev) => [...newMovements, ...prev]);
    setSales((prev) => [newSale, ...prev]);

    // Record corresponding Daybook inflows for each payment tender
    const newDaybookEntries: DaybookEntry[] = [];
    if (input.paymentBreakdown.cash > 0) {
      newDaybookEntries.push({
        id: `db-${Date.now()}-cash`,
        date: nowIso,
        type: "cash_in",
        partyName: customerName,
        partyType: "Customer",
        amount: input.paymentBreakdown.cash,
        paymentMode: "Cash",
        category: "POS Sale",
        reference: invoiceNumber,
        notes: `Cash tender for ${invoiceNumber}`,
      });
    }
    if (input.paymentBreakdown.upi > 0) {
      newDaybookEntries.push({
        id: `db-${Date.now()}-upi`,
        date: nowIso,
        type: "cash_in",
        partyName: customerName,
        partyType: "Customer",
        amount: input.paymentBreakdown.upi,
        paymentMode: "UPI",
        category: "POS Sale",
        reference: invoiceNumber,
        notes: `UPI QR receipt for ${invoiceNumber}`,
      });
    }
    if (input.paymentBreakdown.card > 0) {
      newDaybookEntries.push({
        id: `db-${Date.now()}-card`,
        date: nowIso,
        type: "cash_in",
        partyName: customerName,
        partyType: "Customer",
        amount: input.paymentBreakdown.card,
        paymentMode: "Card",
        category: "POS Sale",
        reference: invoiceNumber,
        notes: `Card POS swipe for ${invoiceNumber}`,
      });
    }
    if (input.paymentBreakdown.bankTransfer > 0) {
      newDaybookEntries.push({
        id: `db-${Date.now()}-bank`,
        date: nowIso,
        type: "cash_in",
        partyName: customerName,
        partyType: "Customer",
        amount: input.paymentBreakdown.bankTransfer,
        paymentMode: "Bank Transfer",
        category: "POS Sale",
        reference: invoiceNumber,
        notes: `Bank transfer for ${invoiceNumber}`,
      });
    }

    if (newDaybookEntries.length > 0) {
      setDaybookEntries((prev) => [...newDaybookEntries, ...prev]);
    }

    // Record Activity
    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "sale_completed",
      title: `POS Sale ${invoiceNumber} completed`,
      description: `${saleItems.length} item(s) sold via POS terminal to ${customerName} for ${settings.currency} ${grandTotal.toLocaleString("en-IN")}.`,
      timestamp: nowIso,
      referenceId: invoiceNumber,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true, sale: newSale };
  };

  // Sales Returns & Restocking Workflow
  const returnSaleItem = (
    saleId: string,
    returnData: { productId: string; quantity: number; refundAmount: number; reason: string }
  ) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, error: "Sale invoice not found." };

    const saleItem = sale.items.find((i) => i.productId === returnData.productId);
    if (!saleItem) return { success: false, error: "Product was not part of this sale." };

    const alreadyReturned = (sale.returnedItems || [])
      .filter((r) => r.productId === returnData.productId)
      .reduce((sum, r) => sum + r.quantity, 0);

    const maxReturnable = saleItem.quantity - alreadyReturned;
    if (returnData.quantity <= 0) {
      return { success: false, error: "Return quantity must be at least 1." };
    }
    if (returnData.quantity > maxReturnable) {
      return {
        success: false,
        error: `Cannot return ${returnData.quantity} unit(s). Maximum returnable is ${maxReturnable}.`,
      };
    }

    const prod = products.find((p) => p.id === returnData.productId);
    if (!prod) return { success: false, error: "Product not found in inventory." };

    const nowIso = new Date().toISOString();
    const previousStock = prod.currentStock;
    const updatedStock = previousStock + returnData.quantity;

    // 1. Restock the product in inventory
    setProducts((prev) =>
      prev.map((p) => (p.id === returnData.productId ? { ...p, currentStock: updatedStock } : p))
    );

    // 2. Record Stock Movement ("Return In")
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      date: nowIso,
      reference: `RET-${sale.invoiceNumber}`,
      type: "Return In",
      quantity: returnData.quantity,
      previousStock,
      updatedStock,
      notes: returnData.reason || `Customer return from ${sale.invoiceNumber}`,
    };
    setStockMovements((prev) => [movement, ...prev]);

    // 3. Update Sale returnedItems list
    const returnedRecord: ReturnedItem = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: returnData.quantity,
      refundAmount: returnData.refundAmount,
      reason: returnData.reason,
      date: nowIso,
    };

    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== saleId) return s;
        const updatedReturns = [...(s.returnedItems || []), returnedRecord];
        return {
          ...s,
          returnedItems: updatedReturns,
          invoiceStatus: s.invoiceStatus,
        };
      })
    );

    // 4. Record Daybook Cash Out transaction if refund given
    if (returnData.refundAmount > 0) {
      const refundEntry: DaybookEntry = {
        id: `db-${Date.now()}-refund`,
        date: nowIso,
        type: "cash_out",
        partyName: sale.customerName,
        partyType: "Customer",
        amount: returnData.refundAmount,
        paymentMode: "Cash",
        category: "Sales Return",
        reference: `RET-${sale.invoiceNumber}`,
        notes: `Refund for ${returnData.quantity}x ${prod.name}. Reason: ${returnData.reason}`,
      };
      setDaybookEntries((prev) => [refundEntry, ...prev]);
    }

    // 5. Record Activity
    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "sale_returned",
      title: `Return processed for ${sale.invoiceNumber}`,
      description: `Restocked ${returnData.quantity} unit(s) of ${prod.name}. Refund amount: ${settings.currency} ${returnData.refundAmount.toLocaleString("en-IN")}.`,
      timestamp: nowIso,
      referenceId: sale.invoiceNumber,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true };
  };

  // Parked Orders (Hold / Resume POS Cart)
  const parkOrder = (orderData: Omit<ParkedOrder, "id" | "parkedAt">) => {
    const parkedOrder: ParkedOrder = {
      ...orderData,
      id: `parked-${Date.now()}`,
      parkedAt: new Date().toISOString(),
    };
    setParkedOrders((prev) => [parkedOrder, ...prev]);
    return { success: true, parkedOrder };
  };

  const resumeOrder = (id: string) => {
    const order = parkedOrders.find((o) => o.id === id);
    if (order) {
      setParkedOrders((prev) => prev.filter((o) => o.id !== id));
    }
    return order;
  };

  const deleteParkedOrder = (id: string) => {
    setParkedOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Daybook Cash & Expense Ledger Action
  const addDaybookEntry = (entryData: Omit<DaybookEntry, "id" | "date"> & { date?: string }) => {
    const newEntry: DaybookEntry = {
      ...entryData,
      id: `db-${Date.now()}`,
      date: entryData.date || new Date().toISOString(),
    };
    setDaybookEntries((prev) => [newEntry, ...prev]);

    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "cash_entry_added",
      title: `Daybook entry: ${newEntry.type === "cash_in" ? "Cash Received" : "Cash Paid"}`,
      description: `${newEntry.partyName} - ${settings.currency} ${newEntry.amount.toLocaleString("en-IN")} via ${newEntry.paymentMode} (${newEntry.category}).`,
      timestamp: newEntry.date,
      referenceId: newEntry.reference || newEntry.id,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true, entry: newEntry };
  };

  // Purchase Order Workflow
  const createPurchase = (input: CreatePurchaseInput) => {
    const supplier = suppliers.find((s) => s.id === input.supplierId);
    if (!supplier) return { success: false, error: "Selected supplier does not exist." };
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Purchase must contain at least one product item." };
    }

    let subtotal = 0;
    const poItems = input.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      };
    });

    const discount = Math.max(0, input.discount || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = settings.taxPercentage;
    const tax = Math.round((taxableAmount * taxRate) / 100);
    const grandTotal = taxableAmount + tax;

    const orderNumber = `PO-${new Date().getFullYear()}-${1000 + purchases.length + 1}`;
    const nowIso = new Date().toISOString();

    const newPurchase: Purchase = {
      id: `po-${Date.now()}`,
      orderNumber,
      date: nowIso,
      supplierId: supplier.id,
      supplierName: supplier.companyName || supplier.name,
      items: poItems,
      subtotal,
      discount,
      tax,
      taxRate,
      grandTotal,
      status: input.status,
      receivedAt: input.status === "Received" ? nowIso : undefined,
      notes: input.notes,
    };

    // If marked received immediately on creation, increase stock
    if (input.status === "Received") {
      const newMovements: StockMovement[] = [];
      setProducts((prev) =>
        prev.map((prod) => {
          const item = input.items.find((i) => i.productId === prod.id);
          if (!item) return prod;

          const previousStock = prod.currentStock;
          const updatedStock = previousStock + item.quantity;

          newMovements.push({
            id: `mov-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            date: nowIso,
            reference: orderNumber,
            type: "Purchase In",
            quantity: item.quantity,
            previousStock,
            updatedStock,
            notes: `Received PO ${orderNumber} from ${supplier.companyName || supplier.name}`,
          });

          return { ...prod, currentStock: updatedStock };
        })
      );
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    setPurchases((prev) => [newPurchase, ...prev]);

    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: input.status === "Received" ? "purchase_received" : "purchase_created",
      title: `Purchase Order ${orderNumber} ${input.status === "Received" ? "received" : "created"}`,
      description: `${poItems.length} item(s) ordered from ${supplier.companyName || supplier.name} for ${settings.currency} ${grandTotal.toLocaleString("en-IN")}.`,
      timestamp: nowIso,
      referenceId: orderNumber,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true, purchase: newPurchase };
  };

  // Strictly Idempotent Receive Purchase Order Action
  const receivePurchase = (purchaseId: string) => {
    const po = purchases.find((p) => p.id === purchaseId);
    if (!po) return { success: false, error: "Purchase order not found." };

    if (po.status === "Received") {
      return { success: false, error: "This purchase order has already been received and stock was updated." };
    }
    if (po.status === "Cancelled") {
      return { success: false, error: "Cannot receive a cancelled purchase order." };
    }

    const nowIso = new Date().toISOString();
    const newMovements: StockMovement[] = [];

    // Increase product stock exactly once
    setProducts((prev) =>
      prev.map((prod) => {
        const item = po.items.find((i) => i.productId === prod.id);
        if (!item) return prod;

        const previousStock = prod.currentStock;
        const updatedStock = previousStock + item.quantity;

        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          date: nowIso,
          reference: po.orderNumber,
          type: "Purchase In",
          quantity: item.quantity,
          previousStock,
          updatedStock,
          notes: `Received PO ${po.orderNumber} from ${po.supplierName}`,
        });

        return { ...prod, currentStock: updatedStock };
      })
    );

    // Update PO status to Received
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status: "Received", receivedAt: nowIso } : p
      )
    );

    setStockMovements((prev) => [...newMovements, ...prev]);

    const activity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "purchase_received",
      title: `Purchase Order ${po.orderNumber} received`,
      description: `Stock quantities updated for ${po.items.length} item(s) from ${po.supplierName}.`,
      timestamp: nowIso,
      referenceId: po.orderNumber,
    };
    setActivities((prev) => [activity, ...prev]);

    return { success: true };
  };

  const cancelPurchase = (purchaseId: string) => {
    const po = purchases.find((p) => p.id === purchaseId);
    if (!po) return { success: false, error: "Purchase order not found." };
    if (po.status === "Received") {
      return {
        success: false,
        error: "Cannot cancel a purchase order that has already been received into stock.",
      };
    }

    setPurchases((prev) =>
      prev.map((p) => (p.id === purchaseId ? { ...p, status: "Cancelled" } : p))
    );
    return { success: true };
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToSampleData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setStockMovements(initialStockMovements);
    setActivities(initialActivities);
    setSettings(initialSettings);
    setDaybookEntries(initialDaybookEntries);
    setParkedOrders([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        customers,
        suppliers,
        sales,
        purchases,
        stockMovements,
        activities,
        settings,
        daybookEntries,
        parkedOrders,
        isLoaded,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createSale,
        createPosSale,
        returnSaleItem,
        parkOrder,
        resumeOrder,
        deleteParkedOrder,
        addDaybookEntry,
        createPurchase,
        receivePurchase,
        cancelPurchase,
        updateSettings,
        resetToSampleData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
