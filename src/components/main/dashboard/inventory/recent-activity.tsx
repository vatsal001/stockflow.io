"use client";

import { useInventory } from "@/context/inventory-context";
import {
  BoxIcon,
  CartIcon,
  CheckCircleIcon,
  PencilIcon,
  TruckDeliveryIcon,
} from "@/icons";
import { formatDateTime } from "@/utils/formatters";

export default function RecentActivityFeed() {
  const { activities } = useInventory();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale_completed":
        return <CartIcon className="size-4 text-emerald-500" />;
      case "purchase_received":
        return <CheckCircleIcon className="size-4 text-brand-500" />;
      case "purchase_created":
        return <TruckDeliveryIcon className="size-4 text-amber-500" />;
      case "product_added":
        return <BoxIcon className="size-4 text-purple-500" />;
      case "stock_adjusted":
        return <PencilIcon className="size-4 text-sky-500" />;
      default:
        return <CheckCircleIcon className="size-4 text-gray-500" />;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 flex flex-col justify-between">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Recent Activity
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          Audit trail of business events, stock transitions, and order fulfillment
        </p>
      </div>

      <div className="mt-4 flow-root">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="-mb-6">
            {activities.slice(0, 6).map((act, idx) => (
              <li key={act.id}>
                <div className="relative pb-5">
                  {idx !== activities.slice(0, 6).length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute start-4.5 top-4.5 -ml-px h-full w-0.5 bg-gray-100 dark:bg-gray-800"
                    />
                  )}
                  <div className="relative flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-800 dark:bg-gray-800/60 shrink-0">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white/90">
                          {act.title}
                        </p>
                        <time className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap ms-2">
                          {formatDateTime(act.timestamp)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
