import { useState, useEffect } from 'react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateListName, validateListDescription } from '../../utils/validation';

interface CreateListDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListDialog({ isOpen, onClose }: CreateListDialogProps) {
  const { createList } = useUserList();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const nameValidation = validateListName(name);
    if (!nameValidation.valid) {
      setErrors({ name: nameValidation.error });
      return;
    }

    // Validate description if provided
    if (description && !validateListDescription(description)) {
      setErrors({ name: language === 'zh' ? '描述过长' : '説明が長すぎます' });
      return;
    }

    setSubmitting(true);

    try {
      await createList({
        name,
        description: description || undefined,
      });
      onClose();
    } catch (error) {
      setErrors({ name: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {language === 'zh' ? '创建新清单' : '新しいリストを作成'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'zh' ? '清单名称' : 'リスト名'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'zh' ? '例如：待产包清单' : '例：出産準備リスト'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={100}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'zh' ? '描述（可选）' : '説明（任意）'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'zh' ? '添加一些备注...' : 'メモを追加...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {language === 'zh' ? '取消' : 'キャンセル'}
            </button>
            <button
              type="submit"
              disabled={submitting || !name}
              className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 rounded-lg transition-colors"
            >
              {submitting
                ? (language === 'zh' ? '创建中...' : '作成中...')
                : (language === 'zh' ? '创建' : '作成')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
