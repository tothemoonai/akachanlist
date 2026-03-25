import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedReviews } from '../../hooks/useReviews';
import { Star, TrendingUp, X } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Review } from '../../types/reviews';

export function ReviewSidebar() {
  const { data: featuredData, isLoading } = useFeaturedReviews();
  const reviews = featuredData?.reviews || [];
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed right-0 top-20 w-80 h-[calc(100vh-5rem)] overflow-y-auto bg-white shadow-lg border-l">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-900">精选测评</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews?.map((review: Review) => (
                <Link
                  key={review.id}
                  to={`/reviews/${review.slug}`}
                  className="block group"
                >
                  <div className="p-3 rounded-lg border hover:border-pink-300 hover:shadow-md transition-all">
                    {review.rating && (
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {review.title}
                    </h3>
                    {review.category && (
                      <span className="text-xs text-pink-600 mt-1 inline-block">
                        {review.category}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Floating Button */}
      <button
        onClick={() => setIsMobileModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-colors"
        aria-label="查看精选测评"
      >
        <TrendingUp className="w-6 h-6" />
      </button>

      {/* Mobile Modal Overlay */}
      {isMobileModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900">精选测评</h2>
              </div>
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-73px)]">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews?.map((review: Review) => (
                    <Link
                      key={review.id}
                      to={`/reviews/${review.slug}`}
                      onClick={() => setIsMobileModalOpen(false)}
                      className="block"
                    >
                      <ReviewCard review={review} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
