import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { ReviewFormData } from '../../types/reviews';
import { Star, X, Save, Upload } from 'lucide-react';
import { useTiptapEditor } from '../../hooks/useTiptapEditor';

interface ReviewEditorProps {
  initialData?: Partial<ReviewFormData>;
  isEditing?: boolean;
}

export function ReviewEditor({ initialData, isEditing = false }: ReviewEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createReview, updateReview, isCreating, isUpdating } = useReviews();

  const [formData, setFormData] = useState<ReviewFormData>(
    initialData || {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      featured: false,
    }
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.cover_image
  );

  const editor = useTiptapEditor({
    content: formData.content,
    onUpdate: (content) => {
      setFormData({ ...formData, content });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mutationFn = isEditing
      ? ({ id, review }: { id: string; review: Partial<ReviewFormData> }) =>
          updateReview({ id, review: formData })
      : (review: Partial<ReviewFormData>) => createReview(review);

    await mutationFn(formData);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    navigate('/reviews/admin');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: isEditing ? formData.slug : generateSlug(value),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑测评' : '创建测评'}
          </h1>
          <button
            onClick={() => navigate('/reviews/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片
            </label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {imageFile ? imageFile.name : '选择图片'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (formData.rating || 0)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              来源链接
            </label>
            <input
              type="url"
              value={formData.source_url || ''}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              内容
            </label>
            {editor && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded transition-colors ${
                      editor.isActive('bold')
                        ? 'bg-pink-100 text-pink-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded transition-colors ${
                      editor.isActive('italic')
                        ? 'bg-pink-100 text-pink-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 rounded transition-colors ${
                      editor.isActive('heading', { level: 2 })
                        ? 'bg-pink-100 text-pink-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded transition-colors ${
                      editor.isActive('bulletList')
                        ? 'bg-pink-100 text-pink-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    • List
                  </button>
                </div>
                <div className="prose max-w-none p-4 min-h-[300px]">
                  <editor.Content />
                </div>
              </div>
            )}
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'draft' | 'published' | 'archived',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">精选</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/reviews/admin')}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isCreating || isUpdating ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
