import React, { useTransition } from "react";
import { CheckCircle, Circle, Calendar, Folder } from "lucide-react";

import { Categories, Todo } from "@/lib/types/type";
import { toggleTodo } from "@/lib/actions/todosData";
import { EditDeleteButton } from "./editDelete";

export const TodoCard = ({
  todo,
  categories,
}: {
  todo: Todo;
  categories: Categories;
}) => {
  const [isPending, startTransition] = useTransition();

  const toggleCompletion = () => {
    startTransition(() => {
      toggleTodo(todo.id);
    });
  };

  const isDeadlineCompleted =
    todo.isCompleted === false &&
    todo?.deadline &&
    new Date(todo.deadline) < new Date();

  return (
    <div
      className={`flex w-full items-center justify-between rounded-xl border bg-card px-3 py-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md lg:px-4 lg:py-4 ${
        todo.isCompleted ? "bg-muted" : ""
      }`}
    >
      {/* Completion Toggle */}
      <div
        onClick={toggleCompletion}
        className="mr-3 cursor-pointer text-muted-foreground"
      >
        {isPending ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : todo.isCompleted ? (
          <CheckCircle className="h-6 w-6 text-green-500 transition-transform hover:scale-110" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground transition-transform hover:scale-110" />
        )}
      </div>

      {/* Todo Content */}
      <div className="flex flex-1 flex-col">
        <h3
          className={`line-clamp-1 text-sm font-semibold transition-colors sm:text-base md:text-lg ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {todo.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <Folder className="h-3 w-3" />
          <span
            className={`transition-colors ${
              todo.isCompleted ? "text-muted-foreground line-through" : ""
            }`}
          >
            {todo.category ? todo.category.category : "No category"}
          </span>
        </div>
      </div>

      {/* Deadline + Actions */}
      <div className="flex items-center gap-3">
        {todo.deadline && (
          <span
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors sm:text-sm ${
              todo.isCompleted
                ? "bg-muted text-muted-foreground line-through"
                : "bg-muted text-foreground"
            } ${isDeadlineCompleted && "!bg-red-500 !text-white"} `}
          >
            <Calendar className="h-3 w-3" />
            {new Date(todo.deadline).toLocaleDateString()}
          </span>
        )}
        <EditDeleteButton todo={todo} categories={categories} />
      </div>
    </div>
  );
};

export default TodoCard;
