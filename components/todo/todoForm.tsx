"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import TodoAddCategory from "./todoAddCategory";
import TodoFilterCategory from "./todoFiltersCategory";
import TodoFilterDeadline from "./todoFiltersDeadline";
import DeleteCompleteTasksButton from "./deleteCompleteTasksButton";
import { Eraser } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { Category, Todos } from "@/lib/types/type";

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

  const hasActiveFilters = !!selectedValue || (!!date?.from && !!date?.to);

  function resetFilters() {
    setSelectedValue("");
    setDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("from");
    params.delete("to");
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex w-max min-w-full flex-nowrap items-center justify-end gap-2 sm:w-full sm:flex-wrap">
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
          size="icon"
          className="size-9 rounded-xl text-slate-400 hover:text-slate-700"
        >
          <Eraser className="size-4" />
        </Button>
      )}
      <TodoAddCategory />
      <DeleteCompleteTasksButton todos={todos} />
    </div>
  );
};

export default TodoForm;
