"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import AddCategoryForm from "./addCategoryForm";

import DeleteCategory from "./deleteCategory";

const TodoAddCategory = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add / Delete Category</DialogTitle>
        </DialogHeader>

        <DeleteCategory />

        <AddCategoryForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default TodoAddCategory;
