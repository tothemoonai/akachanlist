import { useState } from 'react';
import ReviewList from '../components/reviews/ReviewList';

export default function Reviews() {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reviews</h1>
          <p className="text-gray-600">
            In-depth reviews and recommendations for baby products
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'featured'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Review List */}
        <ReviewList
          filters={{
            status: 'published',
            featured: filter === 'featured' ? true : undefined,
          }}
        />
      </div>
    </div>
  );
}
