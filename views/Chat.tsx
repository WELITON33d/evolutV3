import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AIChatInput } from '../components/ui/ai-chat-input';
import { Logo } from '../components/Logo';
import { useChatAI, ChatOptions } from '../hooks/useChatAI';
import { useStore } from '../store';
import { Sparkles, ArrowRight, Menu } from 'lucide-react';
import { ChatMode } from '../lib/openai';
import { ChatToolbar } from '../components/chat/ChatToolbar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatSidebar } from '../components/chat/ChatSidebar';

const Chat: React.FC = () => {
  const { messages, loading, sendMessage, stop, sessions, currentSessionId, createSession, switchSession, deleteSession } = useChatAI();
  const { projects } = useStore();
  const [mode, setMode] = useState<ChatMode>('prompt');
  // Removed options state as reasoning/webSearch are disabled
  const options: ChatOptions = { reasoning: false, webSearch: false };
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { projectId } = location.state || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get recent active projects (limit 3) with safety check
  const activeProjects = (projects || [])
    .filter(p => p && p.status !== 'Concluído')
    .slice(0, 3);

  const handleProjectClick = (project: any) => {
    // Create a new session linked to this project
    const newSessionId = createSession(project.id);
    
    // Optional: Pre-fill or send a starting message
    // For now, we just let the user type, but the session is linked.
    // Or we can send the context prompt immediately as before.
    try {
      sendMessage(
        `Gostaria de continuar o desenvolvimento do projeto "${project.name}". Analise o contexto atual e sugira os próximos passos ou crie prompts para novas funcionalidades.`, 
        undefined,
        mode,
        options
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle navigation from other pages
  useEffect(() => {
    if (projectId && projects && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        handleProjectClick(project);
        // Clear state to prevent re-triggering on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [projectId, projects]);

  useEffect(() => {
    if (scrollRef.current) {
      // Auto-scroll to bottom only if user is already near bottom or it's a new message
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom || messages.length > 0) {
         scrollRef.current.scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
         });
      }
    }
  }, [messages]);

  const handleSendMessage = (text: string, file?: { name: string, content: string }) => {
    sendMessage(text, file, mode, options);
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-slate-50/50">
      
      {/* Sidebar - Persistent on Desktop, Drawer on Mobile */}
      <div className={`hidden lg:block w-72 border-r border-slate-200 bg-white h-full`}>
         <ChatSidebar 
           sessions={sessions}
           currentSessionId={currentSessionId}
           onSelectSession={switchSession}
           onDeleteSession={deleteSession}
           onNewSession={() => createSession()}
           isOpen={true}
           onClose={() => {}}
         />
      </div>

      {/* Mobile Sidebar Drawer */}
      <ChatSidebar 
           sessions={sessions}
           currentSessionId={currentSessionId}
           onSelectSession={switchSession}
           onDeleteSession={deleteSession}
           onNewSession={() => createSession()}
           isOpen={isSidebarOpen}
           onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full min-w-0">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-4 left-4 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Messages Area - Only visible when there are messages */}
        <div className={`flex-1 min-h-0 overflow-y-auto p-4 md:p-8 pb-48 pt-12 space-y-8 transition-opacity duration-500 ${messages.length > 0 ? 'opacity-100' : 'opacity-0'}`} ref={scrollRef}>
          {messages.map((msg, idx) => (
              <MessageBubble key={idx} role={msg.role} content={msg.content} />
          ))}
          {/* Invisible spacer to prevent content from being hidden behind input */}
          <div className="h-12" />
        </div>

        {/* Input Area - Centered when empty, Bottom when active */}
        <div className={`absolute left-0 right-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center z-20 ${
          messages.length === 0 
            ? 'top-0 bottom-0' 
            : 'bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pt-32 pb-8'
        }`}>
          {messages.length === 0 && (
              <div className="mb-6 text-center animate-fade-in w-full px-4">
                <div className="flex justify-center relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                  <Logo className="scale-[1.5] md:scale-[2] relative z-10" />
                </div>
                
                {/* Active Projects Suggestions */}
                {activeProjects.length > 0 && (
                  <div className="max-w-2xl mx-auto animate-slide-up">
                    <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <Sparkles size={12} /> Continuar Projeto
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeProjects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className="text-left group bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 text-xs truncate pr-2">{project.name}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide font-bold">{project.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:gap-1.5 transition-all mt-2">
                            Retomar <ArrowRight size={12} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          )}
          
          <div className={`w-full max-w-3xl px-4 md:px-6 transition-all duration-700 ${messages.length === 0 ? 'scale-100' : 'scale-100'}`}>
              <AIChatInput 
                onSend={handleSendMessage} 
                loading={loading} 
                onStop={stop} 
                toolbar={<ChatToolbar mode={mode} setMode={setMode} options={options} setOptions={() => {}} embedded />}
              />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;