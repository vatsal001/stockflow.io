"use client";

import { CalendarIcon } from "@/icons";
import { cn } from "@/utils";
import flatpickr from "flatpickr";
import React, { useEffect, useRef } from "react";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined, dateString: string) => void;
  placeholder?: string;
  className?: string;
  enableTime?: boolean;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  enableTime = false,
  disabled = false,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      defaultDate: value ? new Date(value) : undefined,
      enableTime,
      dateFormat: enableTime ? "M d, Y h:i K" : "M d, Y",
      onChange: (selectedDates, dateStr) => {
        if (onChange) {
          onChange(selectedDates[0], dateStr);
        }
      },
    });

    return () => {
      fpRef.current?.destroy();
    };
  }, [enableTime, onChange, value]);

  useEffect(() => {
    if (fpRef.current && value) {
      fpRef.current.setDate(new Date(value), false);
    }
  }, [value]);

  return (
    <div className={cn("relative inline-block w-full min-w-[200px]", className)}>
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 ps-3.5 pe-10 text-xs font-normal text-gray-800 shadow-theme-xs outline-none transition-colors duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100/50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:hover:border-gray-600"
        )}
      />
      <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 dark:text-gray-500">
        <CalendarIcon className="size-4" />
      </span>
    </div>
  );
}
