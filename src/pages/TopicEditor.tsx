import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { topicsApi, type Topic, type Tag } from '../services/api';

interface SectionBlock {
  id?: number;
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
  order: number;
}

export function TopicEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sections, setSections] = useState<SectionBlock[]>([
    { type: 'heading', content: '', order: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSection = (type: string) => {
    setSections([
      ...sections,
      { type, content: '', order: sections.length }
    ]);
  };

  const updateSection = (index: number, content: string) => {
    const updated = [...sections];
    updated[index].content = content;
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => (s.order = i));
    setSections(updated);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const uploadUrl = baseUrl ? `${baseUrl}/api/upload` : '/api/upload';
      const response = await fetch(
        uploadUrl,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fullUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
        const updated = [...sections];
        if (!updated[index].metadata) {
          updated[index].metadata = {};
        }
        updated[index].metadata = {
          ...updated[index].metadata,
          files: [...((updated[index].metadata as Record<string, unknown>).files as string[] || []), fullUrl]
        };
        setSections(updated);
      }
    } catch (err) {
      console.error('File upload failed', err);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const uploadUrl = baseUrl ? `${baseUrl}/api/upload` : '/api/upload';
      const response = await fetch(
        uploadUrl,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fullUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
        const updated = [...sections];
        if (!updated[index].metadata) {
          updated[index].metadata = {};
        }
        const existingImages = ((updated[index].metadata as Record<string, unknown>).images as string[] || []);
        updated[index].metadata = {
          ...updated[index].metadata,
          images: [...existingImages, fullUrl]
        };
        setSections(updated);
      }
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedSections = sections.map((s, i) => ({
        type: s.type,
        content: s.content || '',
        section_metadata: s.metadata || {},
        order: i,
      }));

      await topicsApi.create({
        title,
        description: description || undefined,
        is_public: isPublic,
        tags: tags.length > 0 ? tags : undefined,
        sections: formattedSections,
      });

      navigate('/topics');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create topic';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sectionTypes = [
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'text', label: 'Text', icon: '¶' },
    { type: 'link', label: 'Link', icon: '🔗' },
    { type: 'image', label: 'Image', icon: '🖼' },
    { type: 'video', label: 'Video', icon: '🎥' },
    { type: 'file', label: 'File', icon: '📎' },
    { type: 'code', label: 'Code', icon: '</>' },
    { type: 'list', label: 'List', icon: '•' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'divider', label: 'Divider', icon: '—' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Topic</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={3}
            maxLength={500}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Public (visible to others)</span>
          </label>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Content Sections</h2>
            <div className="flex gap-2">
              {sectionTypes.map((st) => (
                <button
                  key={st.type}
                  type="button"
                  onClick={() => addSection(st.type)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  title={st.label}
                >
                  {st.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 capitalize">{section.type}</span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>

                {section.type === 'heading' && (
                  <input
                    type="text"
                    value={section.content || ''}
                    onChange={(e) => updateSection(index, e.target.value)}
                    placeholder="Heading..."
                    className="w-full text-xl font-bold px-2 py-1 border-b focus:outline-none focus:border-blue-500"
                  />
                )}

                {section.type === 'text' && (
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => updateSection(index, e.target.value)}
                    placeholder="Write your content here..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                )}

                {section.type === 'link' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={section.content || ''}
                      onChange={(e) => updateSection(index, e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Link text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach((file) =>
                            handleImageUpload(index, file)
                          );
                        }
                      }}
                      className="w-full"
                    />
                    {(section.metadata as Record<string, unknown>)?.images && (
                      <div className="flex gap-2 flex-wrap">
                        {((section.metadata as Record<string, unknown>).images as string[]).map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} alt="" className="w-24 h-24 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...sections];
                                const images = ((updated[index].metadata as Record<string, unknown>).images as string[]).filter(
                                  (_, idx) => idx !== i
                                );
                                updated[index].metadata = {
                                  ...updated[index].metadata,
                                  images,
                                };
                                setSections(updated);
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'video' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={section.content || ''}
                      onChange={(e) => updateSection(index, e.target.value)}
                      placeholder="YouTube or Vimeo URL..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500">
                      Supports YouTube, Vimeo, and direct video URLs
                    </p>
                  </div>
                )}

                {section.type === 'file' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(index, e.target.files[0]);
                        }
                      }}
                      className="w-full"
                    />
                    {!!(section.metadata as Record<string, unknown>)?.files?.length && (
                      <div className="space-y-1">
                        {((section.metadata as Record<string, unknown>).files as string[]).map((url, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="text-sm">📎 {url.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'code' && (
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => updateSection(index, e.target.value)}
                    placeholder="// Your code here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm min-h-[150px]"
                  />
                )}

                {section.type === 'list' && (
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => updateSection(index, e.target.value)}
                    placeholder="- Item 1&#10;- Item 2&#10;- Item 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                )}

                {section.type === 'quote' && (
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => updateSection(index, e.target.value)}
                    placeholder="Enter quote..."
                    className="w-full px-3 py-2 border-l-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 italic"
                  />
                )}

                {section.type === 'divider' && (
                  <hr className="border-t border-gray-300 my-2" />
                )}
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No content sections yet. Click the buttons above to add content.
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !title}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Topic'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/topics')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}