"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Toolbar from "./Toolbar"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useState } from "react"
import { Label } from "../ui/label"
import ErrorText from "../ErrorText"

interface RichTextEditorProps {
  onChange: (e: string) => void
  content: string
  errorText?: string
  isRequired?: boolean
  label?: string
  showToolbar?: boolean
}

const RichTextEditor = ({
  onChange,
  content,
  errorText,
  isRequired,
  label,
  showToolbar = true,
}: RichTextEditorProps) => {
  const [isListActive, setIsListActive] = useState(false)

  const handleChange = (newContent: string) => {
    onChange(newContent)
  }
  const editor = useEditor({
    content: content,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Insert Blog Content",
      }),
    ],
    editorProps: {
      attributes: {
        class: `flex flex-col justify-start border-b px-3 border-r border-l border-foreground dark:border-border text-base items-start w-full gap-3 py-4 rounded-bl-md rounded-br-md outline-none min-h-20`,
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor) {
      setIsListActive(editor.isActive("bulletList"))
    }
  }, [editor?.state])

  return (
    <div className="grid w-full items-center gap-1.5">
      <div className="flex items-center">
        {label && (
          <Label className={`${!showToolbar ? "mb-2" : ""}`}>
            {label}
            {isRequired ? <span className="!text-red-600">&nbsp;*</span> : null}
          </Label>
        )}
      </div>
      {showToolbar && <Toolbar editor={editor} content={content} />}
      <EditorContent
        className={`${!showToolbar ? "editor-border" : ""} relative -top-1.5`}
        content={content}
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          width: "100%",
        }}
        // style={{ whiteSpace: "pre-line" }}
        editor={editor}
      />
      {errorText && <ErrorText text={errorText} />}
    </div>
  )
}

export default RichTextEditor
