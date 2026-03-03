import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorWysiwygProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function EditorWysiwyg({
  value,
  onChange,
  placeholder = "Digite o conteúdo... Use placeholders como {{nome_paciente}}, {{data}}, {{cpf}}.",
  className = "",
  minHeight = "200px",
}: EditorWysiwygProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold", "italic", "underline",
    "color", "background",
    "list", "bullet",
    "blockquote", "link",
  ];

  return (
    <div className={className}>
      <style>{`
        .editor-wysiwyg .ql-toolbar.ql-snow { border-color: rgba(155, 135, 245, 0.4); border-radius: 12px 12px 0 0; background: hsl(var(--muted) / 0.3); }
        .editor-wysiwyg .ql-container.ql-snow { border-color: rgba(155, 135, 245, 0.4); border-radius: 0 0 12px 12px; min-height: ${minHeight}; }
        .editor-wysiwyg .ql-editor { min-height: ${minHeight}; font-size: 14px; }
        .editor-wysiwyg .ql-editor.ql-blank::before { color: hsl(var(--muted-foreground)); font-style: normal; }
        .editor-wysiwyg .ql-snow .ql-stroke { stroke: rgba(155, 135, 245, 0.35); }
        .editor-wysiwyg .ql-snow .ql-fill { fill: rgba(155, 135, 245, 0.6); }
        .editor-wysiwyg .ql-snow .ql-picker { color: hsl(var(--foreground)); }
        .editor-wysiwyg .ql-toolbar .ql-picker-label.ql-active { color: #9b87f5; }
      `}</style>
      <div className="editor-wysiwyg">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
