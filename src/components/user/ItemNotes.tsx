import { useState } from 'react';
import { MessageSquare, Edit2, X, Check } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ItemNotesProps {
  listItemId: string;
  notes?: string;
  size?: 'small' | 'large';
}

export function ItemNotes({ listItemId, notes, size = 'small' }: ItemNotesProps) {
  const { language } = useLanguage();
  const { updateUserNotes } = useUserList();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserNotes(listItemId, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(notes || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2 w-full">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={language === 'zh' ? '添加备注...' : 'メモを追加...'}
          className="flex-1 min-w-0 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          rows={size === 'large' ? 4 : 2}
          disabled={isSaving}
        />
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title={language === 'zh' ? '保存' : '保存'}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title={language === 'zh' ? '取消' : 'キャンセル'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 w-full">
      <MessageSquare className={`flex-shrink-0 ${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 mt-0.5`} />
      {notes ? (
        <div className="flex-1 min-w-0">
          <p className={`text-gray-600 break-words ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
            {notes}
          </p>
        </div>
      ) : (
        <p className={`text-gray-400 italic ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
          {language === 'zh' ? '无备注' : 'メモなし'}
        </p>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
        title={language === 'zh' ? '编辑备注' : 'メモを編集'}
      >
        <Edit2 className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
    </div>
  );
}
