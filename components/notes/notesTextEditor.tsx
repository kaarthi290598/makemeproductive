"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Underline as UnderlineIcon,
  List,
  Strikethrough,
  Save,
  Eraser,
  X,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createNote, updateNote } from "@/lib/actions/notesData";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type NotesTextEditorProps = {
  title: string;
  category: string;
  noteId?: number;
  initialContent?: string;
};

const NotesTextEditor = ({
  title,
  category,
  noteId,
  initialContent,
}: NotesTextEditorProps) => {
  const [, setRefresh] = useState(0);
  const router = useRouter();
  const isEditMode = !!noteId;

  const editor = useEditor({
    extensions: [StarterKit.configure({}), Underline],
    content: initialContent || "<p>Start writing your note...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] w-full px-4 py-3 text-foreground [&_p]:my-2 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-bold [&_u]:underline [&_s]:line-through [&_ul_li]:text-foreground [&_ol_li]:text-foreground [&_ul_li::marker]:text-foreground [&_ol_li::marker]:text-foreground",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const update = () => setRefresh((x) => x + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // Load initial content when editor is ready
  useEffect(() => {
    if (editor && initialContent && isEditMode) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, isEditMode]);

  // Functions

  const { mutate: saveNoteMutate, isPending: saveNotePending } = useMutation({
    mutationFn: isEditMode
      ? (data: { title: string; category: string; content: string }) =>
          updateNote({
            noteId: noteId!,
            title: data.title,
            content: data.content,
            category: data.category,
          })
      : createNote,
    onSuccess: () => {
      toast.success(
        isEditMode ? "Note updated successfully!" : "Note added successfully!"
      );
      router.push("/app/notes");
    },
    onError: (err: Error) => {
      toast.error(
        `Error ${isEditMode ? "updating" : "adding"} note: ${err.message}`
      );
    },
  });

  if (!editor) return null;

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.commands.clearContent();
            }}
            className="h-8"
          >
            <Eraser className="mr-2 h-4 w-4" /> Clear
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.back();
            }}
            className="h-8"
            disabled={saveNotePending}
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (!title.trim()) {
                toast.error("Please enter a title");
                return;
              }
              if (!category) {
                toast.error("Please select a category");
                return;
              }
              saveNoteMutate({
                title,
                category,
                content: editor?.getHTML() || "",
              });
            }}
            disabled={saveNotePending}
            className="h-8"
          >
            {saveNotePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> {isEditMode ? "Update" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto rounded-b-lg bg-background">
          <EditorContent
            editor={editor}
            className="h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_ul_li::marker]:text-foreground [&_.ProseMirror_ol_li::marker]:text-foreground [&_.ProseMirror_ul_li]:text-foreground [&_.ProseMirror_ol_li]:text-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default NotesTextEditor;
