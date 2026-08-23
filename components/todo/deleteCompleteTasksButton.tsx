"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompletedTodos } from "@/lib/actions/todosData";
import { Todos } from "@/lib/types/type";
import { toast } from "sonner";
import { consoleDialogClass } from "@/components/finance/page-header";

const DeleteCompleteTasksButton = ({ todos }: { todos: Todos }) => {
  const completedTasks = todos.filter((todo) => todo.isCompleted);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: DeleteCompletedTasks, isPending } = useMutation({
    mutationFn: deleteCompletedTodos,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Completed tasks deleted successfully!");
    },
  });

  const handleDeleteClick = () => {
    if (completedTasks.length === 0) {
      toast.error("No completed tasks to delete!");
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteClick}
        title="Delete completed"
        className="h-9 gap-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
      >
        <Trash2 className="size-4" />
        <span className="hidden sm:inline">Delete completed</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={consoleDialogClass}>
          <DialogHeader className="shrink-0 space-y-0.5 border-b border-slate-100 px-4 py-2.5 pr-12 dark:border-slate-800 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                <Trash2 className="size-4" />
              </span>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  Delete completed
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  This removes {completedTasks.length} finished{" "}
                  {completedTasks.length === 1 ? "task" : "tasks"} and cannot be
                  undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:px-5">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-xl border-slate-200 font-bold dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-xl bg-rose-600 px-4 font-bold text-white hover:bg-rose-500"
              onClick={() => {
                DeleteCompletedTasks();
                setOpen(false);
              }}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteCompleteTasksButton;
