import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { Review } from '../../types/reviews';
import { Trash2, Edit, Plus, Star, Calendar, Eye } from 'lucide-react';

export function ReviewAdmin() {
  const navigate = useNavigate();
  const { reviews, isLoading, deleteReview, isDeleting } = useReviews({
    status: 'all',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredReviews = reviews.filter((review) => {
    if (statusFilter === 'all') return true;
    return review.status === statusFilter;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个测评吗？')) {
      await deleteReview(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">测评管理</h1>
          <p className="text-gray-600">管理所有测评内容</p>
        </div>
        <button
          onClick={() => navigate('/reviews/admin/new')}
          className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建测评
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">状态筛选：</span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部 ({reviews.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已发布 ({reviews.filter((r) => r.status === 'published').length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              草稿 ({reviews.filter((r) => r.status === 'draft').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">暂无测评内容</p>
            <button
              onClick={() => navigate('/reviews/admin/new')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              创建第一个测评 →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    测评
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    统计
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {review.cover_image && (
                          <img
                            src={review.cover_image}
                            alt={review.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {review.title}
                            </h3>
                            {review.featured && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                精选
                              </span>
                            )}
                          </div>
                          {review.rating && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                        {review.category || '未分类'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          review.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : review.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {review.status === 'published'
                          ? '已发布'
                          : review.status === 'draft'
                          ? '草稿'
                          : '已归档'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{review.view_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(
                            review.published_at || review.created_at
                          ).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/reviews/admin/${review.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={isDeleting}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
