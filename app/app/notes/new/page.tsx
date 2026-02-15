import NotesForm from "@/components/notes/noteForm";
import NotesContainerForm from "@/components/notes/notesContainerForm";
import NotesTextEditor from "@/components/notes/notesTextEditor";
import React from "react";

const page = () => {
  return (
    <section className="flex h-full w-full items-center justify-center p-4 lg:p-10">
      <NotesContainerForm />
    </section>
  );
};

export default page;
