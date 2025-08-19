import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
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
