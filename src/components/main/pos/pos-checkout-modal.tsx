"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/context/inventory-context";
import { CheckCircleIcon, DollarIcon, XIcon } from "@/icons";
import { PaymentBreakdown, Sale } from "@/types/inventory";
import React, { useState } from "react";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  customerId?: string;
  customerName?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  onSuccess: (sale: Sale) => void;
}

function PosCheckoutContent({
  onClose,
  subtotal,
  discount,
  tax,
  grandTotal,
  customerId,
  customerName,
  items,
  onSuccess,
}: Omit<PosCheckoutModalProps, "isOpen">) {
  const { settings, createPosSale } = useInventory();

  // Multi-tender states initialized to grandTotal
  const [cashAmount, setCashAmount] = useState<number>(grandTotal);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);

  // Cash tendered by customer
  const [tenderedCash, setTenderedCash] = useState<number>(grandTotal);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalAllocated = cashAmount + upiAmount + cardAmount + bankAmount;
  const remaining = grandTotal - totalAllocated;
  const changeReturn = Math.max(0, tenderedCash - cashAmount);

  const handleQuickCash = (amount: number) => {
    setTenderedCash(amount);
  };

  const handleSelectSingleMode = (mode: "cash" | "upi" | "card" | "bank") => {
    setCashAmount(mode === "cash" ? grandTotal : 0);
    setUpiAmount(mode === "upi" ? grandTotal : 0);
    setCardAmount(mode === "card" ? grandTotal : 0);
    setBankAmount(mode === "bank" ? grandTotal : 0);
    setTenderedCash(mode === "cash" ? grandTotal : 0);
  };

  const handleSubmit = () => {
    if (remaining > 0) {
      setError(`Balance of ${settings.currency}${remaining.toLocaleString("en-IN")} is still unpaid.`);
      return;
    }
    if (tenderedCash < cashAmount) {
      setError(`Tendered cash cannot be less than the cash required (${settings.currency}${cashAmount.toLocaleString("en-IN")}).`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const paymentBreakdown: PaymentBreakdown = {
      cash: cashAmount,
      upi: upiAmount,
      card: cardAmount,
      bankTransfer: bankAmount,
    };

    const res = createPosSale({
      customerId,
      customerName,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discount,
      paymentBreakdown,
      tenderedAmount: tenderedCash,
      changeReturn,
      notes,
    });

    setIsSubmitting(false);

    if (!res.success || !res.sale) {
      setError(res.error || "Failed to process POS sale.");
      return;
    }

    onSuccess(res.sale);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <DollarIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">POS Payment Checkout</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customer: <span className="font-medium text-gray-800 dark:text-gray-200">{customerName || "Walk-in"}</span> • {items.length} items (Subtotal: {settings.currency}{subtotal.toLocaleString("en-IN")}, Tax: {settings.currency}{tax.toLocaleString("en-IN")})
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

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {error && (
          <div className="p-3 text-sm text-error-700 bg-error-50 dark:bg-error-950/40 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Amount Hero Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 text-center">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Bill</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {settings.currency} {grandTotal.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Tendered Total</span>
            <p className={`text-xl font-bold mt-0.5 ${totalAllocated >= grandTotal ? "text-success-600 dark:text-success-400" : "text-amber-600 dark:text-amber-400"}`}>
              {settings.currency} {totalAllocated.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Change to Return</span>
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-0.5">
              {settings.currency} {changeReturn.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Quick 1-Click Pay Mode Selectors */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            Quick Tender Preset (All to one method)
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectSingleMode("cash")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                cashAmount === grandTotal && upiAmount === 0 && cardAmount === 0 && bankAmount === 0
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              💵 100% Cash
            </button>
            <button
              type="button"
              onClick={() => handleSelectSingleMode("upi")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                upiAmount === grandTotal
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              📱 UPI / QR
            </button>
            <button
              type="button"
              onClick={() => handleSelectSingleMode("card")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                cardAmount === grandTotal
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              💳 Card Swipe
            </button>
            <button
              type="button"
              onClick={() => handleSelectSingleMode("bank")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                bankAmount === grandTotal
                  ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              🏦 Net Banking
            </button>
          </div>
        </div>

        {/* Multi-Tender Split Breakdown */}
        <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Split Payment Breakdown
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Cash Required ({settings.currency})
              </label>
              <Input
                type="number"
                min={0}
                value={cashAmount}
                onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value) || 0))}
                className="font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                UPI / QR Scan ({settings.currency})
              </label>
              <Input
                type="number"
                min={0}
                value={upiAmount}
                onChange={(e) => setUpiAmount(Math.max(0, Number(e.target.value) || 0))}
                className="font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Credit / Debit Card ({settings.currency})
              </label>
              <Input
                type="number"
                min={0}
                value={cardAmount}
                onChange={(e) => setCardAmount(Math.max(0, Number(e.target.value) || 0))}
                className="font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Bank Transfer / Cheque ({settings.currency})
              </label>
              <Input
                type="number"
                min={0}
                value={bankAmount}
                onChange={(e) => setBankAmount(Math.max(0, Number(e.target.value) || 0))}
                className="font-semibold text-sm"
              />
            </div>
          </div>

          {remaining !== 0 && (
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1">
              {remaining > 0
                ? `⚠️ Remaining balance to tender: ${settings.currency} ${remaining.toLocaleString("en-IN")}`
                : `ℹ️ Overallocated by ${settings.currency} ${Math.abs(remaining).toLocaleString("en-IN")}`}
            </div>
          )}
        </div>

        {/* Cash Tendered & Change Return Calculator */}
        {cashAmount > 0 && (
          <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Cash Tendered by Customer
                </h4>
                <p className="text-xs text-gray-500">Calculate exact change to return</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Change Return</span>
                <span className="text-lg font-bold text-success-600 dark:text-success-400">
                  {settings.currency} {changeReturn.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={cashAmount}
                value={tenderedCash}
                onChange={(e) => setTenderedCash(Math.max(0, Number(e.target.value) || 0))}
                className="text-base font-bold text-gray-900 dark:text-white"
                placeholder="Enter cash given..."
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickCash(cashAmount)}
                className="text-xs font-medium px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:border-brand-500 text-gray-700 dark:text-gray-300"
              >
                Exact ({settings.currency}{cashAmount})
              </button>
              {[100, 200, 500, 1000, 2000].map((preset) => {
                if (preset >= cashAmount) {
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickCash(preset)}
                      className="text-xs font-medium px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:border-brand-500 text-gray-700 dark:text-gray-300"
                    >
                      {settings.currency}{preset}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Checkout / Receipt Notes (Optional)
          </label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Counter Sale, Gift Wrap requested..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={remaining > 0 || isSubmitting}
          className="gap-2"
        >
          <CheckCircleIcon className="w-4 h-4" />
          {isSubmitting ? "Processing..." : `Complete & Print (${settings.currency}${grandTotal.toLocaleString("en-IN")})`}
        </Button>
      </div>
    </>
  );
}

export default function PosCheckoutModal(props: PosCheckoutModalProps) {
  if (!props.isOpen) return null;

  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:max-w-2xl">
        <PosCheckoutContent
          key={`${props.grandTotal}-${props.customerId}`}
          {...props}
        />
      </DialogContent>
    </Dialog>
  );
}
