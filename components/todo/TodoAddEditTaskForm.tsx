"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ListTodo, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomDatePicker } from "../customDatePicker";
import { createTodo, updateTodo } from "@/lib/actions/todosData";
import { Categories, Todo } from "@/lib/types/type";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  consoleDialogBodyClass,
  consoleDialogClass,
  consoleDialogFormClass,
} from "@/components/finance/page-header";
import { ChipScroll } from "@/components/ui/chip-scroll";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Task must be at least 3 characters.",
  }),
  category_Id: z.string().min(1, {
    message: "Category is required.",
  }),
  deadline: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format.",
    }),
});

const fieldLabelClass =
  "block text-xs font-semibold text-slate-700 dark:text-slate-300";

const choiceIdleClass =
  "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400";

const CHIP_DOTS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function TaskDialog({
  open,
  setOpen,
  categories,
  todo,
  defaultCategoryId,
  trigger,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  categories: Categories;
  todo?: Todo;
  defaultCategoryId?: string;
  trigger?: React.ReactNode;
}) {
  const isEdit = !!todo;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category_Id: defaultCategoryId ?? "",
      deadline: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (todo) {
      form.reset({
        name: todo.name,
        category_Id: String(todo.category?.id || todo.category_Id || ""),
        deadline: todo.deadline ? new Date(todo.deadline).toISOString() : "",
      });
    } else {
      form.reset({
        name: "",
        category_Id: defaultCategoryId ?? "",
        deadline: "",
      });
    }
  }, [open, todo, defaultCategoryId, form]);

  const { mutate: addTaskMutate, isPending: isAdding } = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      setOpen(false);
      toast.success("Task added successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Error adding Task: ${err.message}`);
    },
  });

  const { mutate: updateTaskMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      setOpen(false);
      toast.success("Task updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Error updating Task: ${err.message}`);
    },
  });

  const isPending = isAdding || isUpdating;
  const categoryId = form.watch("category_Id");
  const deadline = form.watch("deadline");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const todoValues = {
      isCompleted: todo?.isCompleted ?? false,
      deadline: values.deadline ? new Date(values.deadline) : null,
      category_Id: Number(values.category_Id),
      name: values.name,
    };

    if (isEdit && todo) {
      updateTaskMutate({ todoValues, id: todo.id });
    } else {
      addTaskMutate(todoValues);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={consoleDialogClass}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={consoleDialogFormClass}
        >
          <DialogHeader className="shrink-0 space-y-0.5 border-b border-slate-100 px-4 py-2.5 pr-12 dark:border-slate-800 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <ListTodo className="size-4" />
              </span>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {isEdit ? "Edit task" : "Add task"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {isEdit
                    ? "Update the details, then save your changes."
                    : "Capture the next thing you want to move forward."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className={consoleDialogBodyClass}>
            <div className="w-full self-start space-y-3">
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
                <Label htmlFor="task-name" className={fieldLabelClass}>
                  Task *
                </Label>
                <Input
                  id="task-name"
                  autoFocus
                  placeholder="What needs doing?"
                  className="mt-1 h-10 border-0 bg-transparent px-0 text-xl font-black tracking-tight text-emerald-800 shadow-none focus-visible:ring-0 dark:text-emerald-200"
                  {...form.register("name")}
                />
                {form.formState.errors.name ? (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="min-w-0 space-y-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  1
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Details
                </p>
              </div>

              <div className="space-y-1.5">
                <span className={fieldLabelClass}>Category *</span>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500">Add a category first.</p>
                ) : (
                  <ChipScroll>
                    {categories.map((category, index) => {
                      const active = categoryId === String(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            form.setValue("category_Id", String(category.id), {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all",
                            active
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : choiceIdleClass,
                          )}
                        >
                          <span
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              CHIP_DOTS[index % CHIP_DOTS.length],
                            )}
                          />
                          {category.category}
                        </button>
                      );
                    })}
                  </ChipScroll>
                )}
                {form.formState.errors.category_Id ? (
                  <p className="text-[11px] font-semibold text-rose-600">
                    {form.formState.errors.category_Id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <span className={fieldLabelClass}>Deadline</span>
                <CustomDatePicker
                  value={deadline ? new Date(deadline) : undefined}
                  onChange={(date) =>
                    form.setValue("deadline", date ? date.toISOString() : "", {
                      shouldValidate: true,
                    })
                  }
                  className="h-9 min-w-0 rounded-lg border-slate-200 bg-white font-mono text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 [&_svg]:text-emerald-600"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:px-5">
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 sm:w-auto sm:min-w-[148px]"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isEdit ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const TodoAddEditTaskForm = TaskDialog;
