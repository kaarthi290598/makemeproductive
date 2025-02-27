"use client";

import { CheckCircle, Circle, NotebookPen } from "lucide-react"; // Using icons for checkbox

import React from "react";
import { useTodo } from "./todoContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const TodoList = () => {
  const { todos } = useTodo();

  const searchParams = useSearchParams();

  const category = searchParams.get("category");

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let filteredTodos = category
    ? todos.filter((todo) => todo.category === category)
    : todos;

  if (fromDate && toDate) {
    filteredTodos = filteredTodos.filter((todo) => {
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
    <div className="flex flex-1 flex-col rounded-lg bg-sidebar p-4">
      {!todos.length ? (
        <TodoEmpty />
      ) : (
        <div className="scrollbar-none flex-1 space-y-4 overflow-y-auto pr-2">
          {filteredTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
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

const TodoCard = ({ todo }: { todo: any }) => {
  const { toggleTodo } = useTodo();
  const toggleCompletion = () => toggleTodo(todo.id);

  const isDeadlineCompleted =
    todo.isCompleted === false &&
    todo?.deadline &&
    new Date(todo.deadline) < new Date();

  return (
    <div
      className={`flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-md transition-all ${
        todo.isCompleted ? "bg-muted" : ""
      }`}
    >
      {/* Drag Icon - TO BE DONE LATER */}
      {/* <GripVertical className="mr-3 cursor-grab text-muted-foreground" /> */}

      {/* Completion Toggle */}
      <div
        onClick={toggleCompletion}
        className="mr-3 cursor-pointer text-muted-foreground"
      >
        {todo.isCompleted ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <Circle className="text-muted-foreground" />
        )}
      </div>

      {/* Todo Content */}
      <div className="flex flex-1 flex-col">
        <h3
          className={`text-lg font-semibold transition-colors ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {todo.name}
        </h3>
        <p
          className={`text-sm transition-colors ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-muted-foreground"
          }`}
        >
          {todo.category}
        </p>
      </div>

      {/* Deadline */}
      {todo.deadline && (
        <span
          className={`rounded-md bg-muted px-2 py-1 text-sm transition-colors ${
            todo.isCompleted
              ? "text-muted-foreground line-through"
              : "text-foreground"
          } ${isDeadlineCompleted && "bg-red-500 text-white"} `}
        >
          {new Date(todo.deadline).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
