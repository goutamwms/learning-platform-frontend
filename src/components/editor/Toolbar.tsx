import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor;
  onImageClick?: () => void;
}

const CODE_LANGUAGES = [
  { value: '', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'dockerfile', label: 'Dockerfile' },
];

export function Toolbar({ editor, onImageClick }: ToolbarProps) {
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCodeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openHtmlEditor = () => {
    setHtmlContent(editor.getHTML());
    setShowHtmlModal(true);
  };

  const applyHtml = () => {
    editor.commands.setContent(htmlContent);
    setShowHtmlModal(false);
  };

  const closeHtmlModal = () => {
    setShowHtmlModal(false);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumnBefore = () => editor.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor.chain().focus().addRowAfter().run();
  const deleteRow = () => editor.chain().focus().deleteRow().run();
  const deleteTable = () => editor.chain().focus().deleteTable().run();
  const mergeCells = () => editor.chain().focus().mergeCells().run();
  const splitCell = () => editor.chain().focus().splitCell().run();
  const toggleHeaderColumn = () => editor.chain().focus().toggleHeaderColumn().run();
  const toggleHeaderRow = () => editor.chain().focus().toggleHeaderRow().run();
  const toggleHeaderCell = () => editor.chain().focus().toggleHeaderCell().run();

  const insertCodeBlock = (language: string) => {
    editor.chain().focus().toggleCodeBlock({ language }).run();
    setShowCodeDropdown(false);
  };

  const isTableActive = editor.isActive('table');
  const isCodeBlockActive = editor.isActive('codeBlock');
  const currentLanguage = editor.getAttributes('codeBlock').language || '';

  const buttons = [
    {
      group: 'formatting',
      items: [
        {
          icon: 'B',
          title: 'Bold',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
        },
        {
          icon: 'I',
          title: 'Italic',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
        },
        {
          icon: 'U',
          title: 'Underline',
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: editor.isActive('underline'),
        },
        {
          icon: 'S',
          title: 'Strikethrough',
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive('strike'),
        },
      ],
    },
    {
      group: 'headings',
      items: [
        {
          icon: 'H1',
          title: 'Heading 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive('heading', { level: 1 }),
        },
        {
          icon: 'H2',
          title: 'Heading 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
        },
        {
          icon: 'H3',
          title: 'Heading 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive('heading', { level: 3 }),
        },
      ],
    },
    {
      group: 'lists',
      items: [
        {
          icon: 'UL',
          title: 'Bullet List',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
        },
        {
          icon: 'OL',
          title: 'Numbered List',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
        },
        {
          icon: 'LI',
          title: 'List Item',
          action: () => editor.chain().focus().sinkListItem('listItem').run(),
          isActive: false,
        },
      ],
    },
    {
      group: 'blocks',
      items: [
        {
          icon: 'Block',
          title: 'Code Block',
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive('codeBlock'),
        },
        {
          icon: 'Link',
          title: 'Add Link',
          action: addLink,
          isActive: editor.isActive('link'),
        },
        {
          icon: 'Quote',
          title: 'Blockquote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive('blockquote'),
        },
      ],
    },
    {
      group: 'code',
      items: [
        {
          icon: '`',
          title: 'Inline Code',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor.isActive('code'),
        },
        {
          icon: 'HTML',
          title: 'View HTML Source',
          action: openHtmlEditor,
          isActive: false,
        },
      ],
    },
    {
      group: 'media',
      items: [{ icon: 'IMG', title: 'Insert Image', action: onImageClick, isActive: false }],
    },
    {
      group: 'table',
      items: [
        { icon: 'Tbl', title: 'Insert Table', action: insertTable, isActive: false },
        {
          icon: '+Col',
          title: 'Add Column Before',
          action: addColumnBefore,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'Col+',
          title: 'Add Column After',
          action: addColumnAfter,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: '-Col',
          title: 'Delete Column',
          action: deleteColumn,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: '+Row',
          title: 'Add Row Before',
          action: addRowBefore,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'Row+',
          title: 'Add Row After',
          action: addRowAfter,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: '-Row',
          title: 'Delete Row',
          action: deleteRow,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'DelTbl',
          title: 'Delete Table',
          action: deleteTable,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'Merge',
          title: 'Merge Cells',
          action: mergeCells,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'Split',
          title: 'Split Cell',
          action: splitCell,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'TH',
          title: 'Toggle Header Column',
          action: toggleHeaderColumn,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'THR',
          title: 'Toggle Header Row',
          action: toggleHeaderRow,
          isActive: false,
          disabled: !isTableActive,
        },
        {
          icon: 'THC',
          title: 'Toggle Header Cell',
          action: toggleHeaderCell,
          isActive: false,
          disabled: !isTableActive,
        },
      ],
    },
  ];

  const getCurrentLanguageLabel = () => {
    const lang = CODE_LANGUAGES.find(l => l.value === currentLanguage);
    return lang ? lang.label : 'Code Block';
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#e5e4e7] dark:border-[#2e303a] bg-[#fafafa] dark:bg-[#1a1b1f]">
      {buttons.map((group, groupIndex) => (
        <div key={group.group} className="flex items-center gap-1">
          {groupIndex > 0 && <div className="w-px h-5 bg-[#e5e4e7] dark:bg-[#2e303a] mx-1" />}
          {group.items.map(item => (
            <button
              key={item.title}
              onClick={item.action}
              title={item.title}
              disabled={(item as any).disabled ?? false}
              className={`p-1.5 rounded text-sm font-medium min-w-[28px] transition-colors ${
                item.isActive
                  ? 'bg-[#aa3bff] text-white'
                  : ((item as any).disabled ?? false)
                    ? 'text-[#c4c3c7] dark:text-[#5a5a65] cursor-not-allowed opacity-50'
                    : 'text-[#6b6375] dark:text-[#9ca3af] hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a]'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      ))}
      <div className="w-px h-5 bg-[#e5e4e7] dark:bg-[#2e303a] mx-1" />
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setShowCodeDropdown(!showCodeDropdown)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
            isCodeBlockActive
              ? 'bg-[#aa3bff] text-white'
              : 'text-[#6b6375] dark:text-[#9ca3af] hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a]'
          }`}
        >
          <span>{getCurrentLanguageLabel()}</span>
          <span className="text-xs">▼</span>
        </button>
        {showCodeDropdown && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-[#1a1b1f] border border-[#e5e4e7] dark:border-[#2e303a] rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-[140px]">
            {CODE_LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => insertCodeBlock(lang.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a] transition-colors ${
                  currentLanguage === lang.value
                    ? 'bg-[#aa3bff] text-white'
                    : 'text-[#6b6375] dark:text-[#9ca3af]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1a1b1f] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e4e7] dark:border-[#2e303a]">
              <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">HTML Source</h3>
              <button
                onClick={closeHtmlModal}
                className="p-1 rounded hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a] text-[#6b6375] dark:text-[#9ca3af]"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                className="w-full h-64 p-3 font-mono text-sm bg-[#fafafa] dark:bg-[#16171d] text-[#1a1a1a] dark:text-[#f3f4f6] border border-[#e5e4e7] dark:border-[#2e303a] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
                spellCheck={false}
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#e5e4e7] dark:border-[#2e303a]">
              <button
                onClick={closeHtmlModal}
                className="px-4 py-2 text-sm font-medium text-[#6b6375] dark:text-[#9ca3af] bg-[#f4f3ec] dark:bg-[#2e303a] rounded-lg hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={applyHtml}
                className="px-4 py-2 text-sm font-medium text-white bg-[#aa3bff] rounded-lg hover:bg-[#9331e6] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
