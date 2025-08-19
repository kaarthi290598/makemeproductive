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

import { Eraser } from "lucide-react";
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
      <Tabs defaultValue="add" className="w-full rounded-lg bg-sidebar p-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="add">Add</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
          <TabsTrigger value="delete">Delete/Reset</TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-muted-foreground">
              Add tasks/Categories
            </h3>
            <div className="flex flex-col gap-4">
              <TodoAddTask categories={categories} />
              <TodoAddCategory />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="filter" className="mt-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-muted-foreground">Filters</h3>
            <div className="flex flex-col gap-4">
              <TodoFilterCategory
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                categories={categories}
              />
              <TodoFilterDeadline date={date} setDate={setDate} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="delete" className="mt-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-muted-foreground">Delete/Reset</h3>
            <div className="flex flex-col gap-4">
              <DeleteCompleteTasksButton todos={todos} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={resetFilters}
                      variant="secondary"
                      className="flex items-center justify-center"
                    >
                      Reset Filter <Eraser className="ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset All Filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop view (multi-column)
  return (
    <div className="flex flex-col gap-10 overflow-auto rounded-md bg-sidebar p-4 md:flex-row">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Add tasks/Categories</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <TodoAddTask categories={categories} />
          <TodoAddCategory />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Filters</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <TodoFilterCategory
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
            categories={categories}
          />
          <TodoFilterDeadline date={date} setDate={setDate} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Delete/Reset</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <DeleteCompleteTasksButton todos={todos} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={resetFilters} variant="secondary">
                  Reset Filter <Eraser className="ml-2" />
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
