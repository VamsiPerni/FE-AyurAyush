import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, sender }) => {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'} animate-in slide-in-from-bottom-2`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-600' : 'bg-primary-50 border border-primary-100'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary-600" />}
      </div>
      <div className={`
        px-4 py-3 rounded-2xl text-sm break-words
        ${isUser 
          ? 'bg-primary-600 text-white rounded-tr-sm shadow-md' 
          : 'bg-white border border-neutral-100 text-neutral-700 shadow-sm rounded-tl-sm'
        }
      `}>
        {message}
      </div>
    </div>
  );
};

export { ChatMessage };
export default ChatMessage;
