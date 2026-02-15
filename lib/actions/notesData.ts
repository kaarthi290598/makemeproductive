"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function fetchNotesList(categoryFilter?: string) {
  // Retrieve the currently authenticated Clerk user ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  // Query the notes table filtering by the user's Clerk ID,
  // and join the related category data from the "category" table.
  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      *,
      category(id, category)
    `,
    )
    .eq("user_Id", userId);

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error(`Error fetching notes: ${error.message}`);
  }

  // Apply category filter if provided (filter client-side for reliability)
  if (categoryFilter && data) {
    return data.filter(
      (note: any) => note.category?.category === categoryFilter
    );
  }

  return data;
}

export async function fetchNotesCategories() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("category")
    .select("*")
    .in("category_type", ["notes", "notesGeneral"])
    .or(`user_Id.eq.${userId},user_Id.is.null`);

  if (error) {
    console.error("Error fetching notes categories:", error);
    throw new Error(`Error fetching notes categories: ${error.message}`);
  }

  return data;
}

export async function createNote({
  title,
  content,
  category,
}: {
  title: string;
  content: string;
  category: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const notesCategory = 14;

  const { data, error } = await supabase.from("notes").insert({
    title,
    notes: content,
    notesCategory,
    user_Id: userId,
  });

  if (error) {
    console.error("Error creating note:", error);
    throw new Error(`Error creating note: ${error.message}`);
  }

  revalidatePath("/app/notes");

  return data;
}

export async function fetchNoteById(noteId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      *,
      category(id, category)
    `,
    )
    .eq("id", noteId)
    .eq("user_Id", userId)
    .single();

  if (error) {
    console.error("Error fetching note:", error);
    throw new Error(`Error fetching note: ${error.message}`);
  }

  return data;
}

export async function deleteNote(noteId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_Id", userId); // Ensure user can only delete their own notes

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error(`Error deleting note: ${error.message}`);
  }

  revalidatePath("/app/notes");

  return { success: true };
}

export async function updateNote({
  noteId,
  title,
  content,
  category,
}: {
  noteId: number;
  title: string;
  content: string;
  category: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const notesCategory = 14; // You may want to map category name to ID

  const { data, error } = await supabase
    .from("notes")
    .update({
      title,
      notes: content,
      notesCategory,
    })
    .eq("id", noteId)
    .eq("user_Id", userId) // Ensure user can only update their own notes
    .select();

  if (error) {
    console.error("Error updating note:", error);
    throw new Error(`Error updating note: ${error.message}`);
  }

  revalidatePath("/app/notes");

  return data;
}
