"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export async function fetchTodoList() {
  // Retrieve the currently authenticated Clerk user ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  console.log(userId);

  // Query the todos table filtering by the user's Clerk ID
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_Id", userId);

  console.log(data);

  if (error) {
    console.error("Error fetching todos:", error);
    throw new Error(`Error fetching todos: ${error.message}`);
  }

  return data;
}
