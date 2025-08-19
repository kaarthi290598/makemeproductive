"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { QueryClient } from "@tanstack/react-query";

export async function fetchTodoList() {
  // Retrieve the currently authenticated Clerk user ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  // Query the todos table filtering by the user's Clerk ID,
  // and join the related category data from the "category" table.
  const { data, error } = await supabase
    .from("todos")
    .select(
      `
      *,
      category(id, category)
    `,
    )
    .eq("user_Id", userId);

  console.log(data);
  if (error) {
    console.error("Error fetching todos:", error);
    throw new Error(`Error fetching todos: ${error.message}`);
  }

  return data;
}

export async function createTodo(todoValues: any) {
  // Retrieve the currently authenticated Clerk user ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  // Insert a new todo into the todos table with the user's Clerk ID
  const { data, error } = await supabase.from("todos").insert({
    user_Id: userId,
    ...todoValues,
  });

  if (error) {
    console.error("Error creating todo:", error);
    throw new Error(`Error creating todo: ${error.message}`);
  }

  revalidatePath("/app/todo");
  return data;
}

export async function updateTodo({ todoValues, id }: any) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("todos")
    .update({
      ...todoValues,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating todo:", error);
  } else {
    console.log("Todo updated:", data);
  }
  revalidatePath("/app/todo");
  return data;
}

export async function deleteTodo(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase.from("todos").delete().eq("id", id);
  if (error) {
    console.error("Error deleting todo:", error);
    throw new Error(`Error deleting todo: ${error.message}`);
  }

  revalidatePath("/app/todo");
  return data;
}

export async function fetchCategories() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase
    .from("category")
    .select("*")
    .in("category_type", ["todo", "todoGeneral"])
    .or(`user_Id.eq.${userId},user_Id.is.null`);

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Error fetching categories: ${error.message}`);
  }

  return data;
}

export async function addCategory(category: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase
    .from("category")
    .insert({ category: category, category_type: "todo", user_Id: userId });
  if (error) {
    console.error("Error adding category:", error);
    throw new Error(`Error adding category: ${error.message}`);
  }
  revalidatePath("/app/todo");

  return data;
}

export async function deleteCategory(categoryId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase
    .from("category")
    .delete()
    .eq("id", categoryId);
  if (error) {
    console.error("Error deleting category:", error);
    throw new Error(`Error deleting category: ${error.message}`);
  }

  revalidatePath("/app/todo");
  return data;
}

export async function deleteCompletedTodos() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("isCompleted", true);

  if (error) {
    console.error("Error deleting completed todos:", error);
    throw new Error(`Error deleting completed todos: ${error.message}`);
  }

  revalidatePath("/app/todo");
  return data;
}

export async function toggleTodo(todoId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  // First, fetch the current isCompleted state for the todo
  const { data: todo, error: fetchError } = await supabase
    .from("todos")
    .select("isCompleted")
    .eq("id", todoId)
    .single();

  if (fetchError) {
    console.error("Error fetching todo:", fetchError);
    return;
  }

  // Then update the todo with the toggled value
  const { data, error } = await supabase
    .from("todos")
    .update({ isCompleted: !todo.isCompleted })
    .eq("id", todoId);

  if (error) {
    console.error("Error updating todo:", error);
  } else {
    console.log("Todo updated:", data);
  }

  revalidatePath("/app/todo");
  return data;
}
