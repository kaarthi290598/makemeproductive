"use client";
import React, { useState, useEffect } from "react";
import NotesForm from "./noteForm";
import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/actions/notesData";
import { useParams } from "next/navigation";

const NotesEditContainerForm = () => {
  const params = useParams();
  const noteId = Number(params.id);

  const {
    data: noteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
    enabled: !!noteId,
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title || "");
      setCategory(noteData.category?.category || "");
    }
  }, [noteData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-red-500">Error loading note.</p>
      </div>
    );
  }

  return (
    <>
      <NotesForm
        title={title}
        category={category}
        onTitleChange={setTitle}
        onCategoryChange={setCategory}
        noteId={noteId}
        initialContent={noteData?.notes}
      />
    </>
  );
};

export default NotesEditContainerForm;
