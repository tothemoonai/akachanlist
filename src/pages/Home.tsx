import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { Footer } from '../components/Footer';
import { Category } from '../types';
import { loadItemsData } from '../utils/data';

export const Home: React.FC = () => {
  const [data, setData] = useState<{ meta: any; categories: Category[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    loadItemsData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={data.meta.title} subtitle={data.meta.subtitle} />
      <CategoryNav
        categories={data.categories}
        onCategoryClick={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-8">
        {data.categories.map((category) => (
          <div
            key={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="mb-8 scroll-mt-40"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-pink-500">{category.title}</span>
            </h2>

            {category.subcategories.map((subcategory) => (
              <CategorySection
                key={subcategory.id}
                subcategory={subcategory}
                defaultExpanded={category.subcategories.indexOf(subcategory) === 0}
              />
            ))}
          </div>
        ))}
      </main>

      <Footer
        source="https://www.akachan.jp/junbilist/childbirth/"
        disclaimer="本清单仅供参考，具体需求请根据个人情况调整。内容翻译自日本网站，部分物品可能需要根据当地情况调整。"
      />
    </div>
  );
};
