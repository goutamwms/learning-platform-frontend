import { useState, useRef, useEffect } from 'react';

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1.5 px-3 text-sm font-medium text-[rgb(221,221,221)] hover:bg-[#555] rounded transition-colors"
      >
        <span className="flex items-center gap-1">
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          {title}
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isOpen ? (height ?? 500) : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div className="pl-4 py-1">{children}</div>
      </div>
    </div>
  );
}
