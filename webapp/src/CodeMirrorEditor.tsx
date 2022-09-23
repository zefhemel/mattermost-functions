import React, { useEffect, useRef } from "react";
import { basicSetup, EditorView } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { ViewPlugin, ViewUpdate, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

export function CodeMirrorEditor({
  code,
  onChange,
}: {
  code: string;
  onChange: (code: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current) {
      new EditorView({
        doc: code,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          javascript(),
          ViewPlugin.fromClass(
            class {
              update(update: ViewUpdate): void {
                if (update.docChanged) {
                  onChange(update.state.doc.toString());
                }
              }
            }
          ),
        ],
        parent: editorRef.current,
      });
    }
  }, []);
  return <div ref={editorRef}></div>;
}
