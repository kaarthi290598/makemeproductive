"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
};

export function CustomDatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-full min-w-0 justify-start overflow-hidden rounded-xl text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 shrink-0" />
          <span className="truncate">
            {value ? format(value, "d MMM yyyy") : "Pick a date"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="z-[9999] w-auto max-w-[calc(100vw-1.5rem)] rounded-md border bg-background p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={16}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false); // auto-close after picking
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
