import NotesHeadbar from "@/components/notes/notesHeadbar";
import NotesList from "@/components/notes/notesList";
import SpinnerLoad from "@/components/spinner";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 lg:gap-5 lg:p-10">
      <Suspense fallback={<SpinnerLoad />}>
        <NotesHeadbar />
        <NotesList />
      </Suspense>
    </div>
  );
};

export default page;
