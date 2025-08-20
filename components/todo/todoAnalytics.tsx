import React from "react";

import TodoChart from "./todoChart";
import { fetchTodoList } from "@/lib/actions/todosData";
import { Todos } from "@/lib/types/type";
import Image from "next/image";
import { NotebookPen } from "lucide-react";

const TodoAnalytics = async () => {
  const todos = await fetchTodoList();

  const PendingTodos = todos.filter((todo) => !todo.isCompleted);

  return (
    <div className="flex h-full flex-1 flex-col gap-3 rounded-lg bg-secondary">
      <div className="flex gap-3">
        <TodoTotalTaskCard todos={todos} />

        <TodoDeadlineCard todos={todos} />
      </div>
      <div className="b h-full overflow-scroll bg-sidebar">
        {PendingTodos.length === 0 ? (
          <TodoEmpty />
        ) : (
          <TodoChart todos={todos} />
        )}
        {/* <TodoChart todos={todos} /> */}
      </div>
    </div>
  );
};

export default TodoAnalytics;

const TodoTotalTaskCard = ({ todos }: { todos: Todos }) => {
  const totalTask = todos.filter((todo) => todo.isCompleted === false).length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-sidebar p-10">
      <h1 className="text-5xl lg:text-7xl">{totalTask}</h1>
      <p className="text-center text-sm lg:text-base">Pending Tasks</p>
    </div>
  );
};

const TodoDeadlineCard = ({ todos }: { todos: Todos }) => {
  const deadlineCount = todos.filter(
    (todo) =>
      todo.isCompleted === false &&
      todo?.deadline &&
      new Date(todo.deadline) < new Date(),
  ).length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-sidebar p-10">
      <h1 className="text-5xl lg:text-7xl">{deadlineCount}</h1>
      <p className="text-center text-sm lg:text-base">
        Tasks Crossed the deadline
      </p>
    </div>
  );
};

const TodoEmpty = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-sidebar">
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
          No Pending Todos to display the chart
        </h1>
      </div>
    </div>
  );
};
