"use client";

import { NotebookPen } from "lucide-react"; // Using icons for checkbox

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

  // Remove forced sorting by isCompleted to respect DB order (which is user-controlled now)
  // If we want to keep completed items at the bottom visually but allow reordering, it gets complex.
  // For now, removing this sort so "order" column dictates position.
  /*
  filteredTodos = filteredTodos.sort((a, b) => {
    return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
  });
  */

  const [orderedTodos, setOrderedTodos] = useState<Todo[]>(filteredTodos);

  // Sync local state when todos change (e.g. initial load or refetch)
  useEffect(() => {
    setOrderedTodos(filteredTodos);
  }, [todos, category, fromDate, toDate]); // Depend on filter params too

  const isFiltered = !!category || (!!fromDate && !!toDate);

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
    // We update the 'order' of all affected items (or all items to be safe/simple)
    // Map index to order. We can use the index as the order.
    const updates = newTodos.map((todo, index) => ({
      id: todo.id,
      order: index,
    }));

    try {
      await updateTodoOrder(updates);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to save new order");
      // Revert on error?
      setOrderedTodos(filteredTodos);
    }
  };

  return (
    <div className="flex max-h-[400px] min-h-[200px] flex-1 flex-col overflow-scroll rounded-lg bg-sidebar p-4 lg:max-h-screen">
      {!todos.length ? (
        <TodoEmpty />
      ) : (
        <div className="scrollbar-none flex-1 space-y-4 overflow-y-auto pr-2">
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
                    className="space-y-4"
                  >
                    {orderedTodos.map((todo, index) => (
                      <Draggable
                        key={todo.id}
                        draggableId={String(todo.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
