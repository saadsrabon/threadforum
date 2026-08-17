"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your post…",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[180px] px-4 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
  ];

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white", className)}>
      <div className="flex gap-1 border-b border-border bg-zinc-50 px-2 py-1.5">
        {tools.map(({ icon: Icon, action, active }) => (
          <button
            key={Icon.name}
            type="button"
            onClick={action}
            className={cn(
              "rounded-lg p-2 text-muted hover:bg-white hover:text-foreground",
              active && "bg-white text-primary shadow-sm",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
      {!editor.getText().trim() && (
        <p className="pointer-events-none -mt-[170px] px-4 py-3 text-sm text-muted">{placeholder}</p>
      )}
    </div>
  );
}
