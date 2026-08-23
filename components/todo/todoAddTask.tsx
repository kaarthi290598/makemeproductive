"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "./TodoAddEditTaskForm";
import { Categories } from "@/lib/types/type";
import { PlusCircle } from "lucide-react";

export default function TodoAddTask({
  categories,
}: {
  categories: Categories;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TaskDialog
      open={open}
      setOpen={setOpen}
      categories={categories}
      trigger={
        <Button
          size="sm"
          className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500"
        >
          <PlusCircle className="size-4" />
          <span>Add Task</span>
        </Button>
      }
    />
  );
}
