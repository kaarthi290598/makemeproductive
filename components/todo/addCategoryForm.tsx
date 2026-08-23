"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Categories, Category } from "@/lib/types/type";
import { addCategory } from "@/lib/actions/todosData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters long" })
    .nonempty({ message: "Category is required" }),
});

const AddCategoryForm = ({
  setOpen,
  categories,
}: {
  setOpen: (open: boolean) => void;
  categories: Categories | undefined;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate: addCategoryMutate, isPending } = useMutation({
    mutationFn: addCategory,
    mutationKey: ["category"],
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added successfully!");
    },
    onError: () => {
      toast.error("Error adding category");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newCategory =
      values.category.charAt(0).toUpperCase() +
      values.category.slice(1).toLowerCase();
    if (
      categories?.some(
        (category: Category) => category.category === newCategory,
      )
    ) {
      toast.error("Category already exists!");
      return;
    }

    addCategoryMutate(newCategory);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        placeholder="New category"
        className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"
        {...form.register("category")}
      />
      <Button
        type="submit"
        disabled={isPending}
        className="h-10 shrink-0 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Add
      </Button>
    </form>
  );
};

export default AddCategoryForm;
