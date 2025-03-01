import TodoAnalytics from "@/components/todo/todoAnalytics";
import { TodoProvider } from "@/components/todo/todoContext";
import TodoForm from "@/components/todo/todoForm";
import TodoList from "@/components/todo/todoList";
import { fetchTodoList } from "@/lib/actions/todosData";
import React from "react";

const page = async () => {
  const todos = await fetchTodoList();
  return (
    <div className="flex h-full w-full flex-col gap-6 p-10">
      <TodoProvider>
        <div>
          <TodoForm />
        </div>
        <div className="flex flex-1 gap-4 overflow-hidden">
          <TodoList todos={todos} />
          <TodoAnalytics />
        </div>
      </TodoProvider>
    </div>
  );
};

export default page;
