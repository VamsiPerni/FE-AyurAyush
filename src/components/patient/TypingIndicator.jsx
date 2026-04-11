import { Bot } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex gap-3 max-w-[85%] self-start animate-slide-up">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
    </div>
    <div className="px-4 py-4 rounded-2xl bg-white dark:bg-dark-elevated border border-neutral-100 dark:border-dark-border shadow-sm rounded-tl-sm flex items-center gap-1.5 h-10">
      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

export { TypingIndicator };
export default TypingIndicator;
