import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserList } from '../contexts/UserListContext';
import { AuthButton } from './user/AuthButton';
import { Menu, Baby } from 'lucide-react';
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Baby className="w-6 h-6 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <AuthButton />

              {user && (
                <>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language === 'zh' ? '我的清单' : 'マイリスト'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowShoppingList(true)}
                    className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {currentList && (
            <div className="mt-3 text-sm text-pink-600 font-medium">
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
