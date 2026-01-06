import React from 'react';
import { AIChatInput } from '../components/ui/ai-chat-input';

const Chat: React.FC = () => {
  return (
    <div className="flex-1 min-h-full bg-[#f8fafc] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Assistente IA</h1>
        <p className="text-slate-500">Como posso ajudar você hoje?</p>
      </div>
      <AIChatInput />
    </div>
  );
};

export default Chat;