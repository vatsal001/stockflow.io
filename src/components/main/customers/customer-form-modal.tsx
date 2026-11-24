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
import { Customer } from "@/types/inventory";
import React, { useEffect, useState } from "react";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  customerToEdit,
}: CustomerFormModalProps) {
  const { addCustomer, updateCustomer } = useInventory();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerToEdit) {
        setName(customerToEdit.name);
        setCompanyName(customerToEdit.companyName);
        setEmail(customerToEdit.email);
        setPhone(customerToEdit.phone);
        setAddress(customerToEdit.address);
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
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Contact person name is required.");
      return;
    }
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
    } else {
      addCustomer({
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
            {customerToEdit ? "Edit Customer Profile" : "Add New Customer"}
          </DialogTitle>
          <p className="text-xs text-gray-500">
            {customerToEdit
              ? "Update client corporate contact and billing information."
              : "Register a new client enterprise account in the customer database."}
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
              <Label>Company Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Acme Technologies"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Primary Contact Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Vikram Malhotra"
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
                placeholder="billing@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Phone Number</Label>
              <Input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <Label>Billing / Delivery Address</Label>
            <Textarea
              placeholder="Street, suite, city, state, postal code"
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
              {customerToEdit ? "Save Changes" : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
