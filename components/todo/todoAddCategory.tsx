"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchCategories } from "@/lib/actions/todosData";
import { Button } from "../ui/button";
import { BadgeInfo, Plus } from "lucide-react";
import AddCategoryForm from "./addCategoryForm";
import { useQuery } from "@tanstack/react-query";

import DeleteCategory from "./deleteCategory";

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
        <Button variant="secondary">
          <Plus /> Add / Delete Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add / Delete Category</DialogTitle>
        </DialogHeader>

        <DeleteCategory
          categories={categories}
          isLoading={isLoading}
          error={error}
        />

        <div className="flex w-fit items-center gap-2 rounded-lg bg-red-300 px-2 py-1 text-sm">
          <BadgeInfo size={15} />
          <span className="text-[12px]">
            Default Categories - Work & Personal cannot be deleted
          </span>
        </div>

        <AddCategoryForm setOpen={setOpen} categories={categories} />
      </DialogContent>
    </Dialog>
  );
};

export default TodoAddCategory;
