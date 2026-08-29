"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { Todo, TodoInput } from "../types/type";

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
    .eq("user_Id", userId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching todos:", error);
    throw new Error(`Error fetching todos: ${error.message}`);
  }

  return data;
}

export async function createTodo(todoValues: TodoInput) {
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

export async function updateTodo({
  todoValues,
  id,
}: {
  todoValues: TodoInput;
  id: number;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("todos")
    .update({
      ...todoValues,
    })
    .eq("id", id)
    .eq("user_Id", userId);

  if (error) {
    console.error("Error updating todo:", error);
    throw new Error(`Error updating todo: ${error.message}`);
  }
  revalidatePath("/app/todo");
  return data;
}

export async function deleteTodo(id: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_Id", userId);
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
    .eq("id", categoryId)
    .eq("user_Id", userId);
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
    .eq("isCompleted", true)
    .eq("user_Id", userId);

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

  // Fetch the current isCompleted state for the todo
  const { data: todo, error: fetchError } = await supabase
    .from("todos")
    .select("isCompleted")
    .eq("id", todoId)
    .eq("user_Id", userId)
    .single();

  if (fetchError || !todo) {
    console.error("Error fetching todo:", fetchError);
    return;
  }

  // Update the todo with the toggled value
  const { data, error } = await supabase
    .from("todos")
    .update({ isCompleted: !todo.isCompleted })
    .eq("id", todoId)
    .eq("user_Id", userId);

  if (error) {
    console.error("Error updating todo:", error);
    throw new Error(`Error updating todo: ${error.message}`);
  }

  revalidatePath("/app/todo");
  return data;
}

export async function updateTodoOrder(items: { id: number; order: number }[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  if (items.length === 0) return;

  // Run all updates in parallel to prevent slow sequential loops
  await Promise.all(
    items.map((item) =>
      supabase
        .from("todos")
        .update({ order: item.order })
        .eq("id", item.id)
        .eq("user_Id", userId)
    )
  );

  revalidatePath("/app/todo");
}
