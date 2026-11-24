"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import {
  calculateStockStatus,
  MovementType,
  Product,
} from "@/types/inventory";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import React, { useState } from "react";
import StockStatusBadge from "./stock-status-badge";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
}: ProductDetailsModalProps) {
  const { stockMovements, adjustStock, settings } = useInventory();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [newStockInput, setNewStockInput] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState<string | null>(null);

  if (!product) return null;

  const productMovements = stockMovements.filter(
    (m) => m.productId === product.id
  );

  const status = calculateStockStatus(product.currentStock, product.minimumStock);
  const margin =
    product.sellingPrice > 0
      ? ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) *
        100
      : 0;

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);

    if (newStockInput === "" || Number(newStockInput) < 0) {
      setAdjustError("Please specify a valid non-negative stock count.");
      return;
    }

    const res = adjustStock(
      product.id,
      Number(newStockInput),
      adjustReason || "Manual inventory count audit"
    );

    if (!res.success) {
      setAdjustError(res.error || "Failed to adjust stock.");
      return;
    }

    setIsAdjusting(false);
    setNewStockInput("");
    setAdjustReason("");
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case "Purchase In":
        return <Badge color="success">Purchase In</Badge>;
      case "Sale Out":
        return <Badge color="info">Sale Out</Badge>;
      case "Manual Adjustment":
        return <Badge color="warning">Adjustment</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pe-8">
            <div>
              <DialogTitle className="text-xl font-bold">
                {product.name}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">
                  SKU: {product.sku}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">
                  Category: {product.category}
                </span>
              </div>
            </div>
            <StockStatusBadge status={status} size="default" />
          </div>
        </DialogHeader>

        {/* Product Metric KPI Bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/3">
          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Current Stock
            </span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {product.currentStock} {product.unit}
            </p>
            <span className="text-[10px] text-gray-400">
              Min Threshold: {product.minimumStock} {product.unit}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Purchase Cost
            </span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {formatCurrency(
                product.purchasePrice,
                settings.currency,
                settings.currencyCode
              )}
            </p>
            <span className="text-[10px] text-gray-400">Unit base cost</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Selling Price
            </span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {formatCurrency(
                product.sellingPrice,
                settings.currency,
                settings.currencyCode
              )}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              Margin: {margin.toFixed(1)}%
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Inventory Value
            </span>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-0.5">
              {formatCurrency(
                product.currentStock * product.purchasePrice,
                settings.currency,
                settings.currencyCode
              )}
            </p>
            <span className="text-[10px] text-gray-400">At purchase cost</span>
          </div>
        </div>

        {product.description && (
          <div className="rounded-xl border border-gray-100 p-3.5 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description:
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Stock Adjustment Section */}
        <div className="pt-2">
          {!isAdjusting ? (
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Stock Movement Audit Ledger
              </h4>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setIsAdjusting(true);
                  setNewStockInput(product.currentStock);
                }}
              >
                Manual Stock Adjustment
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Adjust Physical Stock Count
              </h4>
              {adjustError && (
                <p className="text-xs text-error-600 mb-2">{adjustError}</p>
              )}
              <form onSubmit={handleAdjustSubmit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      New Total Stock ({product.unit}) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={newStockInput}
                      onChange={(e) =>
                        setNewStockInput(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      required
                    />
                  </Field>
                  <Field>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Reason for Adjustment
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Physical warehouse audit, Damaged goods"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsAdjusting(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="xs">
                    Apply Adjustment
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Stock Movements Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          {productMovements.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">
              No stock movements recorded for this product yet.
            </p>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell isHeader className="py-2.5 text-start">
                    Date & Time
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-start">
                    Reference
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-start">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-end">
                    Change
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-end">
                    Prev Stock
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-end">
                    Updated Stock
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
                {productMovements.map((mov) => {
                  const isPositive =
                    mov.type === "Purchase In" ||
                    (mov.type === "Manual Adjustment" &&
                      mov.updatedStock > mov.previousStock);
                  return (
                    <TableRow
                      key={mov.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/2"
                    >
                      <TableCell className="py-2.5 whitespace-nowrap text-gray-500">
                        {formatDateTime(mov.date)}
                      </TableCell>
                      <TableCell className="py-2.5 font-mono font-medium text-gray-800 dark:text-gray-200">
                        {mov.reference}
                      </TableCell>
                      <TableCell className="py-2.5">
                        {getMovementBadge(mov.type)}
                      </TableCell>
                      <TableCell className="py-2.5 text-end font-bold">
                        <span
                          className={
                            isPositive ? "text-emerald-600" : "text-error-600"
                          }
                        >
                          {isPositive ? "+" : "-"}
                          {mov.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-end text-gray-500">
                        {mov.previousStock}
                      </TableCell>
                      <TableCell className="py-2.5 text-end font-semibold text-gray-900 dark:text-white">
                        {mov.updatedStock}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
