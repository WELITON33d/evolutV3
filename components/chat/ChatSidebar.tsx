import React from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { ChatSession } from '../../types';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  isOpen,
  onClose
}) => {
  // Group sessions by date (Today, Yesterday, Previous 7 Days, Older)
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = new Date(session.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let group = 'Antigos';
    if (date.toDateString() === today.toDateString()) {
      group = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Ontem';
    }

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  // Sort groups order
  const groupOrder = ['Hoje', 'Ontem', 'Antigos'];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Histórico</h2>
          <button 
            onClick={onNewSession}
            className="p-2 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
            title="Nova Conversa"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-400 text-sm mt-10">
              Nenhuma conversa salva.
            </div>
          ) : (
            groupOrder.map(group => groupedSessions[group] && (
              <div key={group}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">{group}</h3>
                <div className="space-y-1">
                  {groupedSessions[group].map(session => (
                    <div 
                      key={session.id}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        currentSessionId === session.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                      onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                    >
                      <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-500' : 'text-slate-400'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.title || 'Nova Conversa'}
                        </p>
                        {session.projectId && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Projeto Vinculado
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
