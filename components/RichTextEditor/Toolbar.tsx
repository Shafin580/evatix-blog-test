"use client"

import React from "react"
import { type Editor } from "@tiptap/react"
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Underline,
  Quote,
  Undo,
  Redo,
  Code,
  Heading6,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  editor: any | null
  content: string
}

const Toolbar = ({ editor, content }: Props) => {
  if (!editor) {
    return null
  }

  const toolbarClasses = "rounded-md p-2 hover:bg-slate-100"

  return (
    <div className="flex w-full items-start rounded-tl-md rounded-tr-md border border-foreground p-1.5 dark:border-border">
      <div className="flex w-full flex-wrap items-center justify-start gap-5">
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          className={cn(toolbarClasses, editor.isActive("bold") && "bg-slate-200")}
        >
          <Bold className="size-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          className={cn(toolbarClasses, editor.isActive("italic") && "bg-slate-200")}
        >
          <Italic className="size-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
          }}
          className={cn(toolbarClasses, editor.isActive("underline") && "bg-slate-200")}
        >
          <Underline className="size-4" />
        </button>
        {/* <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          className={
            editor.isActive("strike")
              ? "bg-sky-700  p-2 rounded-lg"
              : " hover:bg-sky-500 hover:"
          }
        >
          <Strikethrough className="w-5 h-5" />
        </button> */}
        {/* <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 6 }).run();
          }}
          className={
            editor.isActive("heading", { level: 6 })
              ? "bg-sky-700  p-2 rounded-lg"
              : " hover:bg-sky-500 hover:"
          }
        >
          <Heading6 className="w-5 h-5" />
        </button> */}

        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={cn(toolbarClasses, editor.isActive("bulletlist") && "bg-slate-200")}
        >
          <List className="size-4" />
        </button>
        {/* <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={
            editor.isActive("orderedList")
              ? "bg-sky-700 text-white p-2 rounded-lg"
              : " hover:bg-sky-500 hover:text-white"
          }
        >
          <ListOrdered className="w-5 h-5" />
        </button> */}
      </div>
    </div>
  )
}

export default Toolbar
