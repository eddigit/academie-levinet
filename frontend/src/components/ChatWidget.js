import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ChatWidget = ({ type = 'visitor' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initial greeting based on type
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = type === 'visitor' 
        ? "Bonjour ! 👋 Je suis l'assistant de l'Académie Jacques Levinet. Comment puis-je vous aider à découvrir le Self-Pro Krav (SPK) ?"
        : `Bonjour ${user?.full_name?.split(' ')[0] || ''} ! 👋 Je suis là pour vous accompagner dans l'utilisation de la plateforme. Comment puis-je vous aider ?`;
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, type, user]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const endpoint = type === 'visitor' ? '/assistant/visitor' : '/assistant/member';
      const response = await api.post(endpoint, {
        message: userMessage,
        session_id: sessionId
      });

      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, une erreur s'est produite. Veuillez réessayer." 
      }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Widget colors based on type
  const isVisitor = type === 'visitor';
  const primaryColor = isVisitor ? 'bg-primary' : 'bg-green-600';
  const primaryHover = isVisitor ? 'hover:bg-primary-dark' : 'hover:bg-green-700';

  return (
    <>
      {/* Chat Button - Responsive positioning */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 ${primaryColor} ${primaryHover} text-white p-3 sm:p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110`}
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Chat Window - Mobile First: Full screen on mobile, card on desktop */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] bg-paper sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-white/10 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className={`${primaryColor} p-3 sm:p-4 flex items-center justify-between safe-top`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="font-oswald text-white font-bold uppercase text-xs sm:text-sm">
                  {isVisitor ? 'Assistant Académie' : 'Assistant Membre'}
                </h3>
                <p className="text-white/70 text-[10px] sm:text-xs">
                  {isVisitor ? 'Découvrez le SPK' : 'Aide & Support'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background scroll-touch">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 ${
                    msg.role === 'user'
                      ? `${primaryColor} text-white rounded-br-sm`
                      : 'bg-paper border border-white/10 text-text-primary rounded-bl-sm'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-paper border border-white/10 rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">En train d'écrire...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Safe area aware */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-paper safe-bottom">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 bg-background border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-primary"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`${primaryColor} ${primaryHover} text-white p-2.5 sm:p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-muted text-[10px] sm:text-xs mt-2 text-center">
              Propulsé par l'IA • Académie Jacques Levinet
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
