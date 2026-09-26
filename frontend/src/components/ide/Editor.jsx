import React, { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

/**
 * Monaco Editor wrapper for Python code editing.
 * Exposes an `editorRef` to allow the parent to read the live editor value
 * at any time without relying on potentially-stale React state.
 *
 * @param {Object} props
 * @param {string} props.code - The controlled code value.
 * @param {Function} props.onChange - Called when the editor content changes.
 * @param {Function} props.onRun - Called when Ctrl+Enter is pressed.
 * @param {React.MutableRefObject} props.editorRef - Ref to expose the Monaco editor instance.
 */
export default function Editor({ code, onChange, onRun, editorRef }) {
  const handleEditorDidMount = (editor, monaco) => {
    // Store the editor instance so the parent can call editor.getValue() directly
    if (editorRef) editorRef.current = editor;

    // Bind Ctrl+Enter / Cmd+Enter to the Run action
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });
  };

  return (
    <MonacoEditor
      height="100%"
      language="python"
      theme="vs-light"
      value={code}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        wordWrap: 'on',
      }}
    />
  );
}
