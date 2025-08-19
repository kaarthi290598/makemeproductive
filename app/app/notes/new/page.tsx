import NotesTextEditor from "@/components/notes/notesTextEditor";
import React from "react";

const page = () => {
  return (
    <section className="flex h-full w-full items-center justify-center p-10">
      {" "}
      <NotesTextEditor />
    </section>
  );
};

export default page;
