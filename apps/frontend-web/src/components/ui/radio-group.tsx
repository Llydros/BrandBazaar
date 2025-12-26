"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

function RadioGroup({
  value,
  onValueChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="radiogroup"
        className={cn("space-y-2", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({
  value: itemValue,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}) {
  const context = React.useContext(RadioGroupContext);
  const isSelected = context.value === itemValue;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && "border-primary bg-primary",
        className
      )}
      onClick={() => context.onValueChange?.(itemValue)}
      {...props}
    >
      {isSelected && (
        <div className="flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
        </div>
      )}
    </button>
  );
}

export { RadioGroup, RadioGroupItem };

