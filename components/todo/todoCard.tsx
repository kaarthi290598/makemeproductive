import React, { useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Folder,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

import { Categories, Todo } from "@/lib/types/type";
import { toggleTodo } from "@/lib/actions/todosData";
import { EditDeleteButton } from "./editDelete";
import { cn } from "@/lib/utils";

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

  const isOverdue =
    todo.isCompleted === false &&
    todo?.deadline &&
    new Date(todo.deadline) < new Date();

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-background px-3 py-2.5 transition-all duration-200 hover:shadow-sm lg:px-4 lg:py-3",
        todo.isCompleted
          ? "border-border/30 bg-muted/30"
          : "border-border/50 hover:border-border",
        isOverdue && "border-destructive/30 bg-destructive/5",
      )}
    >
      {/* Drag Handle */}
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />

      {/* Completion Toggle */}
      <button
        onClick={toggleCompletion}
        className="shrink-0 transition-transform hover:scale-110 focus:outline-none"
        aria-label={
          todo.isCompleted ? "Mark as incomplete" : "Mark as complete"
        }
      >
        {isPending ? (
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : todo.isCompleted ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <Circle className="size-5 text-muted-foreground/50 transition-colors hover:text-primary" />
        )}
      </button>

      {/* Todo Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3
          className={cn(
            "truncate text-sm font-medium transition-colors",
            todo.isCompleted
              ? "text-muted-foreground/60 line-through"
              : "text-foreground",
          )}
        >
          {todo.name}
        </h3>

        <div className="flex items-center gap-3">
          {/* Category Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
              todo.isCompleted
                ? "bg-muted text-muted-foreground/50"
                : "bg-primary/8 text-primary/70",
            )}
          >
            <Folder className="size-2.5" />
            {todo.category ? todo.category.category : "Uncategorized"}
          </span>

          {/* Deadline */}
          {todo.deadline && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                todo.isCompleted
                  ? "text-muted-foreground/50 line-through"
                  : isOverdue
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {isOverdue ? (
                <AlertTriangle className="size-2.5" />
              ) : (
                <Calendar className="size-2.5" />
              )}
              {new Date(todo.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <EditDeleteButton todo={todo} categories={categories} />
      </div>
    </div>
  );
};

export default TodoCard;
