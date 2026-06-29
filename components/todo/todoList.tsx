"use client";

import { ClipboardList } from "lucide-react";

import React from "react";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import TodoCard from "./todoCard";
import { Categories, Category, Todo } from "@/lib/types/type";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { updateTodoOrder } from "@/lib/actions/todosData";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const TodoList = ({
  todos,
  categories,
}: {
  todos: Todo[];
  categories: Categories;
}) => {
  const searchParams = useSearchParams();

  const category = searchParams.get("category");

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  const filteredTodos = React.useMemo(() => {
    let filtered = category
      ? todos.filter((todo: Todo) => todo.category.category === category)
      : todos;

    if (fromDate && toDate) {
      filtered = filtered.filter((todo: Todo) => {
        if (!todo?.deadline) return false; // Skip todos without a deadline

        const todoDate = new Date(todo.deadline);
        const from = new Date(fromDate);
        const to = new Date(toDate);

        return todoDate >= from && todoDate <= to;
      });
    }
    return filtered;
  }, [todos, category, fromDate, toDate]);

  const [orderedTodos, setOrderedTodos] = useState<Todo[]>(filteredTodos);

  // Sync local state when todos change (e.g. initial load or refetch)
  useEffect(() => {
    setOrderedTodos(filteredTodos);
  }, [filteredTodos]); // Depend on memoized filteredTodos

  const isFiltered = !!category || (!!fromDate && !!toDate);

  const completedCount = orderedTodos.filter((t) => t.isCompleted).length;
  const totalCount = orderedTodos.length;

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newTodos = Array.from(orderedTodos);
    const [movedTodo] = newTodos.splice(sourceIndex, 1);
    newTodos.splice(destinationIndex, 0, movedTodo);

    // Optimistic update
    setOrderedTodos(newTodos);

    // Prepare updates for backend
    const updates = newTodos.map((todo, index) => ({
      id: todo.id,
      order: index,
    }));

    try {
      await updateTodoOrder(updates);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to save new order");
      // Revert on error
      setOrderedTodos(filteredTodos);
    }
  };

  return (
    <div className="flex max-h-[400px] min-h-[200px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm lg:max-h-screen">
      {/* List Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="size-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
          {totalCount > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {isFiltered && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
            Filtered
          </span>
        )}
      </div>

      {/* List Content */}
      {!todos.length ? (
        <TodoEmpty />
      ) : (
        <div className="scrollbar-none flex-1 space-y-2 overflow-y-auto p-3">
          {isFiltered ? (
            orderedTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} categories={categories} />
            ))
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todos-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderedTodos.map((todo, index) => (
                      <Draggable
                        key={todo.id}
                        draggableId={String(todo.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging
                                ? "rounded-xl shadow-lg ring-2 ring-primary/20"
                                : ""
                            }
                          >
                            <TodoCard todo={todo} categories={categories} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;

const TodoEmpty = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
        <Image
          src="/todolist.svg"
          className="size-10 opacity-60"
          width={40}
          height={40}
          alt="No tasks"
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No tasks yet
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/60">
          Create your first task to get started
        </p>
      </div>
    </div>
  );
};
