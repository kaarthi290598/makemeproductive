"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the Todo type
export type Todo = {
  id: number;
  name: string;
  category: string;
  deadline?: string;
  isCompleted: boolean;
};

// Define the context type
type TodoContextType = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  removeTodo: (id: number) => void;
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  toggleTodo: (id: number) => void;
  removeCompletedTasks: () => void;
};

// Create the context with an initial undefined state
const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Initial data
const initialTodos: Todo[] = [
  {
    id: 1,
    name: "Buy groceries",
    category: "Personal",
    deadline: "2025-02-05",
    isCompleted: false,
  },
  {
    id: 2,
    name: "Finish project report",
    category: "Work",
    deadline: "2025-02-07",
    isCompleted: false,
  },
  {
    id: 3,
    name: "Workout",
    category: "Health",
    deadline: "2025-02-03",
    isCompleted: false,
  },
  {
    id: 4,
    name: "Read a book",
    category: "Personal",
    deadline: "2025-02-06",
    isCompleted: false,
  },
  {
    id: 5,
    name: "Go for a run",
    category: "Health",
    deadline: "2025-02-04",
    isCompleted: false,
  },
];

const initialCategories = ["Business", "Sports"];

// Provider component
export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const [categories, setCategories] = useState<string[]>(initialCategories);

  const addTodo = (todo: Todo) => {
    setTodos((prev) => [...prev, todo]);
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const removeCompletedTasks = () => {
    setTodos((prev) => prev.filter((todo) => !todo.isCompleted));
  };

  const addCategory = (category: string) => {
    setCategories((prev) => [...prev, category]);
  };

  const removeCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      ),
    );
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        removeTodo,
        categories,
        addCategory,
        removeCategory,
        toggleTodo,
        removeCompletedTasks,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use the context
export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};
