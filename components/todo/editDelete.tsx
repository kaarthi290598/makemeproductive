import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Categories, Todo } from "@/lib/types/type";
import { TodoAddEditTaskForm } from "./TodoAddEditTaskForm";
import { toast } from "sonner";
import { deleteTodo } from "@/lib/actions/todosData";
import { useMutation } from "@tanstack/react-query";
import { ResponsiveModal } from "./responsiveTodoAddEditModal";

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
      toast.error(`Error Deleting Task: ${err.message}`);
    },
  });

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
            aria-label="Open menu"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-xl">
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="gap-2 rounded-lg text-sm"
          >
            <Pencil className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => deleteTodoMutate(todo.id)}
            className="gap-2 rounded-lg text-sm text-destructive focus:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reusable Responsive Modal */}
      <ResponsiveModal
        open={open}
        setOpen={setOpen}
        title="Edit Task"
        description="Make changes to your todo here. Click save when you're done."
      >
        <TodoAddEditTaskForm
          setOpen={setOpen}
          todo={todo}
          categories={categories}
          isEdit={true}
        />
      </ResponsiveModal>
    </>
  );
}
