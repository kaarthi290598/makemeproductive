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
            "h-9 max-w-[150px] justify-start gap-2 rounded-xl border-slate-200 text-left text-sm font-semibold shadow-sm dark:border-slate-700 sm:max-w-none",
            !date && "text-slate-400",
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-slate-400" />
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
      <PopoverContent className="w-[min(calc(100vw-1.5rem),20.5rem)] rounded-xl p-0 sm:w-auto" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleFilterChange}
          numberOfMonths={1}
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  );
};

export default TodoFilterDeadline;
