export type Todo = {
  id: number;
  name: string;

  deadline?: string;
  isCompleted: boolean;
  category_Id: number;
  category: {
    id: number;
    category: string;
  };
};

export type Todos = Todo[];

export type Category = {
  id: number;
  createdAt: string;
  category: string;
  category_type: string;
  user_Id: string;
};

export type Categories = Category[];
