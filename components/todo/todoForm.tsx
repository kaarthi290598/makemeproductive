"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import TodoAddTask from "./todoAddTask";
import TodoAddCategory from "./todoAddCategory";
import TodoFilterCategory from "./todoFiltersCategory";
import TodoFilterDeadline from "./todoFiltersDeadline";
import DeleteCompleteTasksButton from "./deleteCompleteTasksButton";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Eraser, Filter, Plus, Trash2 } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { Category, Todos } from "@/lib/types/type";

// Import shadcn Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom hook to detect mobile/tablet view
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

const TodoForm = ({
  categories,
  todos,
}: {
  categories: Category[];
  todos: Todos;
}) => {
  const [selectedValue, setSelectedValue] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const hasActiveFilters = !!selectedValue || (!!date?.from && !!date?.to);

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

  // Mobile/Tablet Tab View
  if (isMobile) {
    return (
      <Tabs
        defaultValue="add"
        className="w-full rounded-xl border border-border/50 bg-card p-3 shadow-sm"
      >
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="add"
            className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Plus className="size-3.5" /> Add
          </TabsTrigger>
          <TabsTrigger
            value="filter"
            className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Filter className="size-3.5" /> Filter
            {hasActiveFilters && (
              <span className="flex size-1.5 rounded-full bg-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="actions"
            className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Trash2 className="size-3.5" /> Actions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-3">
          <div className="flex flex-col gap-3">
            <TodoAddTask categories={categories} />
            <TodoAddCategory />
          </div>
        </TabsContent>
        <TabsContent value="filter" className="mt-3">
          <div className="flex flex-col gap-3">
            <TodoFilterCategory
              selectedValue={selectedValue}
              setSelectedValue={setSelectedValue}
              categories={categories}
            />
            <TodoFilterDeadline date={date} setDate={setDate} />
            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
                className="self-start text-xs text-muted-foreground hover:text-foreground"
              >
                <Eraser className="mr-1.5 size-3.5" />
                Clear all filters
              </Button>
            )}
          </div>
        </TabsContent>
        <TabsContent value="actions" className="mt-3">
          <div className="flex flex-col gap-3">
            <DeleteCompleteTasksButton todos={todos} />
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop view
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm">
      {/* Add Section */}
      <div className="flex items-center gap-2">
        <TodoAddTask categories={categories} />
        <TodoAddCategory />
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border/60" />

      {/* Filter Section */}
      <div className="flex items-center gap-2">
        <TodoFilterCategory
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          categories={categories}
        />
        <TodoFilterDeadline date={date} setDate={setDate} />
      </div>

      {/* Active filter indicator + reset */}
      {hasActiveFilters && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <Eraser className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset All Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Delete Section */}
      <DeleteCompleteTasksButton todos={todos} />
    </div>
  );
};

export default TodoForm;
