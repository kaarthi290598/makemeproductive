"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { Categories, Category } from "@/lib/types/type";
import { addCategory } from "@/lib/actions/todosData";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import SpinnerLoad from "../spinner";

const formSchema = z.object({
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters long" }) // Minimum length validation
    .nonempty({ message: "Category is required" }), // Required field validation
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
    onError: (err: Error) => {
      toast.error("Error adding category:");
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
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Category*</FormLabel>
              <FormControl>
                <Input placeholder="Category Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button variant="destructive">Cancel</Button>
          <Button type="submit" className="">
            {isPending ? <SpinnerLoad /> : "Add Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCategoryForm;
