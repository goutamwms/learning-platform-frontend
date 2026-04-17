import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCategory } from '../hooks';
import { Button, Input } from '../components/common';

export function CreateCategory() {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; slug?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { title?: string; slug?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createCategory.mutateAsync({ title, slug, description });
      navigate('/admin');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-6">
        Create Category
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          onBlur={() => {
            if (title && !slug) {
              setSlug(generateSlug(title));
            }
          }}
          placeholder="e.g., Coding Patterns"
          error={errors.title}
        />

        <Input
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setErrors((prev) => ({ ...prev, slug: undefined }));
          }}
          placeholder="e.g., coding-patterns"
          error={errors.slug}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            placeholder="A brief description of this category..."
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? 'Creating...' : 'Create Category'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
