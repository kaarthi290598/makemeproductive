"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompletedTodos } from "@/lib/actions/todosData";
import { Todos } from "@/lib/types/type";
import { toast } from "sonner";

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
        className="h-9 gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
        Delete completed
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
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
