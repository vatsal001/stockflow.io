"use client";

import { useInventory } from "@/context/inventory-context";
import { ArrowDownIcon, ArrowUpIcon, BanknoteUndoIcon, DollarIcon } from "@/icons";
import React, { useMemo } from "react";

export default function DaybookBalanceCards() {
  const { daybookEntries, settings } = useInventory();

  const metrics = useMemo(() => {
    let totalCashIn = 0;
    let totalCashOut = 0;
    let digitalInflow = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    let todayCashIn = 0;
    let todayCashOut = 0;

    daybookEntries.forEach((entry) => {
      const isToday = entry.date.startsWith(todayStr);

      if (entry.type === "cash_in") {
        if (entry.paymentMode === "Cash") {
          totalCashIn += entry.amount;
          if (isToday) todayCashIn += entry.amount;
        } else {
          digitalInflow += entry.amount;
        }
      } else {
        if (entry.paymentMode === "Cash") {
          totalCashOut += entry.amount;
          if (isToday) todayCashOut += entry.amount;
        }
      }
    });

    // Opening physical cash base (e.g. ₹15,000 drawer float) + Net Cash
    const drawerOpeningFloat = 15000;
    const netCashInHand = drawerOpeningFloat + totalCashIn - totalCashOut;

    return {
      netCashInHand,
      todayCashIn,
      todayCashOut,
      digitalInflow,
      drawerOpeningFloat,
    };
  }, [daybookEntries]);

  const cards = [
    {
      title: "Cash In Hand (Drawer)",
      value: `${settings.currency} ${metrics.netCashInHand.toLocaleString("en-IN")}`,
      subtitle: `Includes ${settings.currency}${metrics.drawerOpeningFloat.toLocaleString("en-IN")} opening float`,
      icon: BanknoteUndoIcon,
      color: "brand",
    },
    {
      title: "Today's Cash Inflow",
      value: `${settings.currency} ${metrics.todayCashIn.toLocaleString("en-IN")}`,
      subtitle: "Physical counter collections",
      icon: ArrowDownIcon,
      color: "success",
    },
    {
      title: "Today's Cash Outflow",
      value: `${settings.currency} ${metrics.todayCashOut.toLocaleString("en-IN")}`,
      subtitle: "Expenses & refunds paid",
      icon: ArrowUpIcon,
      color: "error",
    },
    {
      title: "Digital / UPI Inflow",
      value: `${settings.currency} ${metrics.digitalInflow.toLocaleString("en-IN")}`,
      subtitle: "UPI, Card & Bank deposits",
      icon: DollarIcon,
      color: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs hover:border-gray-300 dark:hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <span
                className={`p-2 rounded-lg ${
                  card.color === "success"
                    ? "bg-success-50 text-success-600 dark:bg-success-950/60 dark:text-success-400"
                    : card.color === "error"
                    ? "bg-error-50 text-error-600 dark:bg-error-950/60 dark:text-error-400"
                    : "bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
