"use client";

import { Categories, Todos } from "@/lib/types/type";
import TodoKanban from "./todoKanban";
import TodoForm from "./todoForm";

export default function TodoWorkspace({
  todos,
  categories,
}: {
  todos: Todos;
  categories: Categories;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col gap-3 overflow-y-auto px-3 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.5rem))] pt-3 sm:gap-4 sm:px-4 sm:pb-10 sm:pt-4 lg:overflow-hidden lg:p-8">
      <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TodoForm categories={categories} todos={todos} />
      </div>

      <div className="min-h-[28rem] min-w-0 flex-1 lg:min-h-0 lg:overflow-hidden">
        <TodoKanban todos={todos} categories={categories} />
      </div>
    </div>
  );
}
