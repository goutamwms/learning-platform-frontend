import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { topicsApi, type Topic } from '../services/api';

export function TopicViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id));
    }
  }, [id]);

  const loadTopic = async (topicId: number) => {
    setLoading(true);
    try {
      const data = await topicsApi.getById(topicId);
      setTopic(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load topic';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = (sectionId: number, total: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) + 1) % total,
    }));
  };

  const prevImage = (sectionId: number, total: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [sectionId]: ((prev[sectionId] || 0) - 1 + total) % total,
    }));
  };

  const getEmbedUrl = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const renderSection = (section: Topic['sections'][0]) => {
    const metadata = section.section_metadata || {};
    
    switch (section.section_type) {
      case 'heading':
        return (
          <h2 className="text-2xl font-bold mt-6 mb-4">
            {section.content}
          </h2>
        );

      case 'text':
        return (
          <p className="mb-4 whitespace-pre-wrap">{section.content}</p>
        );

      case 'link':
        return (
          <div className="mb-4">
            <a
              href={section.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {metadata.linkText || section.content}
            </a>
          </div>
        );

      case 'image':
        const images = metadata.images || [];
        if (images.length === 0) return null;
        if (images.length === 1) {
          return (
            <div className="mb-4">
              <img
                src={images[0]}
                alt=""
                className="max-w-full rounded-lg"
              />
            </div>
          );
        }
        const currentIdx = currentImageIndex[section.id] || 0;
        return (
          <div className="mb-4">
            <div className="relative">
              <img
                src={images[currentIdx]}
                alt=""
                className="max-w-full rounded-lg"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => prevImage(section.id, images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => nextImage(section.id, images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'video':
        const embedUrl = section.content ? getEmbedUrl(section.content) : null;
        return (
          <div className="mb-4">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full aspect-video rounded-lg"
                allowFullScreen
              />
            ) : (
              <a
                href={section.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Watch Video
              </a>
            )}
          </div>
        );

      case 'file':
        const files = metadata.files || [];
        return (
          <div className="mb-4 space-y-2">
            {files.map((fileUrl: string, idx: number) => (
              <a
                key={idx}
                href={fileUrl}
                download
                className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                <span>📎</span>
                <span>{fileUrl.split('/').pop()}</span>
              </a>
            ))}
          </div>
        );

      case 'code':
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
            <code>{section.content}</code>
          </pre>
        );

      case 'list':
        const items = section.content?.split('\n').filter(Boolean) || [];
        return (
          <ul className="list-disc pl-6 mb-4">
            {items.map((item, idx) => (
              <li key={idx}>{item.replace(/^-\s*/, '')}</li>
            ))}
          </ul>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">
            {section.content}
          </blockquote>
        );

      case 'divider':
        return <hr className="my-6 border-gray-300" />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          {error || 'Topic not found'}
        </div>
        <Link to="/topics" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/topics" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Topics
      </Link>

      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>by {topic.author?.username || 'Unknown'}</span>
            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
            <span>{topic.view_count} views</span>
            <span className={`px-2 py-1 rounded text-xs ${topic.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {topic.is_public ? 'Public' : 'Private'}
            </span>
          </div>

          {topic.description && (
            <p className="text-gray-600 mb-4">{topic.description}</p>
          )}

          {topic.tags && topic.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {topic.tags.map((tag) => (
                <span key={tag.id} className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose max-w-none">
          {topic.sections?.map((section) => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}