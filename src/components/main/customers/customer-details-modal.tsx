"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import { Customer, Sale } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSelectSale?: (sale: Sale) => void;
}

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onSelectSale,
}: CustomerDetailsModalProps) {
  const { sales, settings } = useInventory();

  if (!customer) return null;

  const customerSales = sales.filter((s) => s.customerId === customer.id);
  const totalSpent = customerSales.reduce((acc, s) => acc + s.grandTotal, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pe-8">
            <div>
              <DialogTitle className="text-xl font-bold">
                {customer.companyName}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Primary Contact: {customer.name} · Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
            <Badge color="primary">Client Account</Badge>
          </div>
        </DialogHeader>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/3">
          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Total Invoices
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {customerSales.length}
            </p>
            <span className="text-[10px] text-gray-400">All-time order count</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Total Purchase Value
            </span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(totalSpent, settings.currency, settings.currencyCode)}
            </p>
            <span className="text-[10px] text-gray-400">Cumulative revenue</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Contact Channels
            </span>
            <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
              {customer.email}
            </p>
            <p className="text-[11px] text-gray-500">{customer.phone || "No phone registered"}</p>
          </div>
        </div>

        {customer.address && (
          <div className="rounded-xl border border-gray-100 p-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
            <strong>Address:</strong> {customer.address}
          </div>
        )}

        {/* Customer Sales History */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Customer Sales & Invoicing History ({customerSales.length})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            {customerSales.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">
                No sales invoices found for this customer.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
                  <TableRow>
                    <TableCell isHeader className="py-2.5 ps-4 text-start">
                      Invoice #
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-start">
                      Date
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-start">
                      Items
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-end">
                      Total
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-center">
                      Payment
                    </TableCell>
                    <TableCell isHeader className="py-2.5 pe-4 text-end">
                      Details
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
                  {customerSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="py-3 ps-4 font-mono font-medium text-brand-600">
                        {sale.invoiceNumber}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500">
                        {formatDate(sale.date)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-300">
                        {sale.items.length} item(s)
                      </TableCell>
                      <TableCell className="py-3 text-end font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          sale.grandTotal,
                          settings.currency,
                          settings.currencyCode
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge
                          color={
                            sale.paymentStatus === "Paid"
                              ? "success"
                              : sale.paymentStatus === "Partial"
                              ? "warning"
                              : "error"
                          }
                          size="sm"
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 pe-4 text-end">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            if (onSelectSale) onSelectSale(sale);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
