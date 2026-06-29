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
    <div className="flex h-full w-full flex-col gap-4 p-3 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            Tasks
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground lg:text-sm">
            Organize, prioritize, and conquer your day
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <TodoForm categories={categories} todos={todos} />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:overflow-hidden">
        <div className="lg:w-[60%]">
          <Suspense fallback={<SpinnerLoad />}>
            <TodoList todos={todos} categories={categories} />
          </Suspense>
        </div>

        <div className="lg:w-[40%]">
          <TodoAnalytics />
        </div>
      </div>
    </div>
  );
};

export default page;
