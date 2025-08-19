import SpinnerLoad from "@/components/spinner";
import TodoAnalytics from "@/components/todo/todoAnalytics";

import TodoForm from "@/components/todo/todoForm";
import TodoList from "@/components/todo/todoList";
import { fetchCategories, fetchTodoList } from "@/lib/actions/todosData";
import React, { Suspense } from "react";

const page = async () => {
  const todos = await fetchTodoList();
  const categories = await fetchCategories();

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4 lg:p-10">
      <div>
        <TodoForm categories={categories} todos={todos} />
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 p-2 lg:flex-row lg:overflow-hidden lg:p-0">
        <Suspense fallback={<SpinnerLoad />}>
          <TodoList todos={todos} categories={categories} />
        </Suspense>

        <TodoAnalytics />
      </div>
    </div>
  );
};

export default page;
