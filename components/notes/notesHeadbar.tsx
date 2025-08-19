"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Eraser, Plus } from "lucide-react";
import NotesFilterCategory from "./notesFilter";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const categories = [
  {
    id: 1,
    createdAt: "2025-04-15T10:00:00Z",
    category: "Technology",
    category_type: "Work",
    user_Id: "user_001",
  },
  {
    id: 2,
    createdAt: "2025-04-14T14:30:00Z",
    category: "Fitness",
    category_type: "Personal",
    user_Id: "user_001",
  },
  {
    id: 3,
    createdAt: "2025-04-13T09:15:00Z",
    category: "Finance",
    category_type: "Work",
    user_Id: "user_001",
  },
];

const NotesHeadbar = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push, replace } = useRouter();
  function resetFilters() {
    setSelectedValue("");

    // Clear all filter-related parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("from");
    params.delete("to");

    replace(`${pathname}?${params.toString()}`);
  }
  return (
    <div className="flex flex-row items-start gap-10 overflow-auto rounded-md bg-sidebar p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Add Notes</h3>
        <Button onClick={() => push(`${pathname}/new`)} variant="secondary">
          <Plus /> Add Notes
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-muted-foreground">Filters/Reset Filter</h3>
        <div className="flex gap-2">
          <NotesFilterCategory
            categories={categories}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
          <Button onClick={resetFilters} variant="secondary">
            Reset Filter <Eraser className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesHeadbar;
