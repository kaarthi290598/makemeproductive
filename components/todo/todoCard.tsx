import React, { useTransition } from "react";
import { CheckCircle, Circle } from "lucide-react";

import { Categories, Category, Todo } from "@/lib/types/type";
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
      className={`flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-md transition-all ${
        todo.isCompleted ? "bg-muted" : ""
      }`}
    >
      {/* Completion Toggle */}
      <div
        onClick={toggleCompletion}
        className="mr-3 cursor-pointer text-muted-foreground"
      >
        {isPending ? (
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        ) : todo.isCompleted ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <Circle className="text-muted-foreground" />
        )}
      </div>

      {/* Todo Content */}
      <div className="flex flex-1 flex-col">
        <h3
          className={`text-lg font-semibold transition-colors ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {todo.name}
        </h3>
        <p
          className={`text-sm transition-colors ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-muted-foreground"
          }`}
        >
          {todo.category?.category}
        </p>
      </div>

      {/* Deadline */}

      <div className="flex items-center gap-3">
        {todo.deadline && (
          <span
            className={`rounded-md bg-muted px-2 py-1 text-sm transition-colors ${
              todo.isCompleted
                ? "text-muted-foreground line-through"
                : "text-foreground"
            } ${isDeadlineCompleted && "bg-red-500 text-white"} `}
          >
            {new Date(todo.deadline).toLocaleDateString()}
          </span>
        )}
        <EditDeleteButton todo={todo} categories={categories} />
      </div>
    </div>
  );
};

export default TodoCard;
