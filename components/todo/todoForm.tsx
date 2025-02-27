"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import TodoAddTask from "./todoAddTask";
import TodoAddCategory from "./todoAddCategory";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Eraser } from "lucide-react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import TodoFilterCategory from "./todoFiltersCategory";
import TodoFilterDeadline from "./todoFiltersDeadline";
import { DateRange } from "react-day-picker";
import DeleteCompleteTasksButton from "./deleteCompleteTasksButton";

const TodoForm = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const [date, setDate] = React.useState<DateRange | undefined>();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function resetFilters() {
    setSelectedValue("");
    setDate(undefined);

    // Clear all filter-related parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("from");
    params.delete("to");

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-4 rounded-md bg-sidebar p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Add tasks/Categories</h3>

        {/* ADD BUTTONS */}
        <div className="flex gap-4">
          <TodoAddTask />
          <TodoAddCategory />
        </div>
      </div>

      {/* FILTERS */}

      <div className="mr-3 flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Filters</h3>

        <div className="flex gap-4">
          <TodoFilterCategory
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
          <TodoFilterDeadline date={date} setDate={setDate} />
        </div>
      </div>

      {/* RESET BUTTONS */}
      <div className="mr-3 flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Delete/Reset</h3>

        <div className="flex gap-4">
          <DeleteCompleteTasksButton />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => resetFilters()} variant="secondary">
                  Reset Filter <Eraser />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset All Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TodoForm;
