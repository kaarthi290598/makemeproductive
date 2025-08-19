import NotesHeadbar from "@/components/notes/notesHeadbar";
import NotesList from "@/components/notes/notesList";
import React from "react";

const page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-10">
      <NotesHeadbar />
      <NotesList />
    </div>
  );
};

export default page;
