"use client";

import { useEffect, useMemo, useState, useTransition, type ElementType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Inbox,
  ListTodo,
  Plus,
  TrendingUp,
} from "lucide-react";
import { startOfDay } from "date-fns";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Categories, Category, Todo } from "@/lib/types/type";
import { toggleTodo, updateTodo, updateTodoOrder } from "@/lib/actions/todosData";
import { EditDeleteButton } from "./editDelete";
import { TaskDialog } from "./TodoAddEditTaskForm";
import { useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const INBOX_ID = "inbox";

const PALETTE = [
  {
    header: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    plus: "text-blue-700 hover:bg-slate-100 dark:text-blue-300 dark:hover:bg-slate-800",
    card: "border-l-blue-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
  {
    header: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    plus: "text-emerald-700 hover:bg-slate-100 dark:text-emerald-300 dark:hover:bg-slate-800",
    card: "border-l-emerald-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
  {
    header: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
    plus: "text-amber-700 hover:bg-slate-100 dark:text-amber-300 dark:hover:bg-slate-800",
    card: "border-l-amber-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
  {
    header: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    plus: "text-violet-700 hover:bg-slate-100 dark:text-violet-300 dark:hover:bg-slate-800",
    card: "border-l-violet-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
  {
    header: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    plus: "text-rose-700 hover:bg-slate-100 dark:text-rose-300 dark:hover:bg-slate-800",
    card: "border-l-rose-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
  {
    header: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    plus: "text-cyan-700 hover:bg-slate-100 dark:text-cyan-300 dark:hover:bg-slate-800",
    card: "border-l-cyan-500",
    drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
  },
];

const INBOX_TONE = {
  header: "text-slate-600 dark:text-slate-300",
  dot: "bg-slate-400",
  plus: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  card: "border-l-slate-400",
  drop: "bg-[#edf2ff] outline-1 outline-dashed outline-[#aebfff] dark:bg-blue-950/35 dark:outline-blue-400/50",
};

type ColumnDef = {
  id: string;
  title: string;
  tone: (typeof PALETTE)[number];
};

function columnIdFor(todo: Todo, categoryIds: Set<number>) {
  const id = todo.category?.id ?? todo.category_Id;
  if (id && categoryIds.has(id)) return String(id);
  return INBOX_ID;
}

export function TodoKanban({
  todos,
  categories,
}: {
  todos: Todo[];
  categories: Categories;
}) {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const [dialog, setDialog] = useState<{
    todo?: Todo;
    categoryId?: string;
  } | null>(null);

  const boardCategories = useMemo(() => {
    if (!categoryFilter) return categories;
    return categories.filter((item) => item.category === categoryFilter);
  }, [categories, categoryFilter]);

  const categoryIds = useMemo(
    () => new Set(categories.map((item) => item.id)),
    [categories],
  );

  const filtered = useMemo(() => {
    let list = categoryFilter
      ? todos.filter((todo) => todo.category?.category === categoryFilter)
      : todos;
    if (fromDate && toDate) {
      list = list.filter((todo) => {
        if (!todo.deadline) return false;
        const d = new Date(todo.deadline);
        return d >= new Date(fromDate) && d <= new Date(toDate);
      });
    }
    return list;
  }, [todos, categoryFilter, fromDate, toDate]);

  const columnDefs = useMemo(() => {
    const cols: ColumnDef[] = boardCategories.map((item, index) => ({
      id: String(item.id),
      title: item.category,
      tone: PALETTE[index % PALETTE.length],
    }));

    const hasInbox = filtered.some(
      (todo) => columnIdFor(todo, categoryIds) === INBOX_ID,
    );
    if (hasInbox && !categoryFilter) {
      cols.unshift({ id: INBOX_ID, title: "Inbox", tone: INBOX_TONE });
    }
    return cols;
  }, [boardCategories, filtered, categoryIds, categoryFilter]);

  const [columns, setColumns] = useState<Record<string, Todo[]>>({});

  useEffect(() => {
    const next: Record<string, Todo[]> = {};
    columnDefs.forEach((col) => {
      next[col.id] = [];
    });
    filtered.forEach((todo) => {
      const id = columnIdFor(todo, categoryIds);
      if (!next[id]) next[id] = [];
      next[id].push(todo);
    });
    setColumns(next);
  }, [filtered, columnDefs, categoryIds]);

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((item) => map.set(item.id, item));
    return map;
  }, [categories]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const fromId = result.source.droppableId;
    const toId = result.destination.droppableId;
    if (fromId === toId && result.source.index === result.destination.index) {
      return;
    }

    const sourceAll = Array.from(columns[fromId] ?? []);
    const destAll = fromId === toId ? sourceAll : Array.from(columns[toId] ?? []);
    const sourceOpen = sourceAll.filter((todo) => !todo.isCompleted);
    const destOpen =
      fromId === toId ? sourceOpen : destAll.filter((todo) => !todo.isCompleted);
    const [moved] = sourceOpen.splice(result.source.index, 1);
    if (!moved) return;
    destOpen.splice(result.destination.index, 0, moved);

    const rebuild = (all: Todo[], open: Todo[]) => [
      ...open,
      ...all.filter((todo) => todo.isCompleted && todo.id !== moved.id),
    ];

    const next = {
      ...columns,
      [fromId]:
        fromId === toId
          ? rebuild(sourceAll, destOpen)
          : rebuild(sourceAll, sourceOpen),
      [toId]: fromId === toId ? rebuild(sourceAll, destOpen) : rebuild(destAll, destOpen),
    };
    setColumns(next);

    if (fromId !== toId && toId !== INBOX_ID) {
      const nextCategoryId = Number(toId);
      const nextCategory = categoryById.get(nextCategoryId);
      try {
        await updateTodo({
          id: moved.id,
          todoValues: {
            name: moved.name,
            category_Id: nextCategoryId,
            isCompleted: moved.isCompleted,
            deadline: moved.deadline ? new Date(moved.deadline) : null,
          },
        });
        const destList = next[toId].map((todo) =>
          todo.id === moved.id
            ? {
                ...todo,
                category_Id: nextCategoryId,
                category: nextCategory
                  ? { id: nextCategory.id, category: nextCategory.category }
                  : todo.category,
              }
            : todo,
        );
        setColumns({ ...next, [toId]: destList });
      } catch {
        toast.error("Could not move task");
        setColumns(columns);
        return;
      }
    }

    const ordered = columnDefs.flatMap((col) => next[col.id] ?? []);
    try {
      await updateTodoOrder(
        ordered.map((todo, index) => ({ id: todo.id, order: index })),
      );
    } catch {
      toast.error("Could not save order");
    }
  };

  const pending = todos.filter((todo) => !todo.isCompleted).length;
  const overdue = todos.filter(
    (todo) =>
      !todo.isCompleted &&
      todo.deadline &&
      new Date(todo.deadline) < new Date(),
  ).length;
  const completed = todos.filter((todo) => todo.isCompleted).length;
  const doneRate =
    todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        <Kpi label="Pending" value={pending} icon={ListTodo} tone="blue" />
        <Kpi label="Overdue" value={overdue} icon={AlertTriangle} tone="rose" />
        <Kpi
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          tone="emerald"
        />
        <Kpi
          label="Done rate"
          value={`${doneRate}%`}
          icon={TrendingUp}
          tone="violet"
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="-mx-1 flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 touch-pan-x">
          {columnDefs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
              Add a category to start the board.
            </div>
          ) : (
            columnDefs.map((col) => {
              const items = columns[col.id] ?? [];
              const openItems = items.filter((todo) => !todo.isCompleted);
              const doneItems = items.filter((todo) => todo.isCompleted);
              return (
                <section
                  key={col.id}
                  className={cn(
                    "flex h-full min-h-[min(70dvh,32rem)] w-[min(82vw,270px)] shrink-0 snap-start flex-col p-1",
                  )}
                >
                  <div className="mb-2 flex items-center gap-1.5 px-0.5">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      {col.id === INBOX_ID ? (
                        <Inbox className="size-3.5 text-slate-400" />
                      ) : (
                        <span className={cn("size-2 shrink-0 rounded-full", col.tone.dot)} />
                      )}
                      <h2
                        className={cn(
                          "truncate text-[11px] font-extrabold uppercase tracking-wider",
                          col.tone.header,
                        )}
                      >
                        {col.title}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                        {openItems.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDialog({
                          categoryId: col.id === INBOX_ID ? undefined : col.id,
                        })
                      }
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg transition-colors",
                        col.tone.plus,
                      )}
                      aria-label={`Add task to ${col.title}`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex min-h-[180px] flex-1 flex-col gap-2 overflow-y-auto rounded-[10px] p-0.5 transition-[background,outline] duration-150",
                          snapshot.isDraggingOver && col.tone.drop,
                        )}
                      >
                        {openItems.map((todo, index) => (
                          <Draggable
                            key={todo.id}
                            draggableId={String(todo.id)}
                            index={index}
                          >
                            {(drag, snap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className={cn(
                                  "cursor-grab active:cursor-grabbing",
                                  snap.isDragging && "opacity-45",
                                )}
                              >
                                <KanbanCard
                                  todo={todo}
                                  categories={categories}
                                  accent={col.tone.card}
                                  onEdit={() => setDialog({ todo })}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {openItems.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-slate-200 px-2.5 py-8 text-center text-[10px] leading-relaxed text-slate-400 dark:border-slate-700">
                            Nothing here yet.
                            <br />
                            Drop a card or tap +.
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>

                  {doneItems.length > 0 && (
                    <Collapsible className="mt-2">
                      <CollapsibleTrigger className="group flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 hover:bg-white/60 dark:hover:bg-slate-900/40">
                        <ChevronRight className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
                        Done
                        <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 font-bold dark:bg-slate-800">
                          {doneItems.length}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 flex flex-col gap-2">
                        {doneItems.map((todo) => (
                          <KanbanCard
                            key={todo.id}
                            todo={todo}
                            categories={categories}
                            accent={col.tone.card}
                            onEdit={() => setDialog({ todo })}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </section>
              );
            })
          )}
        </div>
      </DragDropContext>

      <TaskDialog
        open={!!dialog}
        setOpen={(open) => {
          if (!open) setDialog(null);
        }}
        categories={categories}
        todo={dialog?.todo}
        defaultCategoryId={dialog?.categoryId}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: ElementType;
  tone: "blue" | "rose" | "emerald" | "violet";
}) {
  const tones = {
    blue: {
      card: "border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/40 dark:border-blue-800/40 dark:from-blue-950/40 dark:to-blue-900/20",
      icon: "text-blue-600 dark:text-blue-400",
      value: "text-blue-900 dark:text-blue-300",
    },
    rose: {
      card: "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20",
      icon: "text-rose-600 dark:text-rose-400",
      value: "text-rose-900 dark:text-rose-300",
    },
    emerald: {
      card: "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20",
      icon: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-900 dark:text-emerald-300",
    },
    violet: {
      card: "border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-100/40 dark:border-violet-800/40 dark:from-violet-950/40 dark:to-violet-900/20",
      icon: "text-violet-600 dark:text-violet-400",
      value: "text-violet-900 dark:text-violet-300",
    },
  }[tone];

  return (
    <div
      className={cn(
        "flex min-w-[9.5rem] flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 sm:min-w-[140px] sm:gap-2.5 sm:px-3",
        tones.card,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", tones.icon)} />
      <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          "ml-auto font-mono text-sm font-extrabold tabular-nums",
          tones.value,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function KanbanCard({
  todo,
  categories,
  accent,
  onEdit,
}: {
  todo: Todo;
  categories: Categories;
  accent: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isOverdue =
    !todo.isCompleted &&
    !!todo.deadline &&
    new Date(todo.deadline) < startOfDay(new Date());

  return (
    <div
      className={cn(
        "group rounded-[11px] border border-[#e9edf1] border-l-[3px] bg-white p-3 shadow-[0_3px_9px_#18222d08] dark:border-slate-800 dark:bg-slate-950",
        accent,
        todo.isCompleted && "opacity-70",
        isOverdue && "border-rose-200 dark:border-rose-900/50",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => startTransition(() => toggleTodo(todo.id))}
          className="mt-0.5 shrink-0"
          aria-label={todo.isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          ) : todo.isCompleted ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <Circle className="size-4 text-slate-300 hover:text-emerald-600" />
          )}
        </button>
        <p
          className={cn(
            "min-w-0 flex-1 text-sm font-semibold leading-snug",
            todo.isCompleted
              ? "text-slate-400 line-through"
              : "text-slate-900 dark:text-white",
          )}
        >
          {todo.name}
        </p>
        <div className="shrink-0 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <EditDeleteButton todo={todo} onEdit={onEdit} />
        </div>
      </div>
      {todo.deadline && (
        <div className="mt-2 pl-6">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
              isOverdue
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                : "bg-white/70 text-slate-500 dark:bg-slate-900",
            )}
          >
            {new Date(todo.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export default TodoKanban;
