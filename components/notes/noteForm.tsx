"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import NotesTextEditor from "./notesTextEditor";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { fetchNotesCategories } from "@/lib/actions/notesData";

type NotesMetaProps = {
  title: string;
  category: string;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  noteId?: number;
  initialContent?: string;
};

const NotesForm = ({
  title,
  category,
  onTitleChange,
  onCategoryChange,
  noteId,
  initialContent,
}: NotesMetaProps) => {
  //formschema
  const formSchema = z.object({
    title: z.string().min(3, {
      message: "Title must be at least 3 characters.",
    }),
    category: z.string().min(1, {
      message: "Category is required.",
    }),
    content: z.string().min(1, {
      message: "Content is required.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title,
      category,
      content: "",
    },
  });

  const {
    data: notesCategories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["notescategories"],
    queryFn: fetchNotesCategories,
  });

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-scroll rounded-lg border border-muted bg-card p-4 shadow-sm">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            name="title"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="note-category">Category</Label>
          <Select
            value={category}
            onValueChange={(val) => onCategoryChange(val)}
          >
            <SelectTrigger id="note-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <SelectItem value="" disabled>Loading categories...</SelectItem>
              ) : (
                notesCategories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.category}>
                    {cat.category}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Title */}

      <NotesTextEditor
        title={title}
        category={category}
        noteId={noteId}
        initialContent={initialContent}
      />
    </div>
  );
};

export default NotesForm;
