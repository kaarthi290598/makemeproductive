"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TodoAddEditTaskForm } from "./TodoAddEditTaskForm";
import { Categories } from "@/lib/types/type";
import { ResponsiveModal } from "./responsiveTodoAddEditModal";
import { PlusCircle } from "lucide-react";

export default function TodoAddTask({
  categories,
}: {
  categories: Categories;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ResponsiveModal
      open={open}
      setOpen={setOpen}
      title="Add Task"
      description="Create a new task and assign it to a category."
      trigger={
        <Button size="sm" className="h-9 gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm">
          <PlusCircle className="size-4" />
          <span>Add Task</span>
        </Button>
      }
    >
      <TodoAddEditTaskForm
        setOpen={setOpen}
        categories={categories}
        isEdit={false}
      />
    </ResponsiveModal>
  );
}
