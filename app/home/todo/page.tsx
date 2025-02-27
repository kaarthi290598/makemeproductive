import TodoAnalytics from "@/components/todo/todoAnalytics";
import { TodoProvider } from "@/components/todo/todoContext";
import TodoForm from "@/components/todo/todoForm";
import TodoList from "@/components/todo/todoList";
import React from "react";

const page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-10">
      <TodoProvider>
        <div>
          <TodoForm />
        </div>
        <div className="flex flex-1 gap-4 overflow-hidden">
          <TodoList />
          <TodoAnalytics />
        </div>
      </TodoProvider>
    </div>
  );
};

export default page;
