"use client";

import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import DatePicker from "@/components/ui/date-picker";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/context/inventory-context";
import { BanknoteUndoIcon, XIcon } from "@/icons";
import { DaybookPartyType, DaybookPaymentMode, DaybookType } from "@/types/inventory";
import React, { useState } from "react";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CATEGORIES = [
  "Counter Sale",
  "Customer Payment",
  "Vendor Payment",
  "Packaging & Supplies",
  "Logistics & Freight",
  "Office Tea & Refreshments",
  "Staff Salary / Advance",
  "Utility & Electricity",
  "Shop Maintenance",
  "Sales Return Refund",
  "Miscellaneous Expense",
];

export default function AddEntryModal({ isOpen, onClose }: AddEntryModalProps) {
  const { addDaybookEntry, settings } = useInventory();

  const [type, setType] = useState<DaybookType>("cash_out");
  const [partyName, setPartyName] = useState("");
  const [partyType, setPartyType] = useState<DaybookPartyType>("Expense");
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<DaybookPaymentMode>("Cash");
  const [category, setCategory] = useState("Miscellaneous Expense");
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString());
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) {
      setError("Please provide a party name or expense description.");
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    addDaybookEntry({
      type,
      partyName: partyName.trim(),
      partyType,
      amount: numAmount,
      paymentMode,
      category,
      date: entryDate,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
    // Reset form
    setPartyName("");
    setAmount("");
    setReference("");
    setNotes("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <BanknoteUndoIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Record Cash Transaction</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daybook &amp; petty cash register</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-error-700 bg-error-50 dark:bg-error-950/40 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Switcher: Cash In vs Cash Out */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("cash_in");
                  setPartyType("Customer");
                  setCategory("Counter Sale");
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  type === "cash_in"
                    ? "bg-success-50 border-success-500 text-success-700 dark:bg-success-950 dark:border-success-500 dark:text-success-300 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span>⬇️ Cash In (Inflow)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("cash_out");
                  setPartyType("Expense");
                  setCategory("Miscellaneous Expense");
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  type === "cash_out"
                    ? "bg-error-50 border-error-500 text-error-700 dark:bg-error-950 dark:border-error-500 dark:text-error-300 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span>⬆️ Cash Out (Expense)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ({settings.currency}) *
            </label>
            <Input
              type="number"
              min={1}
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className="text-base font-bold text-gray-900 dark:text-white"
            />
          </div>

          {/* Party Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Party / Payee Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Ramesh Tea Stall, Acme Corp"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Party Type
              </label>
              <CustomSelect
                value={partyType}
                onChange={(val) => setPartyType(val as DaybookPartyType)}
                options={[
                  { value: "Customer", label: "Customer" },
                  { value: "Vendor", label: "Vendor" },
                  { value: "Staff", label: "Staff" },
                  { value: "Expense", label: "Expense / General" },
                  { value: "Other", label: "Other" },
                ]}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </div>
          </div>

          {/* Payment Mode & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Mode
              </label>
              <CustomSelect
                value={paymentMode}
                onChange={(val) => setPaymentMode(val as DaybookPaymentMode)}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "UPI", label: "UPI / QR" },
                  { value: "Card", label: "Card" },
                  { value: "Bank Transfer", label: "Bank Transfer" },
                ]}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={COMMON_CATEGORIES.map((c) => ({ value: c, label: c }))}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Date &amp; Time
            </label>
            <DatePicker
              value={entryDate}
              onChange={(d) => {
                if (d) setEntryDate(d.toISOString());
              }}
              enableTime={true}
              placeholder="Pick transaction date & time"
              className="w-full"
            />
          </div>

          {/* Reference / Voucher No */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference / Voucher No (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. VOUCH-084, Bill #1024"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <Input
              type="text"
              placeholder="Additional comments or remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
