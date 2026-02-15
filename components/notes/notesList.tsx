"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotesList } from "@/lib/actions/notesData";
import NotesCard from "./notesCard";
import { useSearchParams } from "next/navigation";

const NotesList = () => {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || undefined;

  const {
    data: notesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", categoryFilter],
    queryFn: () => fetchNotesList(categoryFilter),
  });

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading notes...</p>;
  if (error)
    return <p className="text-sm text-red-500">Error loading notes.</p>;
  if (!notesData || notesData.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        {categoryFilter ? "No notes found for this category." : "No notes yet."}
      </p>
    );

  return (
    <div className="h-full overflow-y-auto bg-sidebar p-4">
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notesData.map((note) => (
          <NotesCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
