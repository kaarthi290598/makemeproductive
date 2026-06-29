import React from "react";

import TodoChart from "./todoChart";
import { fetchTodoList } from "@/lib/actions/todosData";
import { Todos } from "@/lib/types/type";
import Image from "next/image";
import {
  ListTodo,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const TodoAnalytics = async () => {
  const todos = await fetchTodoList();

  const pendingTodos = todos.filter((todo) => !todo.isCompleted);
  const completedTodos = todos.filter((todo) => todo.isCompleted);
  const overdueTodos = todos.filter(
    (todo) =>
      !todo.isCompleted &&
      todo?.deadline &&
      new Date(todo.deadline) < new Date(),
  );

  const completionRate =
    todos.length > 0
      ? Math.round((completedTodos.length / todos.length) * 100)
      : 0;

  return (
    <div className="flex h-full flex-1 flex-col gap-3">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<ListTodo className="size-4 text-primary" />}
          label="Pending"
          value={pendingTodos.length}
          bgClass="bg-primary/10"
        />
        <StatCard
          icon={<AlertTriangle className="size-4 text-destructive" />}
          label="Overdue"
          value={overdueTodos.length}
          bgClass="bg-destructive/10"
          valueClass={overdueTodos.length > 0 ? "text-destructive" : ""}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4 text-emerald-500" />}
          label="Completed"
          value={completedTodos.length}
          bgClass="bg-emerald-500/10"
        />
        <StatCard
          icon={<TrendingUp className="size-4 text-amber-500" />}
          label="Done Rate"
          value={`${completionRate}%`}
          bgClass="bg-amber-500/10"
        />
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
        {pendingTodos.length === 0 ? (
          <TodoEmpty />
        ) : (
          <TodoChart todos={todos} />
        )}
      </div>
    </div>
  );
};

export default TodoAnalytics;

const StatCard = ({
  icon,
  label,
  value,
  bgClass,
  valueClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgClass: string;
  valueClass?: string;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bgClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`text-3xl font-bold tracking-tight ${valueClass || "text-foreground"}`}
        >
          {value}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

const TodoEmpty = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50">
        <BarChart3 className="size-6 text-muted-foreground/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          All caught up!
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/60">
          No pending tasks to chart
        </p>
      </div>
    </div>
  );
};
