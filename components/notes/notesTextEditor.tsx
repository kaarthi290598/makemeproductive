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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const NotesTextEditor = () => {
  const [, setRefresh] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit.configure({}), Underline],
    content: "<p>Hello World! 🌎️</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg focus:outline-none border border-gray-200 shadow-sm w-full h-full rounded-lg p-3 overflow-y-auto",
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

  if (!editor) return null;

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-sidebar p-4">
      {/* Toolbar */}
      <div className="mb-4 flex gap-2 border-b border-muted pb-2">
        <Toggle
          size="sm"
          variant="outline"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          variant="outline"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          variant="outline"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
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
        >
          <List className="h-4 w-4" />
        </Toggle>

        {/* Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("HTML:", editor.getHTML());
            console.log("Text:", editor.getText());
          }}
        >
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col gap-2">
        <EditorContent editor={editor} className="h-full flex-1" />
      </div>
    </div>
  );
};

export default NotesTextEditor;
