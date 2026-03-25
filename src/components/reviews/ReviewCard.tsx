import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ReviewCard as ReviewCardType } from '../../types/reviews';

interface ReviewCardProps {
  review: ReviewCardType;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Cover Image */}
      {review.cover_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={review.cover_image}
            alt={review.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category Badge */}
        {review.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-3">
            {review.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {review.title}
        </h3>

        {/* Rating */}
        {review.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(review.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {review.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Source and Date */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {review.source_site && (
            <>
              <span>{review.source_site}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={review.published_at || review.created_at}>
            {new Date(review.published_at || review.created_at).toLocaleDateString()}
          </time>
        </div>

        {/* Summary */}
        {review.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {review.excerpt}
          </p>
        )}

        {/* Read More Button */}
        {review.source_url ? (
          <a
            href={review.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Read more →
          </a>
        ) : (
          <Link
            to={`/reviews/${review.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Read more →
          </Link>
        )}
      </div>
    </article>
  );
}
