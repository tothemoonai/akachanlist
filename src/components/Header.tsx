import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserList } from '../contexts/UserListContext';
import { AuthButton } from './user/AuthButton';
import { Menu, Baby, ShoppingCart, BookOpen } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ListSidebar } from './user/ListSidebar';
import { ShoppingListView } from './user/ShoppingListView';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { language } = useLanguage();
  const { user, currentList } = useUserList();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {language === 'ja' ? (
                    <>
                      <span className="sm:hidden">アカチャンリスト</span>
                      <span className="hidden sm:inline">{title}</span>
                    </>
                  ) : (
                    title
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link
                to="/reviews"
                className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={language === 'zh' ? '测评' : 'レビュー'}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <LanguageSwitcher />
              <AuthButton />

              {user && (
                <>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={language === 'zh' ? '我的清单' : 'マイリスト'}
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language === 'zh' ? '我的清单' : 'マイリスト'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowShoppingList(true)}
                    className="relative p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={language === 'zh' ? '购物清单' : 'ショッピングリスト'}
                  >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {currentList && (
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-pink-600 font-medium truncate">
              {language === 'zh' ? '当前清单：' : '現在のリスト：'}{currentList.name}
            </div>
          )}
        </div>
      </header>

      <ListSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <ShoppingListView isOpen={showShoppingList} onClose={() => setShowShoppingList(false)} />
    </>
  );
}
