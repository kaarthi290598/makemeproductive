"use client";
import React from "react";
import { useTodo } from "./todoContext";
import TodoChart from "./todoChart";

const TodoAnalytics = () => {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg bg-secondary">
      <div className="flex flex-1 gap-3">
        <TodoTotalTaskCard />

        <TodoDeadlineCard />
      </div>

      <TodoChart />
    </div>
  );
};

export default TodoAnalytics;

const TodoTotalTaskCard = () => {
  const { todos } = useTodo();

  const totalTask = todos.filter((todo) => todo.isCompleted === false).length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-sidebar p-4">
      <h1 className="text-7xl">{totalTask}</h1>
      <p>Pending Tasks</p>
    </div>
  );
};

const TodoDeadlineCard = () => {
  const { todos } = useTodo();

  console.log(todos);

  const deadlineCount = todos.filter(
    (todo) =>
      todo.isCompleted === false &&
      todo?.deadline &&
      new Date(todo.deadline) < new Date(),
  ).length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-sidebar p-4">
      <h1 className="text-7xl">{deadlineCount}</h1>
      <p>Tasks Crossed the deadline</p>
    </div>
  );
};
