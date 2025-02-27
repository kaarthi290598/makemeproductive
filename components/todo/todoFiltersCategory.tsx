"use client";

import React, { useState } from "react";

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
import { useTodo } from "./todoContext";

const TodoFilterCategory = ({ selectedValue, setSelectedValue }: any) => {
  const { categories } = useTodo();
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
      <SelectTrigger className="w-[180px] border-none bg-secondary">
        <SelectValue placeholder="Filter by Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Work">Work</SelectItem>
          <SelectItem value="Health">Health</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TodoFilterCategory;
