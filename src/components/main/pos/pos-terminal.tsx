"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/context/inventory-context";
import {
  CartIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  TrashBinIcon,
  UserIcon,
} from "@/icons";
import { ParkedOrder, Product, Sale } from "@/types/inventory";
import React, { useMemo, useState } from "react";
import ParkedOrdersDrawer from "./parked-orders-drawer";
import PosCheckoutModal from "./pos-checkout-modal";
import ThermalReceiptModal from "./thermal-receipt-modal";

interface CartLineItem {
  product: Product;
  quantity: number;
}

export default function PosTerminal() {
  const { products, customers, settings, parkOrder, parkedOrders } = useInventory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart state
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in");
  const [customCustomerName, setCustomCustomerName] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isParkedDrawerOpen, setIsParkedDrawerOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          return prev; // Reached stock limit
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const cappedQty = Math.min(newQty, product.currentStock);

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: cappedQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.sellingPrice,
      0
    );
  }, [cartItems]);

  const discount = Math.min(discountAmount, subtotal);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round((taxable * settings.taxPercentage) / 100);
  const grandTotal = taxable + tax;

  // Resolve Customer Name
  const currentCustomerName = useMemo(() => {
    if (selectedCustomerId === "walk-in") {
      return customCustomerName.trim() || "Walk-in Customer";
    }
    const c = customers.find((cust) => cust.id === selectedCustomerId);
    return c ? c.companyName || c.name : "Walk-in Customer";
  }, [selectedCustomerId, customCustomerName, customers]);

  // Hold current cart
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;

    const formattedItems = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      lineTotal: item.quantity * item.product.sellingPrice,
    }));

    parkOrder({
      customerId: selectedCustomerId,
      customerName: currentCustomerName,
      items: formattedItems,
      subtotal,
      discount,
      notes: "Held at POS counter",
    });

    clearCart();
  };

  // Resume a held cart
  const handleResumeOrder = (order: ParkedOrder) => {
    const resumedItems: CartLineItem[] = [];
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        resumedItems.push({
          product: prod,
          quantity: Math.min(item.quantity, prod.currentStock),
        });
      }
    });

    setCartItems(resumedItems);
    setDiscountAmount(order.discount || 0);
    if (order.customerId) setSelectedCustomerId(order.customerId);
    if (order.customerName && order.customerId === "walk-in") {
      setCustomCustomerName(order.customerName);
    }
  };

  // Checkout Success Handler
  const handleSaleSuccess = (sale: Sale) => {
    setIsCheckoutOpen(false);
    clearCart();
    setCompletedSale(sale);
    setIsReceiptOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Catalog & Item Selection (7 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <Input
              type="text"
              placeholder="Search product by name, SKU or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cartItems.find((ci) => ci.product.id === product.id);
            const inCartQty = inCart ? inCart.quantity : 0;
            const remainingStock = product.currentStock - inCartQty;
            const isOutOfStock = product.currentStock <= 0;
            const isCartMaxed = remainingStock <= 0;

            return (
              <div
                key={product.id}
                onClick={() => !isCartMaxed && addToCart(product)}
                className={`relative p-3.5 rounded-xl border transition-all text-start flex flex-col justify-between ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    : isCartMaxed
                    ? "cursor-not-allowed bg-gray-50/80 dark:bg-gray-800/40 border-amber-300 dark:border-amber-700/60"
                    : "cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-brand-500 hover:shadow-theme-sm"
                }`}
              >
                {/* Cart Badge if in cart */}
                {inCartQty > 0 && (
                  <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {inCartQty}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-medium text-gray-400 truncate">
                      {product.sku}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {product.name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
                    {settings.currency} {product.sellingPrice.toLocaleString("en-IN")}
                  </span>

                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      product.currentStock <= 0
                        ? "bg-error-50 text-error-600 dark:bg-error-950/50 dark:text-error-400"
                        : product.currentStock <= product.minimumStock
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                        : "bg-success-50 text-success-600 dark:bg-success-950/50 dark:text-success-400"
                    }`}
                  >
                    {product.currentStock <= 0
                      ? "Out of stock"
                      : `${product.currentStock} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <SearchIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No products found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-gray-400 mt-1">Try searching another SKU or category</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Active Cart, Customer & Checkout (5 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-20">
        {/* Cart Top Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CartIcon className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Active Order</h3>
              <Badge color="primary" size="sm">
                {cartItems.reduce((s, i) => s + i.quantity, 0)} items
              </Badge>
            </div>

            {/* Held Orders Drawer Trigger */}
            <button
              onClick={() => setIsParkedDrawerOpen(true)}
              className="relative inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-500 transition-colors"
            >
              <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
              Held Carts
              {parkedOrders.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {parkedOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Customer Selection Row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <CustomSelect
                value={selectedCustomerId}
                onChange={(val) => setSelectedCustomerId(val)}
                options={[
                  { value: "walk-in", label: "Walk-in Customer (General)" },
                  ...customers.map((c) => ({
                    value: c.id,
                    label: `${c.companyName || c.name} (${c.phone || "No phone"})`,
                  })),
                ]}
                triggerClassName="w-full h-8 text-xs"
                className="w-full"
              />
            </div>

            {selectedCustomerId === "walk-in" && (
              <Input
                type="text"
                placeholder="Walk-in name / phone (optional)..."
                value={customCustomerName}
                onChange={(e) => setCustomCustomerName(e.target.value)}
                className="text-xs py-1"
              />
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
              <CartIcon className="w-12 h-12 stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">
                Click any product on the left catalog to add to bill
              </p>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => {
              const lineTotal = quantity * product.sellingPrice;
              const isAtMaxStock = quantity >= product.currentStock;

              return (
                <div
                  key={product.id}
                  className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/80 hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {settings.currency}{product.sellingPrice.toLocaleString("en-IN")} each
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-semibold text-xs text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isAtMaxStock}
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {settings.currency}{lineTotal.toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-[10px] text-error-500 hover:underline inline-flex items-center gap-0.5"
                    >
                      <TrashBinIcon className="w-2.5 h-2.5" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Calculation & Actions Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50/70 dark:bg-gray-900/90 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.currency} {subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Discount ({settings.currency})</span>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-20 text-end text-xs font-semibold px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax ({settings.taxPercentage}%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.currency} {tax.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Grand Total</span>
                <span className="text-base text-brand-600 dark:text-brand-400">
                  {settings.currency} {grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHoldOrder}
                className="text-xs gap-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <ClockIcon className="w-3.5 h-3.5" />
                Hold Order
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 gap-1"
              >
                <TrashBinIcon className="w-3.5 h-3.5" />
                Clear Cart
              </Button>
            </div>

            {/* Pay Button */}
            <Button
              variant="default"
              className="w-full text-sm font-semibold py-2.5 shadow-md shadow-brand-500/20"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Pay &amp; Checkout ({settings.currency}{grandTotal.toLocaleString("en-IN")})
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Split Payment Modal */}
      <PosCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        grandTotal={grandTotal}
        customerId={selectedCustomerId}
        customerName={currentCustomerName}
        items={cartItems.map((ci) => ({
          productId: ci.product.id,
          productName: ci.product.name,
          sku: ci.product.sku,
          quantity: ci.quantity,
          unitPrice: ci.product.sellingPrice,
          lineTotal: ci.quantity * ci.product.sellingPrice,
        }))}
        onSuccess={handleSaleSuccess}
      />

      {/* 80mm Printable Thermal Receipt Modal */}
      <ThermalReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Held Carts / Suspended Orders Drawer */}
      <ParkedOrdersDrawer
        isOpen={isParkedDrawerOpen}
        onClose={() => setIsParkedDrawerOpen(false)}
        onResume={handleResumeOrder}
      />
    </div>
  );
}
