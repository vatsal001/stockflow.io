"use client";

import { Button } from "@/components/ui/button";
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
import { Supplier } from "@/types/inventory";
import React, { useEffect, useState } from "react";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export default function SupplierFormModal({
  isOpen,
  onClose,
  supplierToEdit,
}: SupplierFormModalProps) {
  const { addSupplier, updateSupplier } = useInventory();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (supplierToEdit) {
        setName(supplierToEdit.name);
        setCompanyName(supplierToEdit.companyName);
        setEmail(supplierToEdit.email);
        setPhone(supplierToEdit.phone);
        setAddress(supplierToEdit.address);
      } else {
        setName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setAddress("");
      }
      setError(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [supplierToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Contact person name is required.");
      return;
    }
    if (!companyName.trim()) {
      setError("Company / Vendor name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, {
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
    } else {
      addSupplier({
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {supplierToEdit ? "Edit Supplier Profile" : "Add New Supplier"}
          </DialogTitle>
          <p className="text-xs text-gray-500">
            {supplierToEdit
              ? "Update vendor corporate credentials and procurement details."
              : "Register a verified procurement vendor into the trade database."}
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label>Company / Vendor Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Global Electronics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Account Representative *</Label>
              <Input
                type="text"
                placeholder="e.g. Rajesh Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="orders@vendor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Phone Number</Label>
              <Input
                type="text"
                placeholder="+91 97111 88990"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <Label>Factory / Dispatch Warehouse Address</Label>
            <Textarea
              placeholder="Industrial area, city, state, postal code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {supplierToEdit ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
