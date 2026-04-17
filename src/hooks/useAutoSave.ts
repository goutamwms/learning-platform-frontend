import { useState, useEffect, useRef, useCallback } from 'react';
import type { SaveStatus } from '../types';

export function useAutoSave(
  content: string,
  lessonId: number | null,
  onSave: (content: string) => Promise<void>,
  debounceMs: number = 500
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContentRef = useRef<string | null>(null);

  const save = useCallback(async (value: string) => {
    if (lessonId === null) return;
    
    try {
      setSaveStatus('saving...');
      await onSave(value);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [lessonId, onSave]);

  useEffect(() => {
    if (lessonId === null) return;
    
    if (initialContentRef.current === null) {
      initialContentRef.current = content;
      return;
    }

    if (content === initialContentRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving...');
    timeoutRef.current = setTimeout(() => {
      save(content);
      initialContentRef.current = content;
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, lessonId, save, debounceMs]);

  return { saveStatus, saveNow: () => save(content) };
}
