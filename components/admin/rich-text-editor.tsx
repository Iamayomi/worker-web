"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
 Bold,
 Code,
 Code2,
 Heading1,
 Heading2,
 Heading3,
 Italic,
 Link2,
 List,
 ListOrdered,
 Minus,
 Quote,
 Redo2,
 Strikethrough,
 Underline as UnderlineIcon,
 Undo2,
 Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ToolbarButton({
 onClick,
 active,
 disabled,
 label,
 children,
}: {
 onClick: () => void;
 active?: boolean;
 disabled?: boolean;
 label: string;
 children: React.ReactNode;
}) {
 return (
 <button
 type="button"
 onClick={onClick}
 disabled={disabled}
 aria-label={label}
 title={label}
 className={cn(
 " p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
 active
 ? "bg-primary/10 text-primary"
 : "text-muted-foreground hover:bg-secondary hover:text-foreground"
 )}
 >
 {children}
 </button>
 );
}

function setLink(editor: Editor) {
 const previousUrl = editor.getAttributes("link").href as string | undefined;
 const url = window.prompt("Link URL", previousUrl ?? "https://");
 if (url === null) return;
 if (url === "") {
 editor.chain().focus().extendMarkRange("link").unsetLink().run();
 return;
 }
 const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
 editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
}

export function RichTextEditor({
 value,
 onChange,
 placeholder = "Start writing...",
 disabled,
}: {
 value: string;
 onChange: (html: string) => void;
 placeholder?: string;
 disabled?: boolean;
}) {
 const editor = useEditor({
 extensions: [
 StarterKit,
 Underline,
 Link.configure({ openOnClick: false }),
 Placeholder.configure({ placeholder }),
 ],
 content: value || "",
 editable: !disabled,
 immediatelyRender: false,
 onUpdate: ({ editor }) => {
 onChange(editor.getHTML());
 },
 });

 useEffect(() => {
 if (!editor) return;
 const current = editor.getHTML();
 if (value !== current) {
 editor.commands.setContent(value || "");
 }
 }, [value, editor]);

 if (!editor) {
 return (
 <div className="min-h-[220px] border border-border/15 bg-muted/30 p-4">
 <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent" />
 </div>
 );
 }

 const toggle = (
 command: () => void
 ) => (e: React.MouseEvent) => {
 e.preventDefault();
 command();
 };

 return (
 <div
 className={cn(
 "overflow-hidden border border-border/15 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20",
 disabled && "opacity-60"
 )}
 >
 <div className="flex flex-wrap items-center gap-0.5 border-b border-border/15 bg-muted/30 px-2 py-1.5">
 <ToolbarButton
 label="Undo"
 onClick={() => editor.chain().focus().undo().run()}
 disabled={!editor.can().undo()}
 >
 <Undo2 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Redo"
 onClick={() => editor.chain().focus().redo().run()}
 disabled={!editor.can().redo()}
 >
 <Redo2 className="h-4 w-4" />
 </ToolbarButton>
 <span className="mx-1 h-5 w-px bg-border" />
 <ToolbarButton
 label="Bold"
 onClick={() => editor.chain().focus().toggleBold().run()}
 active={editor.isActive("bold")}
 >
 <Bold className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Italic"
 onClick={() => editor.chain().focus().toggleItalic().run()}
 active={editor.isActive("italic")}
 >
 <Italic className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Underline"
 onClick={() => editor.chain().focus().toggleUnderline().run()}
 active={editor.isActive("underline")}
 >
 <UnderlineIcon className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Strikethrough"
 onClick={() => editor.chain().focus().toggleStrike().run()}
 active={editor.isActive("strike")}
 >
 <Strikethrough className="h-4 w-4" />
 </ToolbarButton>
 <span className="mx-1 h-5 w-px bg-border" />
 <ToolbarButton
 label="Heading 1"
 onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
 active={editor.isActive("heading", { level: 1 })}
 >
 <Heading1 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Heading 2"
 onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
 active={editor.isActive("heading", { level: 2 })}
 >
 <Heading2 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Heading 3"
 onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
 active={editor.isActive("heading", { level: 3 })}
 >
 <Heading3 className="h-4 w-4" />
 </ToolbarButton>
 <span className="mx-1 h-5 w-px bg-border" />
 <ToolbarButton
 label="Bullet list"
 onClick={() => editor.chain().focus().toggleBulletList().run()}
 active={editor.isActive("bulletList")}
 >
 <List className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Ordered list"
 onClick={() => editor.chain().focus().toggleOrderedList().run()}
 active={editor.isActive("orderedList")}
 >
 <ListOrdered className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Blockquote"
 onClick={() => editor.chain().focus().toggleBlockquote().run()}
 active={editor.isActive("blockquote")}
 >
 <Quote className="h-4 w-4" />
 </ToolbarButton>
 <span className="mx-1 h-5 w-px bg-border" />
 <ToolbarButton
 label="Inline code"
 onClick={() => editor.chain().focus().toggleCode().run()}
 active={editor.isActive("code")}
 >
 <Code className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Code block"
 onClick={() => editor.chain().focus().toggleCodeBlock().run()}
 active={editor.isActive("codeBlock")}
 >
 <Code2 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Link"
 onClick={() => setLink(editor)}
 active={editor.isActive("link")}
 >
 <Link2 className="h-4 w-4" />
 </ToolbarButton>
 <ToolbarButton
 label="Remove link"
 onClick={() => editor.chain().focus().unsetLink().run()}
 disabled={!editor.isActive("link")}
 >
 <Unlink className="h-4 w-4" />
 </ToolbarButton>
 <span className="mx-1 h-5 w-px bg-border" />
 <ToolbarButton
 label="Horizontal rule"
 onClick={() => editor.chain().focus().setHorizontalRule().run()}
 >
 <Minus className="h-4 w-4" />
 </ToolbarButton>
 </div>
 <div
 className="tiptap-content max-h-[480px] min-h-[220px] overflow-y-auto p-4"
 onClick={toggle(() => editor.commands.focus())}
 >
 <EditorContent editor={editor} />
 </div>
 </div>
 );
}
