"use client";

import React from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Categories } from "@/lib/types/type";

const NotesFilterCategory = ({
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
      <SelectTrigger className="w-fit border-none bg-secondary">
        <SelectValue placeholder="Filter by Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>

          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.category}>
              {category.category}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default NotesFilterCategory;
