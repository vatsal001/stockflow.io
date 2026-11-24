"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useRouter } from "@/i18n/navigation";
import {
  BoxIcon,
  CalendarIcon,
  HorizontalDotsIcon,
  MenuTwoIcon,
  SearchIcon,
  XIcon,
} from "@/icons";
import NotificationDropdown from "@/layout/header/notification-dropdown";
import ThemeToggleButton from "@/layout/header/theme-toggler";
import UserDropdown from "@/layout/header/user-dropdown";
import { cn } from "@/utils";
import flatpickr from "flatpickr";
import { useEffect, useRef, useState } from "react";

export default function AppHeader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (!dateInputRef.current) return;

    fpRef.current = flatpickr(dateInputRef.current, {
      defaultDate: new Date(),
      dateFormat: "D, M j, Y",
    });

    return () => {
      fpRef.current?.destroy();
    };
  }, []);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex w-full shrink-0 border-gray-200 bg-white xl:border-b dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-between xl:flex-row xl:px-6">
        {/* Left side content */}
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 xl:justify-normal xl:border-b-0 xl:px-0 xl:py-4 dark:border-gray-800">
          <Button
            variant="outline"
            size="icon"
            className="text-gray-500 lg:size-11 dark:text-gray-400"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {openMobile ? (
              <XIcon className="size-6" />
            ) : (
              <MenuTwoIcon className="size-auto! rtl:-scale-x-100" />
            )}
          </Button>

          <Link href="/" className="xl:hidden flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <BoxIcon className="size-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Stock<span className="text-brand-500">Flow</span>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleApplicationMenu}
            aria-label="Toggle application menu"
            className="text-gray-700 xl:hidden dark:text-gray-400"
          >
            <HorizontalDotsIcon />
          </Button>

          <div className="hidden xl:block">
            <form onSubmit={handleSearchSubmit}>
              <Field className="xl:w-100">
                <InputGroup className="border-gray-200 bg-transparent dark:border-gray-800 dark:bg-white/3">
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="size-5 text-gray-500 dark:text-gray-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, SKUs, invoices..."
                    className="text-gray-800 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                  <InputGroupAddon align="inline-end">
                    <Badge
                      variant="light"
                      color="gray"
                      size="sm"
                      className="cursor-pointer gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.75 py-[4.5px] text-xs tracking-[-0.2px] text-gray-500 shadow-none dark:border-gray-800 dark:bg-white/3 dark:text-gray-400"
                    >
                      <span>⌘</span>
                      <span>K</span>
                    </Badge>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </form>
          </div>
        </div>

        {/* Right side content */}
        <div
          className={cn(
            "flex w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md xl:flex xl:justify-end xl:px-0 xl:shadow-none",
            isApplicationMenuOpen ? "flex" : "hidden"
          )}
        >
          {/* Interactive Date Picker Pill */}
          <div className="hidden sm:flex items-center">
            <div className="relative flex items-center group">
              <CalendarIcon className="pointer-events-none absolute start-3 size-4 text-brand-500 z-1 group-hover:scale-110 transition-transform" />
              <input
                ref={dateInputRef}
                type="text"
                readOnly
                aria-label="Select system date"
                title="Click to view calendar or change active date"
                className="w-[160px] cursor-pointer rounded-xl border border-gray-200 bg-gray-50/80 ps-9 pe-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:border-gray-700 transition-all shadow-theme-xs outline-none select-none text-start"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
