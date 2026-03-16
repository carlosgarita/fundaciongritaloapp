"use client";

import { forwardRef, type SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, id: externalId, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = externalId ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "w-full h-12 rounded-xl border bg-white px-4 pr-10 text-sm text-text-primary transition-colors duration-150 appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              error
                ? "border-accent-red focus:ring-accent-red/20 focus:border-accent-red"
                : "border-border",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-accent-red"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
export type { SelectProps };
