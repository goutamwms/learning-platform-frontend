import type { SaveStatus } from '../../types';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    'saving...': {
      text: 'Saving...',
      className: 'text-[#9ca3af]',
    },
    'saved': {
      text: 'Saved',
      className: 'text-green-600 dark:text-green-400',
    },
    'error': {
      text: 'Error saving',
      className: 'text-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`text-sm ${config.className}`}>
      {status === 'saving...' && (
        <span className="inline-flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {config.text}
        </span>
      )}
      {status === 'saved' && (
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
          {config.text}
        </span>
      )}
      {status === 'error' && (
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {config.text}
        </span>
      )}
    </span>
  );
}
