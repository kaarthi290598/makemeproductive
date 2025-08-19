"use client";

import { NotebookPen } from "lucide-react"; // Using icons for checkbox

import React from "react";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import TodoCard from "./todoCard";
import { Categories, Category, Todo } from "@/lib/types/type";

const TodoList = ({
  todos,
  categories,
}: {
  todos: Todo[];
  categories: Categories;
}) => {
  console.log(todos);
  const searchParams = useSearchParams();

  const category = searchParams.get("category");

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let filteredTodos = category
    ? todos.filter((todo: Todo) => todo.category.category === category)
    : todos;

  if (fromDate && toDate) {
    filteredTodos = filteredTodos.filter((todo: Todo) => {
      if (!todo?.deadline) return false; // Skip todos without a deadline

      const todoDate = new Date(todo.deadline);
      const from = new Date(fromDate);
      const to = new Date(toDate);

      return todoDate >= from && todoDate <= to;
    });
  }

  filteredTodos = filteredTodos.sort((a, b) => {
    return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
  });

  return (
    <div className="flex max-h-[400px] min-h-[200px] flex-1 flex-col overflow-scroll rounded-lg bg-sidebar p-4 lg:max-h-screen">
      {!todos.length ? (
        <TodoEmpty />
      ) : (
        <div className="scrollbar-none flex-1 space-y-4 overflow-y-auto pr-2">
          {filteredTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} categories={categories} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;

const TodoEmpty = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image
        src="/todolist.svg"
        className="w-[200px]"
        width={200}
        height={200}
        alt="Todo List"
      />
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-md italic text-muted-foreground">
          You Have No Todos
        </h1>
      </div>
    </div>
  );
};
