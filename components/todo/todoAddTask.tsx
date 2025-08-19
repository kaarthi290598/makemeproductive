import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";
// import { TodoAddTaskForm } from "./TodoAddTaskFormbackup";
import { fetchCategories } from "@/lib/actions/todosData";
import { TodoAddEditTaskForm } from "./TodoAddEditTaskForm";
import { Categories } from "@/lib/types/type";

const TodoAddTask = ({ categories }: { categories: Categories }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus /> Add Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <TodoAddEditTaskForm
          setOpen={setOpen}
          categories={categories}
          isEdit={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TodoAddTask;
