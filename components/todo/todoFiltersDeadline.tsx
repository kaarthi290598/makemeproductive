"use client";
import React from "react";

import { cn } from "@/lib/utils";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

const TodoFilterDeadline = ({
  date,
  setDate,
}: {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const setFilter = (value: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value?.from && value.to) {
      params.set("from", format(value.from, "yyyy-MM-dd"));
      params.set("to", format(value.to, "yyyy-MM-dd"));
    } else {
      params.delete("from");
      params.delete("to");
    }

    replace(`${pathname}?${params.toString()}`);
  };
  React.useEffect(() => {
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    if (fromDate && toDate) {
      setDate({
        from: new Date(fromDate),
        to: new Date(toDate),
      });
    }
  }, [searchParams, setDate]);

  function handleFilterChange(value: DateRange | undefined) {
    console.log(value);
    setDate(value);

    setFilter(value);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "h-9 justify-start gap-2 rounded-lg border-border/60 text-left text-sm font-medium shadow-none transition-colors hover:bg-accent",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {date?.from ? (
            date.to ? (
              <span className="truncate">
                {format(date.from, "MMM d")} – {format(date.to, "MMM d, y")}
              </span>
            ) : (
              format(date.from, "MMM d, y")
            )
          ) : (
            <span>Deadline</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleFilterChange}
          numberOfMonths={2}
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  );
};

export default TodoFilterDeadline;
