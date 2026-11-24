"use client";

import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/context/inventory-context";
import { ArrowLeftRightIcon, XIcon } from "@/icons";
import { Sale } from "@/types/inventory";
import React, { useState } from "react";

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  onReturnSuccess: () => void;
}

export default function SalesReturnModal({
  isOpen,
  onClose,
  sale,
  onReturnSuccess,
}: SalesReturnModalProps) {
  const { returnSaleItem, settings } = useInventory();

  // Find returnable items
  const returnableItems = sale.items
    .map((item) => {
      const alreadyReturned = (sale.returnedItems || [])
        .filter((r) => r.productId === item.productId)
        .reduce((sum, r) => sum + r.quantity, 0);
      return {
        ...item,
        alreadyReturned,
        returnableQty: item.quantity - alreadyReturned,
      };
    })
    .filter((item) => item.returnableQty > 0);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    returnableItems[0]?.productId || ""
  );
  const [returnQty, setReturnQty] = useState<number>(1);
  const [reason, setReason] = useState<string>("Customer requested return");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = returnableItems.find((i) => i.productId === selectedProductId);

  // Update default refund amount when item or qty changes
  React.useEffect(() => {
    if (currentItem) {
      setRefundAmount(currentItem.unitPrice * returnQty);
    }
  }, [selectedProductId, returnQty, currentItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      setError("Please select an item to return.");
      return;
    }
    if (returnQty <= 0 || returnQty > currentItem.returnableQty) {
      setError(`Return quantity must be between 1 and ${currentItem.returnableQty}.`);
      return;
    }
    if (!reason.trim()) {
      setError("Please specify a reason for this return.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const res = returnSaleItem(sale.id, {
      productId: currentItem.productId,
      quantity: returnQty,
      refundAmount: Number(refundAmount) || 0,
      reason: reason.trim(),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Failed to process return.");
      return;
    }

    onReturnSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ArrowLeftRightIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Process Sales Return</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Invoice {sale.invoiceNumber} • Restock to Inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-error-700 bg-error-50 dark:bg-error-950/40 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg">
              {error}
            </div>
          )}

          {returnableItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              All items on this invoice have already been returned.
            </div>
          ) : (
            <>
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select Item to Return *
                </label>
                <CustomSelect
                  value={selectedProductId}
                  onChange={(val) => {
                    setSelectedProductId(val);
                    setReturnQty(1);
                  }}
                  options={returnableItems.map((item) => ({
                    value: item.productId,
                    label: `${item.productName} (Sold: ${item.quantity}, Returnable: ${item.returnableQty})`,
                  }))}
                  triggerClassName="w-full h-10"
                  className="w-full"
                />
              </div>

              {/* Quantity */}
              {currentItem && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Return Quantity (Max {currentItem.returnableQty}) *
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={currentItem.returnableQty}
                      value={returnQty}
                      onChange={(e) =>
                        setReturnQty(
                          Math.max(1, Math.min(currentItem.returnableQty, Number(e.target.value) || 1))
                        )
                      }
                      className="font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Refund Amount ({settings.currency})
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Math.max(0, Number(e.target.value) || 0))}
                      className="font-bold text-sm text-error-600 dark:text-error-400"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Return *
                </label>
                <div className="mb-2">
                  <CustomSelect
                    value={reason}
                    onChange={(val) => setReason(val)}
                    options={[
                      { value: "Customer changed mind / Unopened", label: "Customer changed mind / Unopened" },
                      { value: "Defective unit / Hardware issue", label: "Defective unit / Hardware issue" },
                      { value: "Incorrect item purchased", label: "Incorrect item purchased" },
                      { value: "Exchange for alternate model", label: "Exchange for alternate model" },
                      { value: "Other", label: "Other reason..." },
                    ]}
                    triggerClassName="w-full h-10"
                    className="w-full"
                  />
                </div>

                <Input
                  type="text"
                  placeholder="Additional remarks..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Restock Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <strong>Inventory Impact:</strong> Returning {returnQty} unit(s) will automatically increment product stock and record a <code>Return In</code> ledger movement. A refund entry will also be recorded in the Daybook cash register.
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {returnableItems.length > 0 && (
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? "Restocking..." : "Confirm Return & Restock"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
