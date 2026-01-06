import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessageToAI, ChatMessage, ChatMode } from '../lib/openai';
import { useStore } from '../store';
import { ChatSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ChatOptions {
  reasoning?: boolean;
  webSearch?: boolean;
}

export const useChatAI = () => {
  const { projects } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load sessions from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        // Restore last session if exists, or just stay empty
      } catch (e) {
        console.error("Failed to load chat sessions", e);
      }
    }
  }, []);

  // Save sessions to LocalStorage
  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Update current session when messages change
  useEffect(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages, updatedAt: new Date().toISOString() } 
          : s
      ));
    }
  }, [messages, currentSessionId]);

  const createSession = useCallback((projectId?: string) => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: projectId 
        ? `Chat do Projeto ${projects.find(p => p.id === projectId)?.name || ''}`
        : 'Nova Conversa',
      messages: [],
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    return newSession.id;
  }, [projects]);

  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [currentSessionId]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  const sendMessage = async (
    content: string, 
    file?: { name: string, content: string }, 
    mode: ChatMode = 'prompt',
    options: ChatOptions = {}
  ) => {
    // Ensure we have a session
    if (!currentSessionId) {
      createSession();
    }

    // Abort previous request if any
    if (loading) stop();

    setLoading(true);
    abortControllerRef.current = new AbortController();
    
    let userContent = content;
    if (file) {
      userContent += `\n\n[Arquivo Anexado: ${file.name}]\n\`\`\`\n${file.content}\n\`\`\``;
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userContent }
    ];

    setMessages(newMessages);

    // Update session title if it's the first message and generic title
    if (messages.length === 0 && currentSessionId) {
       setSessions(prev => prev.map(s => {
         if (s.id === currentSessionId && s.title === 'Nova Conversa') {
           return { ...s, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') };
         }
         return s;
       }));
    }

    try {
      // Add empty placeholder for AI response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let responseContent = "";

      await sendMessageToAI(
        newMessages, 
        projects, 
        mode, 
        options,
        (chunk) => {
          responseContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            // Update the last message (AI response)
            updated[updated.length - 1] = { role: 'assistant', content: responseContent };
            return updated;
          });
        },
        abortControllerRef.current.signal
      );
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
         setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content += "\n\n*[Geração interrompida pelo usuário]*";
            return updated;
         });
      } else {
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1].role === 'assistant' && updated[updated.length - 1].content === '') {
             updated[updated.length - 1].content = `❌ Erro: ${error.message}`;
          } else {
             updated.push({ role: 'assistant', content: `❌ Erro: ${error.message}` });
          }
          return updated;
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearHistory = useCallback(() => {
      setMessages([]);
      // Maybe also clear current session messages or delete it?
      // For now, just clear the view.
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    stop,
    clearHistory,
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession
  };
};
