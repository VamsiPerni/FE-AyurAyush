import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, sender }) => {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'} animate-slide-up`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm' : 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
      </div>
      <div className={`
        px-4 py-3 rounded-2xl text-sm break-words leading-relaxed
        ${isUser 
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm shadow-md' 
          : 'bg-white dark:bg-dark-elevated border border-neutral-100 dark:border-dark-border text-neutral-700 dark:text-neutral-200 shadow-sm rounded-tl-sm'
        }
      `}>
        {message}
      </div>
    </div>
  );
};

export { ChatMessage };
export default ChatMessage;
