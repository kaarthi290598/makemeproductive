"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Categories } from "@/lib/types/type";

const TodoFilterCategory = ({
  selectedValue,
  setSelectedValue,
  categories,
}: {
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  categories: Categories;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value); // Set category filter
    } else {
      params.delete("category"); // Remove filter if empty
    }

    replace(`${pathname}?${params.toString()}`);
  };

  function handleFilterChange(value: string) {
    setSelectedValue(value);
    setFilter(value);
  }

  return (
    <Select
      value={selectedValue}
      onValueChange={handleFilterChange}
      defaultValue=""
    >
      <SelectTrigger className="h-9 w-[140px] gap-2 rounded-xl border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[180px]">
        <Folder className="size-3.5 shrink-0 text-slate-400" />
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">
            Filter by category
          </SelectLabel>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.category}>
              {category.category}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TodoFilterCategory;
