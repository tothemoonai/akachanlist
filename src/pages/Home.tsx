import React, { useRef } from 'react';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { Footer } from '../components/Footer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useProjectData } from '../hooks/useProjectData';
import { Category } from '../types';

export const Home: React.FC = () => {
  const { data, isLoading, isError } = useProjectData('akachanlist');
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage />;
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
