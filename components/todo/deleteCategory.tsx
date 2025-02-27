import React from "react";
import { useTodo } from "./todoContext";
import { Button } from "../ui/button";
import { DeleteIcon, Trash2 } from "lucide-react";

const DeleteCategory = () => {
  const { categories, removeCategory } = useTodo();
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <div
          key={category}
          className="flex items-center justify-between rounded-xl bg-secondary px-3"
        >
          <div className="text-sm">{category}</div>

          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => removeCategory(category)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DeleteCategory;
