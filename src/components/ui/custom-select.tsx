"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  size = "sm",
  disabled = false,
}: CustomSelectProps) {
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className={cn("inline-block", className)}>
      <Select
        value={value}
        onValueChange={(val) => {
          if (val !== null) onChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          size={size}
          className={cn(
            "min-w-[130px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 hover:border-brand-500 transition-colors",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder}>
            {(val: string | null | undefined) => {
              const activeVal = val ?? value;
              if (!activeVal) return placeholder;
              const found = normalizedOptions.find((opt) => opt.value === activeVal);
              return found ? found.label : placeholder;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[150px] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-lg">
          {normalizedOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs py-2 px-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
