"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInventory } from "@/context/inventory-context";
import { CheckCircleIcon, PrinterIcon, XIcon } from "@/icons";
import { Sale } from "@/types/inventory";
import React from "react";

interface ThermalReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThermalReceiptModal({ sale, isOpen, onClose }: ThermalReceiptModalProps) {
  const { settings } = useInventory();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(sale.date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-400">
              <CheckCircleIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sale Completed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">80mm POS Thermal Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Scrollable Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 flex justify-center bg-gray-100 dark:bg-gray-950/60">
          <div
            id="pos-thermal-receipt"
            className="w-[320px] bg-white text-gray-900 p-5 shadow-md border border-gray-200 rounded-sm font-mono text-xs leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-bold uppercase tracking-wider">{settings.businessName}</h2>
              <p className="text-[11px] text-gray-600 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-gray-600">Ph: {settings.phone}</p>
              <p className="text-[11px] text-gray-600">GSTIN / TAX: {settings.taxPercentage}% APPLICABLE</p>
            </div>

            {/* Meta info */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice:</span>
                <span className="font-semibold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date/Time:</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold truncate max-w-[170px]">{sale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Terminal:</span>
                <span>Counter POS-01</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="py-2 border-b border-dashed border-gray-400 font-semibold text-[11px] flex justify-between">
              <span className="w-1/2">ITEM</span>
              <span className="w-1/4 text-center">QTY</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>

            {/* Items Rows */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-medium truncate">{item.productName}</div>
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>{item.quantity} x {settings.currency}{item.unitPrice.toLocaleString("en-IN")}</span>
                    <span className="font-medium text-gray-900">{settings.currency}{item.lineTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{settings.currency}{sale.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{settings.currency}{sale.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax ({sale.taxRate}%)</span>
                <span>{settings.currency}{sale.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-300">
                <span>NET PAYABLE</span>
                <span>{settings.currency}{sale.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="font-semibold text-gray-700 uppercase text-[10px]">Payment Summary</div>
              {sale.paymentBreakdown ? (
                <>
                  {sale.paymentBreakdown.cash > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Cash Tendered</span>
                      <span>{settings.currency}{sale.paymentBreakdown.cash.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {sale.paymentBreakdown.upi > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>UPI QR</span>
                      <span>{settings.currency}{sale.paymentBreakdown.upi.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {sale.paymentBreakdown.card > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Card Swipe</span>
                      <span>{settings.currency}{sale.paymentBreakdown.card.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {sale.paymentBreakdown.bankTransfer > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Bank Transfer</span>
                      <span>{settings.currency}{sale.paymentBreakdown.bankTransfer.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-gray-600">
                  <span>Mode</span>
                  <span>{sale.paymentStatus}</span>
                </div>
              )}

              {typeof sale.tenderedAmount === "number" && sale.tenderedAmount > 0 && (
                <div className="flex justify-between text-gray-700 pt-1 font-medium">
                  <span>Cash Handed:</span>
                  <span>{settings.currency}{sale.tenderedAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {typeof sale.changeReturn === "number" && sale.changeReturn > 0 && (
                <div className="flex justify-between text-gray-900 font-bold">
                  <span>Change Return:</span>
                  <span>{settings.currency}{sale.changeReturn.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Simulated Barcode */}
            <div className="pt-3 pb-1 text-center">
              <div className="inline-flex items-center gap-[2px] h-8 justify-center">
                {[1, 3, 2, 1, 4, 1, 2, 3, 1, 3, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-black inline-block"
                  />
                ))}
              </div>
              <p className="text-[10px] tracking-widest text-gray-600 mt-1">{sale.invoiceNumber}</p>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 text-[10px] text-gray-500 border-t border-dotted border-gray-300">
              <p className="font-semibold text-gray-700">Thank you for your visit!</p>
              <p className="mt-0.5">Please retain this bill for warranty & returns.</p>
              <p className="mt-0.5">Items exchangeable within 7 days with invoice.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" onClick={handlePrint} className="gap-2">
            <PrinterIcon className="w-4 h-4" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
