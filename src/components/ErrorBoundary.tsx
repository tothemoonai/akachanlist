import React, { Component, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorBoundaryContent: React.FC<{
  error: Error | null;
  onReload: () => void;
}> = ({ error, onReload }) => {
  const { language } = useLanguage();

  const text = {
    zh: {
      title: '应用出错了',
      fallback: '未知错误',
      button: '重新加载'
    },
    ja: {
      title: 'アプリでエラーが発生しました',
      fallback: '不明なエラー',
      button: '再読み込み'
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8" role="alert" aria-live="assertive">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {text[language].title}
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || text[language].fallback}
        </p>
        <button
          onClick={onReload}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          {text[language].button}
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryContent
          error={this.state.error}
          onReload={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
