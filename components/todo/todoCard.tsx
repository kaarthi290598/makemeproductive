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
import { TaskDialog } from "./TodoAddEditTaskForm";
import { cn } from "@/lib/utils";

export const TodoCard = ({
  todo,
  categories,
}: {
  todo: Todo;
  categories: Categories;
}) => {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = React.useState(false);

  const toggleCompletion = () => {
    startTransition(async () => {
      await toggleTodo(todo.id);
    });
  };

  const isOverdue =
    todo.isCompleted === false &&
    todo?.deadline &&
    new Date(todo.deadline) < new Date();

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-all duration-200 hover:shadow-sm dark:bg-slate-900 lg:px-4 lg:py-3",
        todo.isCompleted
          ? "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800",
        isOverdue && "border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20",
      )}
    >
      {/* Drag Handle */}
      <GripVertical className="size-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400" />

      {/* Completion Toggle */}
      <button
        onClick={toggleCompletion}
        className="shrink-0 transition-transform hover:scale-110 focus:outline-none"
        aria-label={
          todo.isCompleted ? "Mark as incomplete" : "Mark as complete"
        }
      >
        {isPending ? (
          <div className="size-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        ) : todo.isCompleted ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <Circle className="size-5 text-slate-300 transition-colors hover:text-emerald-600" />
        )}
      </button>

      {/* Todo Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3
          className={cn(
            "truncate text-sm font-medium transition-colors",
            todo.isCompleted
              ? "text-slate-400 line-through"
              : "text-slate-900 dark:text-white",
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
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
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
                  ? "text-slate-400 line-through"
                  : isOverdue
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                    : "text-slate-500",
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
      <div className="shrink-0 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <EditDeleteButton todo={todo} onEdit={() => setEditOpen(true)} />
      </div>
      <TaskDialog
        open={editOpen}
        setOpen={setEditOpen}
        todo={todo}
        categories={categories}
      />
    </div>
  );
};

export default TodoCard;
