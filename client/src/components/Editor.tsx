import { useRef, useCallback } from 'react';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    onCursorChange: (cursor: { line: number; ch: number }) => void;
}

export default function Editor({ content, onChange, onCursorChange }: EditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const handleSelect = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const pos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, pos);
        const lines = textBefore.split('\n');
        const line = lines.length - 1;
        const ch = lines[lines.length - 1].length;

        onCursorChange({ line, ch });
    }, [onCursorChange]);

    return (
        <div className="editor">
            <textarea
                ref={textareaRef}
                className="editor-textarea"
                value={content}
                onChange={handleChange}
                onSelect={handleSelect}
                onClick={handleSelect}
                onKeyUp={handleSelect}
                placeholder="Start typing..."
                spellCheck="true"
            />
        </div>
    );
}
