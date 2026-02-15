"use client";
import React, { useState } from "react";
import NotesForm from "./noteForm";
import { useQuery } from "@tanstack/react-query";
import { fetchNotesList } from "@/lib/actions/notesData";

const NotesContainerForm = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const {
    data: notesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchNotesList(),
  });

  return (
    <>
      <NotesForm
        title={title}
        category={category}
        onTitleChange={setTitle}
        onCategoryChange={setCategory}
      />
    </>
  );
};

export default NotesContainerForm;
