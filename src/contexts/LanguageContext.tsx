import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化：从 URL → localStorage → 默认值
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') as Language | null;
    const storedLang = localStorage.getItem('preferred-lang') as Language | null;

    // 验证语言代码
    const validLang = urlLang || storedLang || 'zh';
    if (validLang === 'zh' || validLang === 'ja') {
      setLanguageState(validLang);
    }
    setIsReady(true);
  }, []); // 仅在组件挂载时执行一次

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-lang', lang);

    // 更新 URL 参数而不刷新页面
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url.toString());
  }, []);

  // 更新 HTML lang 属性
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'ja';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageReady: isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义 hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
