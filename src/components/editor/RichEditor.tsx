import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { uploadService } from '../../services';

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Keep a stable ref to the editor instance so paste/drop handlers
  //    (captured once during useEditor) can always access the latest value
  //    without causing stale-closure warnings.
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;

    try {
      const { url } = await uploadService.uploadImage(file);
      currentEditor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, []); // editorRef is a stable ref — no dependency needed

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#aa3bff] underline hover:text-[#9331e6]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            'bg-[#1f2028] text-[#f3f4f6] p-4 rounded-lg overflow-x-auto font-mono text-sm my-4',
        },
      }),
      CharacterCount,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class:
            'bg-[#f4f3ec] dark:bg-[#2e303a] border border-[#e5e4e7] dark:border-[#3a3b45] px-3 py-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-[#e5e4e7] dark:border-[#3a3b45] px-3 py-2',
        },
      }),
    ],
    content,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }

          if (item.type === 'text/html') {
            const html = event.clipboardData?.getData('text/html');
            if (html) {
              const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch) {
                const src = imgMatch[1];
                if (src.startsWith('data:image/')) {
                  event.preventDefault();
                  const base64Data = src.split(',')[1];
                  const mimeType = src.split(';')[0].split(':')[1];
                  const binaryString = atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const blob = new Blob([bytes], { type: mimeType });
                  const file = new File([blob], 'screenshot.png', { type: mimeType });
                  handleImageUpload(file);
                  return true;
                }
              }

              if (html.includes('<table') || html.includes('<tr') || html.includes('<td')) {
                event.preventDefault();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const tableHtml = doc.body.innerHTML;
                // 2. Use editorRef instead of editor.current
                editorRef.current?.chain().focus().insertContent(tableHtml).run();
                return true;
              }
            }
          }

          if (item.type === 'text/plain') {
            const text = event.clipboardData?.getData('text/plain');
            if (
              text &&
              (text.startsWith('data:image/') || text.match(/\.(png|jpg|jpeg|gif|webp)$/i))
            ) {
              if (text.startsWith('data:image/')) {
                event.preventDefault();
                const base64Data = text.split(',')[1];
                const mimeType = text.split(';')[0].split(':')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mimeType });
                const file = new File([blob], 'screenshot.png', { type: mimeType });
                handleImageUpload(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // 3. Sync the editor instance into the ref after useEditor resolves
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleImageUpload]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-[#e5e4e7] dark:border-[#2e303a] rounded-lg overflow-hidden bg-white dark:bg-[#16171d]">
      <Toolbar editor={editor} onImageClick={handleImageButtonClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <EditorContent editor={editor} />
    </div>
  );
}
