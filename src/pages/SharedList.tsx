import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedList, supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Copy, Share2, Check, ArrowRight, Home, Plus } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SharedList() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { data: sharedList, isLoading, error } = useQuery({
    queryKey: ['sharedList', token],
    queryFn: () => getSharedList(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !sharedList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'zh' ? '链接不存在或已失效' : 'Link Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'zh'
              ? '该分享链接可能已被删除或设置为私密'
              : 'This shared link may have been deleted or set to private'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            {language === 'zh' ? '返回首页' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const totalItems = sharedList.items.length;
  const purchasedCount = sharedList.items.filter(i => i.is_purchased).length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToList = async () => {
    if (!user || !supabase) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      // Create a new list
      const { data: newList, error: createError } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name: `${sharedList.name} ${language === 'zh' ? '(来自分享)' : '(Shared)'}`,
          description: sharedList.description,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add all items to the new list
      for (const item of sharedList.items) {
        await supabase
          .from('user_list_items')
          .insert({
            user_list_id: newList.id,
            item_id: item.item_id,
            priority: 'medium',
            quantity: 1,
            notes: item.notes || null,
          });
      }

      setAdded(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Failed to add list:', error);
      alert(language === 'zh' ? '添加失败，请重试' : 'Failed to add. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Share2 className="w-8 h-8 text-pink-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sharedList.name}</h1>
                {sharedList.description && (
                  <p className="text-gray-600 mt-1">{sharedList.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'zh' ? '已复制' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {language === 'zh' ? '复制链接' : 'Copy Link'}
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {language === 'zh' ? `${totalItems} 个物品` : `${totalItems} items`}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              {language === 'zh' ? `已购买 ${purchasedCount}/${totalItems}` : `Purchased ${purchasedCount}/${totalItems}`}
            </div>
            {sharedList.view_count !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {language === 'zh' ? `查看 ${sharedList.view_count} 次` : `Viewed ${sharedList.view_count} times`}
              </div>
            )}
          </div>
        </div>

        {/* Add to List Button */}
        {user && !added && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <button
              onClick={handleAddToList}
              disabled={adding}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {language === 'zh' ? '添加中...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {language === 'zh' ? '添加到我的清单' : 'Add to My Lists'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {added && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              {language === 'zh' ? '成功添加！正在跳转...' : 'Successfully added! Redirecting...'}
            </p>
          </div>
        )}

        {!user && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <p className="text-center text-gray-600 mb-4">
              {language === 'zh'
                ? '登录后可以将此清单添加到你的账号'
                : 'Sign in to add this list to your account'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              {language === 'zh' ? '立即登录' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {language === 'zh' ? '清单内容' : 'List Contents'}
          </h2>
          <div className="grid gap-4">
            {sharedList.items.map((item, index) => (
              <div
                key={item.item_id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Item ID: {item.item_id.slice(0, 8)}...
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                  )}
                </div>
                {item.is_purchased && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {language === 'zh' ? '已购买' : 'Purchased'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            <Home className="w-5 h-5" />
            {language === 'zh' ? '返回首页' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
