"use client";
import React from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Categories, Category } from "@/lib/types/type";
import SpinnerLoad from "../spinner";
import { deleteCategory } from "@/lib/actions/todosData";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const DeleteCategory = ({
  categories,
  isLoading,
  error,
}: {
  categories: Categories | undefined;
  isLoading: boolean;
  error: Error | null;
}) => {
  const queryClient = useQueryClient();

  const { mutate: deleteCategoryMutate, isPending } = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      // Invalidate the "categories" query to trigger a refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error) => {
      console.error("Error deleting category:", err);
    },
  });

  if (isLoading) return <SpinnerLoad />;
  if (error) return <div>Error loading categories</div>;

  const displayedCategories = categories?.filter(
    (category: Category) => category.user_Id !== null,
  );

  return (
    <div className="flex flex-wrap gap-2">
      {displayedCategories?.map((category: Category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-xl bg-secondary px-3"
        >
          <div className="text-sm">{category.category}</div>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => deleteCategoryMutate(category.id)}
            disabled={isPending}
          >
            {isPending ? <SpinnerLoad /> : <Trash2 />}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DeleteCategory;
