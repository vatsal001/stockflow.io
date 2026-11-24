"use client";

import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/context/inventory-context";
import { CheckCircleIcon, RegenerateIcon } from "@/icons";
import React, { useState } from "react";

export default function SettingsView() {
  const { settings, updateSettings, resetToSampleData } = useInventory();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [taxPercentage, setTaxPercentage] = useState<number | "">(
    settings.taxPercentage
  );

  const [savedMessage, setSavedMessage] = useState(false);
  const [resetMessage, setResetMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      email,
      phone,
      address,
      currency,
      currencyCode,
      taxPercentage: Number(taxPercentage) || 0,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data back to pristine sample seed state? All newly created sales and purchases will be restored to initial state."
      )
    ) {
      resetToSampleData();
      setResetMessage(true);
      setTimeout(() => setResetMessage(false), 3000);
    }
  };

  const currencyOptions = [
    { label: "INR (₹) - Indian Rupee", symbol: "₹", code: "INR" },
    { label: "USD ($) - US Dollar", symbol: "$", code: "USD" },
    { label: "EUR (€) - Euro", symbol: "€", code: "EUR" },
    { label: "GBP (£) - British Pound", symbol: "£", code: "GBP" },
    { label: "AED (د.إ) - UAE Dirham", symbol: "AED", code: "AED" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {savedMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2">
          <CheckCircleIcon className="size-4" />
          <span>Business settings saved successfully! All invoices and figures updated.</span>
        </div>
      )}

      {resetMessage && (
        <div className="rounded-xl bg-brand-50 p-4 text-xs font-semibold text-brand-800 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200 flex items-center gap-2">
          <CheckCircleIcon className="size-4" />
          <span>Demo sample data has been reset to its pristine state.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Company & Invoicing Profile
            </h3>
            <p className="text-xs text-gray-400">
              Details rendered on printable tax invoices and purchase orders
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <Label>Business Legal Name *</Label>
                <Input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Label>Official Business Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <Label>Official Phone Contact *</Label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Label>Tax / GST Rate Percentage (%) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxPercentage}
                  onChange={(e) =>
                    setTaxPercentage(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
              </Field>
            </div>

            <Field>
              <Label>Registered Office / Warehouse Address *</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                required
              />
            </Field>
          </div>
        </div>

        {/* Currency & Financial Standards */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Currency & Regional Standards
            </h3>
            <p className="text-xs text-gray-400">
              Configure base trade currency used across product pricing and accounts
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label>Default Currency (Default: INR ₹)</Label>
              <div className="mt-1">
                <CustomSelect
                  value={currencyCode}
                  onChange={(val) => {
                    const opt = currencyOptions.find((c) => c.code === val);
                    if (opt) {
                      setCurrency(opt.symbol);
                      setCurrencyCode(opt.code);
                    }
                  }}
                  options={currencyOptions.map((c) => ({
                    value: c.code,
                    label: c.label,
                  }))}
                  triggerClassName="w-full h-10"
                  className="w-full"
                />
              </div>
            </Field>

            <Field>
              <Label>Currency Symbol Preview</Label>
              <Input type="text" value={`${currency} (${currencyCode})`} disabled />
            </Field>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" variant="default">
            Save Settings Changes
          </Button>
        </div>
      </form>

      {/* Demo State Reset Box */}
      <div className="rounded-2xl border border-dashed border-gray-300 p-5 md:p-6 dark:border-gray-700 bg-gray-50/50 dark:bg-white/2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
            Reset Sample Data
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Restore sample inventory, customers, suppliers, and transaction records back to default demo state.
          </p>
          {resetMessage && (
            <p className="text-xs text-success-600 dark:text-success-400 font-medium mt-1">
              Data successfully reset to initial demo state.
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2 text-xs shrink-0"
        >
          <RegenerateIcon className="size-4" />
          <span>Reset Sample Data</span>
        </Button>
      </div>
    </div>
  );
}
