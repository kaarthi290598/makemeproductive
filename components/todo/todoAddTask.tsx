"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TodoAddEditTaskForm } from "./TodoAddEditTaskForm";
import { Categories } from "@/lib/types/type";
import { ResponsiveModal } from "./responsiveTodoAddEditModal";

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
        <Button variant="secondary">
          <Plus className="mr-2" /> Add Task
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
