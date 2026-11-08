"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FormField from "./FormField";

const MIN_LENGTH = 50;

/**
 * Stories are stored as plain text (blank line = new paragraph), so the editor
 * is paragraphs-only: one paragraph per line, read back with "\n" between.
 */
function textToDoc(text: string): JSONContent {
  return {
    type: "doc",
    content: text
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) =>
        line ? { type: "paragraph", content: [{ type: "text", text: line }] } : { type: "paragraph" }
      ),
  };
}

const plainTextOnly = StarterKit.configure({
  blockquote: false,
  bold: false,
  bulletList: false,
  code: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
  italic: false,
  link: false,
  listItem: false,
  listKeymap: false,
  orderedList: false,
  strike: false,
  trailingNode: false,
  underline: false,
});

type ContentEditorProps = {
  defaultValue?: string;
  placeholder?: string;
};

/**
 * รายละเอียด — Tiptap editor. A visually hidden textarea named "content" carries
 * the text into the form and enforces the same required / 50-character rule.
 */
export default function ContentEditor({ defaultValue = "", placeholder }: ContentEditorProps) {
  const [text, setText] = useState(defaultValue);
  const proxyRef = useRef<HTMLTextAreaElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [plainTextOnly],
    content: textToDoc(defaultValue),
    editorProps: {
      attributes: {
        id: "story-content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": "story-content-label",
        class: "min-h-44 px-4 py-3 text-base leading-relaxed outline-none sm:text-sm [&_p]:min-h-[1lh]",
      },
    },
    onUpdate: ({ editor: current }) => setText(current.getText({ blockSeparator: "\n" })),
  });

  useEffect(() => {
    proxyRef.current?.setCustomValidity(
      text.length < MIN_LENGTH ? `กรุณาเขียนรายละเอียดอย่างน้อย ${MIN_LENGTH} ตัวอักษร` : ""
    );
  }, [text]);

  useEffect(() => {
    const form = proxyRef.current?.form;
    if (!form || !editor) return;
    const onReset = () => {
      editor.commands.clearContent();
      setText("");
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [editor]);

  return (
    <FormField label="รายละเอียด" labelId="story-content-label">
      <div className="liquid-field relative min-h-44 rounded-lg text-foreground focus-within:border-ring focus-within:ring-2 focus-within:ring-gold/45">
        {text === "" && placeholder ? (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute top-3 left-4 right-4 text-base text-muted-foreground sm:text-sm"
          >
            {placeholder}
          </p>
        ) : null}
        <EditorContent editor={editor} />
        <textarea
          ref={proxyRef}
          name="content"
          value={text}
          onChange={() => undefined}
          onInvalid={() => editor?.commands.focus()}
          required
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-4 size-px resize-none opacity-0"
        />
      </div>
    </FormField>
  );
}
