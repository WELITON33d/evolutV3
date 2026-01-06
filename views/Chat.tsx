import React from 'react';
import { AIChatInput } from '../components/ui/ai-chat-input';
import { Logo } from '../components/Logo';

const Chat: React.FC = () => {
  return (
    <div className="flex-1 min-h-full bg-[#f8fafc] flex flex-col items-center justify-center p-8">
      <div className="flex justify-center mb-12">
        <Logo className="scale-150" />
      </div>
      <AIChatInput />
    </div>
  );
};

export default Chat;