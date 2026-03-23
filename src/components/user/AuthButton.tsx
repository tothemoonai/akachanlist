import { useState } from 'react';
import { Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail } from '../../utils/validation';

export function AuthButton() {
  const { user, signIn, signOut, loading } = useAuth();
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading) {
    return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />;
  }

  const handleLoginClick = () => {
    setShowDialog(true);
    setEmail('');
    setMessage(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: language === 'zh' ? '请输入有效的邮箱地址' : '有効なメールアドレスを入力してください' });
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(email);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({
        type: 'success',
        text: language === 'zh'
          ? '登录链接已发送到您的邮箱，请查收'
          : 'ログインリンクをメールで送信しました'
      });
      setEmail('');
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={language === 'zh' ? '登出' : 'ログアウト'}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{language === 'zh' ? '登出' : 'ログアウト'}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleLoginClick}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />
        {language === 'zh' ? '登录' : 'ログイン'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '登录' : 'ログイン'}
            </h2>

            {!message ? (
              <form onSubmit={handleEmailSubmit}>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'zh'
                    ? '输入您的邮箱地址，我们将发送登录链接给您'
                    : 'メールアドレスを入力すると、ログインリンクを送信します'}
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'zh' ? 'your@email.com' : 'your@email.com'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {language === 'zh' ? '取消' : 'キャンセル'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email}
                    className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 rounded-lg transition-colors"
                  >
                    {submitting
                      ? (language === 'zh' ? '发送中...' : '送信中...')
                      : (language === 'zh' ? '发送链接' : 'リンクを送信')
                    }
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className={`text-sm mb-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {message.text}
                </p>

                {message.type === 'success' && (
                  <p className="text-xs text-gray-500 mb-4">
                    {language === 'zh'
                      ? '请检查您的邮箱并点击链接完成登录'
                      : 'メールを確認し、リンクをクリックしてログインを完了してください'}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
                  >
                    {language === 'zh' ? '关闭' : '閉じる'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
