"use client";

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
import { Purchase, PurchaseStatus } from "@/types/inventory";
import { formatCurrency } from "@/utils/formatters";
import React, { useEffect, useState } from "react";

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
  onPurchaseCreated?: (purchase: Purchase) => void;
}

interface PurchaseRow {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function CreatePurchaseModal({
  isOpen,
  onClose,
  preselectedProductId,
  onPurchaseCreated,
}: CreatePurchaseModalProps) {
  const { suppliers, products, createPurchase, settings } = useInventory();

  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<PurchaseRow[]>([
    { productId: "", quantity: 10, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState<number | "">("");
  const [status, setStatus] = useState<PurchaseStatus>("Pending");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedProductId && isOpen) {
      const prod = products.find((p) => p.id === preselectedProductId);
      if (prod) {
        const timer = setTimeout(() => {
          setRows([
            {
              productId: prod.id,
              quantity: Math.max(10, prod.minimumStock * 2),
              unitPrice: prod.purchasePrice,
            },
          ]);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [preselectedProductId, isOpen, products]);

  const resetForm = () => {
    setSupplierId(suppliers[0]?.id || "");
    setRows([{ productId: "", quantity: 10, unitPrice: 0 }]);
    setDiscount("");
    setStatus("Pending");
    setNotes("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: prodId,
        quantity: copy[index].quantity || 10,
        unitPrice: prod ? prod.purchasePrice : 0,
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
      { productId: "", quantity: 10, unitPrice: 0 },
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

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    const validRows = rows.filter((r) => r.productId);
    if (validRows.length === 0) {
      setError("Please select at least one product item.");
      return;
    }

    for (const r of validRows) {
      if (r.quantity <= 0) {
        setError("Quantity must be at least 1.");
        return;
      }
      if (r.unitPrice < 0) {
        setError("Purchase unit price cannot be negative.");
        return;
      }
    }

    const res = createPurchase({
      supplierId,
      items: validRows,
      discount: discountAmount,
      status,
      notes: notes.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error || "Failed to create purchase order.");
      return;
    }

    if (res.purchase && onPurchaseCreated) {
      onPurchaseCreated(res.purchase);
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order (PO)</DialogTitle>
          <p className="text-xs text-gray-500">
            Generate a procurement purchase order to restock warehouse inventory items.
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Step 1: Select Supplier */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-white/2">
            <Label className="text-xs font-semibold text-gray-800 dark:text-white">
              Step 1: Select Supplier / Vendor *
            </Label>
            <div className="mt-1.5">
              <CustomSelect
                value={supplierId}
                onChange={(val) => setSupplierId(val)}
                placeholder="-- Choose a Supplier --"
                options={suppliers.map((s) => ({
                  value: s.id,
                  label: `${s.companyName} (${s.name})`,
                }))}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </div>
          </div>

          {/* Step 2: Add Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-800 dark:text-white">
                Step 2: Add Line Items to Restock *
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
                    No items in this purchase order.
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

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/3"
                    >
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-end">
                        <div className="sm:col-span-5">
                          <label className="text-[11px] font-medium text-gray-500">
                            Product
                          </label>
                          <div className="mt-1">
                            <CustomSelect
                              value={row.productId}
                              onChange={(val) => handleProductChange(index, val)}
                              placeholder="-- Select Product to Order --"
                              options={products.map((p) => ({
                                value: p.id,
                                label: `${p.name} (Current: ${p.currentStock} ${p.unit})`,
                              }))}
                              triggerClassName="w-full h-8 text-xs"
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-medium text-gray-500">
                            Order Qty
                          </label>
                          <Input
                            type="number"
                            min="1"
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

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-medium text-gray-500">
                            Cost ({settings.currency})
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

                        <div className="sm:col-span-2 text-end">
                          <label className="text-[11px] font-medium text-gray-500 block">
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

                      {selectedProd && (
                        <div className="mt-2 text-[11px] text-gray-500">
                          Current warehouse stock: {selectedProd.currentStock}{" "}
                          {selectedProd.unit} · SKU: {selectedProd.sku}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 3: Calculation & Step 4: Save as Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <Field>
                <Label>Initial Order Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setStatus("Pending")}
                    className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                      status === "Pending"
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-300"
                    }`}
                  >
                    Pending (Awaiting Delivery)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("Draft")}
                    className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                      status === "Draft"
                        ? "bg-gray-700 border-gray-700 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-300"
                    }`}
                  >
                    Draft PO
                  </button>
                </div>
              </Field>

              <Field>
                <Label>Procurement Notes / PO Memo</Label>
                <Input
                  type="text"
                  placeholder="e.g. Q4 bulk replenishment, expected dispatch in 3 days"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>

            {/* Calculations Box */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/3 space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-200 dark:border-gray-800">
                Step 3: Procurement Outlay
              </span>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(subtotal, settings.currency, settings.currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Supplier Discount ({settings.currency})</span>
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
                <span>GST Tax ({settings.taxPercentage}%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(taxAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                <span>Estimated PO Value</span>
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
              Save Purchase Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
