import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';
import ReviewCardSkeleton from './ReviewCardSkeleton';

interface ReviewListProps {
  filters?: {
    status?: 'published' | 'draft' | 'all';
    featured?: boolean;
    category?: string;
    search?: string;
    sortBy?: 'latest' | 'rating' | 'title';
    limit?: number;
    offset?: number;
  };
}

export default function ReviewList({ filters }: ReviewListProps) {
  const { reviews, isLoading, isError, error } = useReviews(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Error loading reviews</div>
        {error instanceof Error && (
          <p className="text-gray-600 text-sm">{error.message}</p>
        )}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No reviews found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
