const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:8000';

export const uploadService = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    const fullUrl = data.url.startsWith('http') ? data.url : `${UPLOAD_BASE_URL}${data.url}`;
    return { url: fullUrl };
  },
};
