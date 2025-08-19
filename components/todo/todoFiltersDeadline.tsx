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
          variant={"secondary"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Deadline Date filter</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleFilterChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default TodoFilterDeadline;
