export default function ReviewCardSkeleton() {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover Image Placeholder */}
      <div className="h-48 bg-gray-200 animate-pulse" />

      <div className="p-6">
        {/* Badge Placeholder */}
        <div className="w-16 h-6 bg-gray-200 rounded-full mb-3 animate-pulse" />

        {/* Title Placeholder */}
        <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />

        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="ml-2 w-8 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Source and Date Placeholder */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-1 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Summary Placeholders */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>

        {/* Button Placeholder */}
        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </article>
  );
}
