import TodoWorkspace from "@/components/todo/todoWorkspace";
import { fetchCategories, fetchTodoList } from "@/lib/actions/todosData";

const page = async () => {
  const todos = await fetchTodoList();
  const categories = await fetchCategories();

  return <TodoWorkspace todos={todos} categories={categories} />;
};

export default page;
