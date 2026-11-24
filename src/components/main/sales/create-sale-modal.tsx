"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/context/inventory-context";
import { PlusIcon, TrashBinIcon } from "@/icons";
import { PaymentStatus, Sale } from "@/types/inventory";
import { formatCurrency } from "@/utils/formatters";
import React, { useState } from "react";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated?: (sale: Sale) => void;
}

interface SaleRow {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateSaleModal({
  isOpen,
  onClose,
  onSaleCreated,
}: CreateSaleModalProps) {
  const { customers, products, createSale, settings } = useInventory();

  const [customerId, setCustomerId] = useState("");
  const [rows, setRows] = useState<SaleRow[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCustomerId(customers[0]?.id || "");
    setRows([{ productId: "", quantity: 1, unitPrice: 0 }]);
    setDiscount("");
    setPaymentStatus("Paid");
    setNotes("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  // Row operations
  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: prodId,
        quantity: 1,
        unitPrice: prod ? prod.sellingPrice : 0,
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        quantity: qty,
      };
      return copy;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        unitPrice: price,
      };
      return copy;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { productId: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = rows.reduce((acc, r) => {
    if (!r.productId) return acc;
    return acc + r.quantity * r.unitPrice;
  }, 0);

  const discountAmount = Math.max(0, Number(discount) || 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * settings.taxPercentage) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    const validRows = rows.filter((r) => r.productId);
    if (validRows.length === 0) {
      setError("Please select at least one product.");
      return;
    }

    // Client-side stock check for fast UX feedback
    for (const row of validRows) {
      const prod = products.find((p) => p.id === row.productId);
      if (!prod) continue;
      if (row.quantity <= 0) {
        setError(`Quantity for ${prod.name} must be at least 1.`);
        return;
      }
      if (prod.currentStock < row.quantity) {
        setError(
          `Insufficient stock for "${prod.name}". Available stock is ${prod.currentStock} ${prod.unit}, but you requested ${row.quantity}. Negative inventory is not allowed.`
        );
        return;
      }
    }

    const result = createSale({
      customerId,
      items: validRows,
      discount: discountAmount,
      paymentStatus,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error || "Failed to complete sale transaction.");
      return;
    }

    if (result.sale && onSaleCreated) {
      onSaleCreated(result.sale);
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Sales Order</DialogTitle>
          <p className="text-xs text-gray-500">
            Process a sale invoice, validate physical stock availability, and automatically update ledger.
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200 dark:border-error-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Step 1: Select Customer */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-white/2">
            <Label className="text-xs font-semibold text-gray-800 dark:text-white">
              Step 1: Select Customer *
            </Label>
            <div className="mt-1.5">
              <CustomSelect
                value={customerId}
                onChange={(val) => setCustomerId(val)}
                placeholder="-- Choose a Customer --"
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.companyName} (${c.name})`,
                }))}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </div>
          </div>

          {/* Step 2: Add Products & Validate Stock */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-800 dark:text-white">
                Step 2: Add Line Items & Verify Stock *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={addRow}
                className="gap-1"
              >
                <PlusIcon className="size-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center bg-gray-50/50 dark:bg-white/2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No line items added to this order.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="mt-2 text-xs"
                  >
                    <PlusIcon className="size-3.5 me-1" /> Add Product Item
                  </Button>
                </div>
              ) : (
                rows.map((row, index) => {
                const selectedProd = products.find(
                  (p) => p.id === row.productId
                );
                const isInsufficient =
                  selectedProd && selectedProd.currentStock < row.quantity;

                return (
                  <div
                    key={index}
                    className={`rounded-xl border p-3 transition-colors ${
                      isInsufficient
                        ? "border-error-300 bg-error-50/30 dark:border-error-800 dark:bg-error-950/20"
                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-end">
                      {/* Product select (5 cols) */}
                      <div className="sm:col-span-5">
                        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          Product
                        </label>
                        <div className="mt-1">
                          <CustomSelect
                            value={row.productId}
                            onChange={(val) => handleProductChange(index, val)}
                            placeholder="-- Select Product --"
                            options={products.map((p) => ({
                              value: p.id,
                              label: `${p.name} (Avail: ${p.currentStock} ${p.unit})`,
                            }))}
                            triggerClassName="w-full h-8 text-xs"
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Quantity (2 cols) */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          Qty
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max={selectedProd ? selectedProd.currentStock : undefined}
                          value={row.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              Math.max(1, Number(e.target.value))
                            )
                          }
                          className="mt-1 text-xs py-1.5"
                          required
                        />
                      </div>

                      {/* Selling Price (2 cols) */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          Price ({settings.currency})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              Number(e.target.value)
                            )
                          }
                          className="mt-1 text-xs py-1.5"
                          required
                        />
                      </div>

                      {/* Line Total (2 cols) */}
                      <div className="sm:col-span-2 text-end">
                        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block">
                          Total
                        </label>
                        <span className="mt-1.5 block text-xs font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            row.quantity * row.unitPrice,
                            settings.currency,
                            settings.currencyCode
                          )}
                        </span>
                      </div>

                      {/* Remove button (1 col) */}
                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeRow(index)}
                          className="text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30"
                          title="Remove item"
                        >
                          <TrashBinIcon className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Available Stock Indicator */}
                    {selectedProd && (
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">
                          Available in warehouse:{" "}
                          <strong
                            className={
                              selectedProd.currentStock <= selectedProd.minimumStock
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {selectedProd.currentStock} {selectedProd.unit}
                          </strong>
                        </span>

                        {isInsufficient && (
                          <Badge color="error" size="sm">
                            Quantity exceeds stock by {row.quantity - selectedProd.currentStock}!
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Step 3: Calculation & Step 4: Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <Field>
                <Label>Step 4: Payment Status *</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["Paid", "Partial", "Unpaid"] as PaymentStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPaymentStatus(st)}
                        className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                          paymentStatus === st
                            ? st === "Paid"
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : st === "Partial"
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "bg-error-500 border-error-500 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-300"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </Field>

              <Field>
                <Label>Order Notes / Terms</Label>
                <Input
                  type="text"
                  placeholder="e.g. Net 30, delivered via priority dispatch"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>

            {/* Invoice Totals Box */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/3 space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-200 dark:border-gray-800">
                Step 3: Invoice Calculations
              </span>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(subtotal, settings.currency, settings.currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Discount ({settings.currency})</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  placeholder="0.00"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-24 text-end rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Estimated Tax (GST {settings.taxPercentage}%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(taxAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-base text-brand-600 dark:text-brand-400">
                  {formatCurrency(grandTotal, settings.currency, settings.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={subtotal <= 0}
            >
              Step 5: Confirm & Complete Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
