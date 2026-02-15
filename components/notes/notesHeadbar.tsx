"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Eraser, Plus } from "lucide-react";
import NotesFilterCategory from "./notesFilter";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { fetchNotesCategories } from "@/lib/actions/notesData";
import { useQuery } from "@tanstack/react-query";

const NotesHeadbar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push, replace } = useRouter();
  const categoryParam = searchParams.get("category") || "";

  const [selectedValue, setSelectedValue] = useState(categoryParam);

  // Sync selectedValue with searchParams when they change
  useEffect(() => {
    setSelectedValue(categoryParam);
  }, [categoryParam]);

  const {
    data: notesCategories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notescategories"],
    queryFn: fetchNotesCategories,
  });

  function resetFilters() {
    setSelectedValue("");

    // Clear all filter-related parameters
    const params = new URLSearchParams();
    // Don't add any params, just use the pathname
    replace(pathname);
  }

  return (
    <div className="flex flex-row flex-wrap items-start gap-4 rounded-md bg-sidebar p-4">
      <Button onClick={() => push(`${pathname}/new`)} variant="secondary">
        <Plus /> Add Notes
      </Button>

      <NotesFilterCategory
        categories={notesCategories ?? []}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      {categoryParam && (
        <Button onClick={resetFilters} variant="secondary">
          Reset Filter <Eraser className="ml-2" />
        </Button>
      )}
    </div>
  );
};

export default NotesHeadbar;
