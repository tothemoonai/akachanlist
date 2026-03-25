import { useParams, Link } from 'react-router-dom';
import { useReviewBySlug } from '../../hooks/useReviewBySlug';
import { LoadingSpinner } from '../LoadingSpinner';
import { Star, Calendar, User, ExternalLink, ArrowLeft } from 'lucide-react';

export function ReviewDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { review, isLoading, isError } = useReviewBySlug(slug!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">
            测评内容加载失败或不存在
          </p>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回测评列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-600">
          <li>
            <Link to="/" className="hover:text-pink-600 transition-colors">
              首页
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/reviews" className="hover:text-pink-600 transition-colors">
              测评
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{review.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        {review.cover_image && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <img
              src={review.cover_image}
              alt={review.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          {review.category && (
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
              {review.category}
            </span>
          )}
          {review.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">{review.rating}</span>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {review.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {review.author_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{review.author_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(review.published_at || review.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: review.content }}
          className="prose prose-pink prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-pink-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-50"
        />
      </div>

      {/* Footer */}
      {review.source_url && (
        <footer className="border-t pt-6">
          <a
            href={review.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
          >
            <span>查看原文</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </footer>
      )}
    </article>
  );
}
