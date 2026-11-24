"use client";

import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/context/inventory-context";
import { Product } from "@/types/inventory";
import React, { useEffect, useState } from "react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
}: ProductFormModalProps) {
  const { addProduct, updateProduct, settings } = useInventory();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Accessories");
  const [unit, setUnit] = useState("pcs");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [currentStock, setCurrentStock] = useState<number | "">("");
  const [minimumStock, setMinimumStock] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productToEdit) {
        setName(productToEdit.name);
        setSku(productToEdit.sku);
        setCategory(productToEdit.category);
        setUnit(productToEdit.unit);
        setPurchasePrice(productToEdit.purchasePrice);
        setSellingPrice(productToEdit.sellingPrice);
        setCurrentStock(productToEdit.currentStock);
        setMinimumStock(productToEdit.minimumStock);
        setDescription(productToEdit.description || "");
      } else {
        setName("");
        setSku(`SKU-${Date.now().toString().slice(-6)}`);
        setCategory("Accessories");
        setUnit("pcs");
        setPurchasePrice("");
        setSellingPrice("");
        setCurrentStock("");
        setMinimumStock("");
        setDescription("");
      }
      setError(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [productToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product Name is required.");
      return;
    }
    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (purchasePrice === "" || Number(purchasePrice) < 0) {
      setError("Please provide a valid non-negative purchase price.");
      return;
    }
    if (sellingPrice === "" || Number(sellingPrice) < 0) {
      setError("Please provide a valid non-negative selling price.");
      return;
    }
    if (currentStock === "" || Number(currentStock) < 0) {
      setError("Current stock cannot be negative.");
      return;
    }
    if (minimumStock === "" || Number(minimumStock) < 0) {
      setError("Minimum stock cannot be negative.");
      return;
    }

    if (productToEdit) {
      const res = updateProduct(productToEdit.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        unit,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minimumStock: Number(minimumStock),
        description: description.trim(),
      });
      if (!res.success) {
        setError(res.error || "Failed to update product.");
        return;
      }
    } else {
      const res = addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        unit,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minimumStock: Number(minimumStock),
        description: description.trim(),
      });
      if (!res.success) {
        setError(res.error || "Failed to add product.");
        return;
      }
    }

    onClose();
  };

  const categories = [
    "Accessories",
    "Cables",
    "Monitors",
    "Audio",
    "Furniture",
    "Power",
    "Storage",
    "Networking",
  ];

  const units = ["pcs", "box", "set", "pack", "meter", "kg"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productToEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {productToEdit
              ? "Update product pricing, stock parameters and metadata."
              : "Register a new item into the inventory catalog."}
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200 dark:border-error-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field>
            <Label>Product Name *</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Logitech MX Master 3S"
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <Label>SKU / Barcode *</Label>
              <Input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. ACC-MOU-001"
                required
              />
            </Field>

            <Field>
              <Label>Category</Label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={categories}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <Label>Unit of Measure</Label>
              <CustomSelect
                value={unit}
                onChange={(val) => setUnit(val)}
                options={units}
                triggerClassName="w-full h-10"
                className="w-full"
              />
            </Field>

            <Field>
              <Label>Purchase Cost ({settings.currency}) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) =>
                  setPurchasePrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="0.00"
                required
              />
            </Field>

            <Field>
              <Label>Selling Price ({settings.currency}) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) =>
                  setSellingPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="0.00"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <Label>
                {productToEdit ? "Current Stock Level *" : "Opening Stock Quantity *"}
              </Label>
              <Input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) =>
                  setCurrentStock(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="0"
                required
              />
            </Field>

            <Field>
              <Label>Minimum Stock Alert Level *</Label>
              <Input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) =>
                  setMinimumStock(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 10"
                required
              />
            </Field>
          </div>

          <Field>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Item specifications, model code, packaging details..."
              rows={2}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {productToEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
