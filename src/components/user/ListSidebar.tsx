import { useState } from 'react';
import { X, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreateListDialog } from './CreateListDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface ListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ListSidebar({ isOpen, onClose }: ListSidebarProps) {
  const { lists, currentList, setCurrentList, deleteList } = useUserList();
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const handleDeleteList = async () => {
    if (listToDelete) {
      await deleteList(listToDelete);
      setListToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'zh' ? '我的清单' : 'マイリスト'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {lists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">
                  {language === 'zh'
                    ? '还没有创建任何清单'
                    : 'まだリストを作成していません'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`
                      group flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${currentList?.id === list.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setCurrentList(list);
                        onClose();
                      }}
                    >
                      <p className="font-medium text-gray-900 truncate">{list.name}</p>
                      {list.description && (
                        <p className="text-xs text-gray-500 truncate">{list.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          currentList?.id === list.id ? 'text-pink-500' : 'text-gray-400'
                        }`}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setListToDelete(list.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={language === 'zh' ? '删除' : '削除'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Create Button */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '创建新清单' : '新しいリスト'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateListDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!listToDelete}
        title={language === 'zh' ? '删除清单' : 'リストを削除'}
        message={
          language === 'zh'
            ? '确定要删除这个清单吗？此操作无法撤销。'
            : 'このリストを削除してもよろしいですか？この操作は元に戻せません。'
        }
        confirmLabel={language === 'zh' ? '删除' : '削除'}
        onConfirm={handleDeleteList}
        onCancel={() => setListToDelete(null)}
      />
    </>
  );
}
