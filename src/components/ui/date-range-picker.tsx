"use client";

import { CalendarIcon } from "@/icons";
import { cn } from "@/utils";
import flatpickr from "flatpickr";
import React, { useEffect, useRef, useState } from "react";

export type DatePresetKey =
  | "all"
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "thisMonth"
  | "lastMonth";

interface DateRangePickerProps {
  onRangeChange?: (startDate?: Date, endDate?: Date, presetKey?: DatePresetKey) => void;
  className?: string;
  defaultPreset?: DatePresetKey;
}

function calculatePresetRange(preset: DatePresetKey): [Date | undefined, Date | undefined] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (preset === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return [start, today];
  }
  if (preset === "yesterday") {
    const yesterdayTime = today.getTime() - 24 * 60 * 60 * 1000;
    const start = new Date(yesterdayTime);
    start.setHours(0, 0, 0, 0);
    const end = new Date(yesterdayTime);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  if (preset === "7d") {
    const sevenDaysAgo = today.getTime() - 6 * 24 * 60 * 60 * 1000;
    const start = new Date(sevenDaysAgo);
    start.setHours(0, 0, 0, 0);
    return [start, today];
  }
  if (preset === "30d") {
    const thirtyDaysAgo = today.getTime() - 29 * 24 * 60 * 60 * 1000;
    const start = new Date(thirtyDaysAgo);
    start.setHours(0, 0, 0, 0);
    return [start, today];
  }
  if (preset === "thisMonth") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return [start, today];
  }
  if (preset === "lastMonth") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    return [start, end];
  }
  return [undefined, undefined]; // "all"
}

export default function DateRangePicker({
  onRangeChange,
  className,
  defaultPreset = "all",
}: DateRangePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      mode: "range",
      dateFormat: "M d, Y",
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setSelectedPreset("all");
          if (onRangeChange) {
            onRangeChange(selectedDates[0], selectedDates[1], "all");
          }
        }
      },
    });

    return () => {
      fpRef.current?.destroy();
    };
  }, [onRangeChange]);

  const handlePresetSelect = (preset: DatePresetKey) => {
    setSelectedPreset(preset);
    const [start, end] = calculatePresetRange(preset);
    if (fpRef.current) {
      if (start && end) {
        fpRef.current.setDate([start, end], false);
      } else {
        fpRef.current.clear();
      }
    }
    if (onRangeChange) {
      onRangeChange(start, end, preset);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Quick Preset Buttons */}
      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 dark:border-gray-800 dark:bg-gray-800/60">
        {[
          { key: "all" as DatePresetKey, label: "All Time" },
          { key: "today" as DatePresetKey, label: "Today" },
          { key: "7d" as DatePresetKey, label: "Last 7 Days" },
          { key: "30d" as DatePresetKey, label: "Last 30 Days" },
          { key: "thisMonth" as DatePresetKey, label: "This Month" },
        ].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePresetSelect(p.key)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
              selectedPreset === p.key
                ? "bg-white text-gray-900 shadow-theme-xs font-semibold dark:bg-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Range Input Trigger */}
      <div className="relative inline-block min-w-[220px]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Select custom date range..."
          className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-1.5 ps-3 pe-8 text-xs font-medium text-gray-800 shadow-theme-xs outline-none transition-colors duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
        <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2.5 text-gray-400 dark:text-gray-500">
          <CalendarIcon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}
