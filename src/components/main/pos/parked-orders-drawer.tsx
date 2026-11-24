"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInventory } from "@/context/inventory-context";
import { ClockIcon, TrashBinIcon, XIcon } from "@/icons";
import { ParkedOrder } from "@/types/inventory";
import React from "react";

interface ParkedOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: (order: ParkedOrder) => void;
}

export default function ParkedOrdersDrawer({ isOpen, onClose, onResume }: ParkedOrdersDrawerProps) {
  const { parkedOrders, deleteParkedOrder, settings } = useInventory();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden sm:max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ClockIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Held Carts (Suspended Orders)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {parkedOrders.length} order(s) currently suspended
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

        {/* List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {parkedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <ClockIcon className="w-10 h-10 mx-auto stroke-1 opacity-50 mb-2" />
              <p className="text-sm font-medium">No held carts.</p>
              <p className="text-xs mt-1">When customers step away, click &ldquo;Hold Order&rdquo; to suspend their cart.</p>
            </div>
          ) : (
            parkedOrders.map((order) => {
              const formattedTime = new Date(order.parkedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={order.id}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-brand-300 dark:hover:border-brand-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {order.customerName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Held at {formattedTime} • {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {settings.currency} {order.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg space-y-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span>{settings.currency}{item.lineTotal.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-xs italic text-gray-500">&ldquo;{order.notes}&rdquo;</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteParkedOrder(order.id)}
                      className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40 text-xs gap-1"
                    >
                      <TrashBinIcon className="w-3.5 h-3.5" />
                      Discard
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onResume(order);
                        onClose();
                      }}
                      className="text-xs"
                    >
                      Resume Cart
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
