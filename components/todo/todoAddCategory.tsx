"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchCategories } from "@/lib/actions/todosData";
import { Button } from "../ui/button";
import { BadgeInfo, FolderPlus, Settings2 } from "lucide-react";
import AddCategoryForm from "./addCategoryForm";
import { useQuery } from "@tanstack/react-query";
import DeleteCategory from "./deleteCategory";
import {
  consoleDialogClass,
} from "@/components/finance/page-header";

const TodoAddCategory = () => {
  const [open, setOpen] = React.useState(false);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-xl border-slate-200 px-3 text-sm font-bold shadow-sm dark:border-slate-700"
        >
          <Settings2 className="size-3.5 text-slate-500" />
          <span className="hidden sm:inline">Categories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={consoleDialogClass}>
        <DialogHeader className="shrink-0 space-y-0.5 border-b border-slate-100 px-4 py-2.5 pr-12 dark:border-slate-800 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <FolderPlus className="size-4" />
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                Categories
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Add a board column or remove one you no longer need.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-4 py-3 sm:px-5 sm:py-3.5">
          <DeleteCategory
            categories={categories}
            isLoading={isLoading}
            error={error}
          />

          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
            <BadgeInfo className="mt-0.5 size-3.5 shrink-0" />
            <span className="text-[11px] font-semibold leading-relaxed">
              Default categories Work and Personal cannot be deleted.
            </span>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:px-5 sm:justify-stretch">
          <AddCategoryForm setOpen={setOpen} categories={categories} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TodoAddCategory;
