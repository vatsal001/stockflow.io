"use client";

import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/context/inventory-context";
import {
  AlertIcon,
  BoxIcon,
  CartIcon,
  DollarIcon,
  TruckDeliveryIcon,
} from "@/icons";
import { formatCurrency, formatNumber } from "@/utils/formatters";

export default function SummaryCards() {
  const { products, sales, purchases, settings } = useInventory();

  // 1. Total Products
  const totalProducts = products.length;

  // 2. Total Stock Value
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );

  // 3. Total Sales
  const completedSales = sales.filter((s) => s.invoiceStatus === "Completed");
  const totalSalesRevenue = completedSales.reduce((acc, s) => acc + s.grandTotal, 0);

  // 4. Pending Purchases
  const pendingPurchases = purchases.filter((p) => p.status === "Pending");
  const pendingPurchasesValue = pendingPurchases.reduce(
    (acc, p) => acc + p.grandTotal,
    0
  );

  // 5. Low Stock Items
  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.minimumStock
  );

  const cards = [
    {
      title: "Total Products",
      value: formatNumber(totalProducts),
      subtitle: `${new Set(products.map((p) => p.category)).size} Categories`,
      icon: <BoxIcon className="size-6 text-brand-500" />,
      badge: <Badge color="info">Catalog</Badge>,
    },
    {
      title: "Total Stock Value",
      value: formatCurrency(totalStockValue, settings.currency, settings.currencyCode),
      subtitle: `Across ${formatNumber(
        products.reduce((acc, p) => acc + p.currentStock, 0)
      )} total units`,
      icon: <DollarIcon className="size-6 text-emerald-500" />,
      badge: <Badge color="success">Asset Value</Badge>,
    },
    {
      title: "Total Sales",
      value: formatCurrency(totalSalesRevenue, settings.currency, settings.currencyCode),
      subtitle: `${completedSales.length} Orders Fulfilled`,
      icon: <CartIcon className="size-6 text-purple-500" />,
      badge: <Badge color="primary">Revenue</Badge>,
    },
    {
      title: "Pending Purchases",
      value: formatNumber(pendingPurchases.length),
      subtitle: `Value: ${formatCurrency(
        pendingPurchasesValue,
        settings.currency,
        settings.currencyCode
      )}`,
      icon: <TruckDeliveryIcon className="size-6 text-amber-500" />,
      badge: (
        <Badge color={pendingPurchases.length > 0 ? "warning" : "gray"}>
          {pendingPurchases.length > 0 ? "Awaiting Delivery" : "Up to date"}
        </Badge>
      ),
    },
    {
      title: "Low Stock Items",
      value: formatNumber(lowStockProducts.length),
      subtitle: `${
        products.filter((p) => p.currentStock <= 0).length
      } completely out of stock`,
      icon: <AlertIcon className="size-6 text-error-500" />,
      badge: (
        <Badge color={lowStockProducts.length > 0 ? "error" : "success"}>
          {lowStockProducts.length > 0 ? "Action Required" : "Optimal"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              {card.icon}
            </div>
            {card.badge}
          </div>

          <div className="mt-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-800 dark:text-white/90 truncate">
              {card.value}
            </h3>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
