interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div 
      className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none lesson-content"
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        '--tw-prose-body': 'inherit',
        '--tw-prose-headings': 'inherit',
        '--tw-prose-links': '#aa3bff',
      } as React.CSSProperties}
    />
  );
}
