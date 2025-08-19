import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { Categories, Todo } from "@/lib/types/type";
import { TodoAddEditTaskForm } from "./TodoAddEditTaskForm";
import { toast } from "sonner";
import { deleteTodo } from "@/lib/actions/todosData";
import { useMutation } from "@tanstack/react-query";

export function EditDeleteButton({
  todo,
  categories,
}: {
  todo: Todo;
  categories: Categories;
}) {
  const [open, setOpen] = React.useState(false);
  const { mutate: deleteTodoMutate } = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      setOpen(false);
      toast.success("Task Deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Error Deleted Task: ${err.message}`);
    },
  });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteTodoMutate(todo.id)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for Editing */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your todo here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <TodoAddEditTaskForm
            setOpen={setOpen}
            todo={todo}
            categories={categories}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
