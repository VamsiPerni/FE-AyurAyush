import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Send, CalendarPlus, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../../contexts/AppContext';
import { chatService } from '../../services/chatService';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChatMessage } from '../../components/patient/ChatMessage';
import { TypingIndicator } from '../../components/patient/TypingIndicator';
import { showErrorToast } from '../../utils/toastMessageHelper';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { handleSetUser } = useAuthContext();
  
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Persist conversation globally once completed per Spec §12
  useEffect(() => {
    if (status === 'completed' && conversationId) {
      localStorage.setItem('conversationId', conversationId);
      if (typeof handleSetUser === 'function') {
        handleSetUser({ conversationId });
      }
    }
  }, [status, conversationId, handleSetUser]);

  const handleStartConsultation = async () => {
    try {
      setLoading(true);
      const startRes = await chatService.startConversation();
      const cid = startRes.data?.conversationId || startRes.conversationId;
      const greeting = startRes.data?.greeting || startRes.greeting;
      setConversationId(cid);
      setStatus('active');
      
      const initialMsgs = [];
      if (greeting) {
        initialMsgs.push({ id: Date.now() + 1, sender: 'bot', text: greeting });
      }

      // Spec rule: auto-send first message
      const firstMsgText = 'Hello, I need a consultation';
      initialMsgs.push({ id: Date.now() + 2, sender: 'user', text: firstMsgText });
      setMessages(initialMsgs);
      
      setSending(true);
      const msgRes = await chatService.sendMessage(cid, firstMsgText);
      const replyText = msgRes.data?.aiResponse || msgRes.aiResponse;
      const newStatus = msgRes.data?.status || msgRes.status;
      
      setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'bot', text: replyText }]);
      if (newStatus) setStatus(newStatus);
      
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to start AI consultation.');
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending || status === 'completed') return;
    
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    
    try {
      setSending(true);
      const msgRes = await chatService.sendMessage(conversationId, text);
      const replyText = msgRes.data?.aiResponse || msgRes.aiResponse;
      const newStatus = msgRes.data?.status || msgRes.status;
      
      if (replyText) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: replyText }]);
      }
      if (newStatus) setStatus(newStatus);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // 1. Unstarted State
  if (!conversationId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <PageHeader title="AI Consultation" subtitle="Start a guided symptom discussion before booking" />
        <Card className="text-center py-16 border border-neutral-100 shadow-sm">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex flex-col items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-9 h-9 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">AyurAyush AI Assistant</h1>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Our AI will ask you a few questions about your symptoms to determine urgency and recommend the right specialist.
          </p>
          <Button size="lg" onClick={handleStartConsultation} loading={loading}>
            Start Consultation
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-4 h-[calc(100vh-140px)] flex flex-col">
      <PageHeader 
        title="AI Consultation" 
        subtitle="Please answer clearly so we can assist you better" 
      />
      
      {/* Chat Container */}
      <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner flex flex-col overflow-hidden relative">
        
        {/* Messages List */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          aria-live="polite"
        >
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p>Type a message to begin...</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg.text} sender={msg.sender} />
          ))}
          
          {sending && <TypingIndicator />}
          
          <div ref={messagesEndRef} className="h-4 w-full" />
        </div>

        {/* Status Completed Banner */}
        {status === 'completed' && (
          <div className="bg-success-50 border-t border-success-100 p-4 animate-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center text-success-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-success-900">Consultation Complete</h4>
                  <p className="text-sm text-success-700">You are now ready to book your appointment.</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/patient/book-appointment')} 
                variant="success"
                icon={CalendarPlus}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-neutral-100 flex items-end gap-3 z-10 shrink-0">
          <textarea
            className="flex-1 resize-none bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-shadow min-h-[48px] max-h-[120px] placeholder:text-neutral-400"
            placeholder={status === 'completed' ? "Consultation has ended." : "Type your symptoms..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={status === 'completed' || sending}
            rows={1}
          />
          <Button 
            className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center p-0" 
            onClick={handleSendMessage}
            disabled={!input.trim() || status === 'completed' || sending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ChatbotPage };
export default ChatbotPage;
