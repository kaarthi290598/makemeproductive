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
import { useTodo } from "./todoContext";

const formSchema = z.object({
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters long" }) // Minimum length validation
    .nonempty({ message: "Category is required" }), // Required field validation
});

const AddCategoryForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { categories, addCategory } = useTodo();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (categories.includes(values.category)) {
      alert("Category already exists");
      return;
    }

    addCategory(values.category);
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
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddCategoryForm;
