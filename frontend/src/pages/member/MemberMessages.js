import React, { useState, useEffect, useRef } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { MessageSquare, Search, Send, User, Plus, X } from 'lucide-react';

const MemberMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const startConversation = async (recipientId) => {
    try {
      const response = await api.post('/conversations', { recipient_id: recipientId });
      setSelectedConversation(response.data);
      setShowNewConversation(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-oswald text-xl text-text-primary uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />
                Messages
              </h1>
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" strokeWidth={1} />
                <p className="text-text-muted font-manrope">Aucune conversation</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-sm rounded-lg transition-colors"
                >
                  Démarrer
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                    selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-oswald text-text-primary truncate text-sm">
                          {conv.other_participant_name}
                        </h3>
                        {conv.last_message_at && (
                          <span className="text-xs text-text-muted">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-text-muted truncate mt-1">
                          {conv.last_sender_id === user?.id ? 'Vous: ' : ''}
                          {conv.last_message}
                        </p>
                      )}
                      {conv.unread_count > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-oswald text-lg text-text-primary">
                    {selectedConversation.other_participant_name}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white/10 text-text-primary rounded-bl-md'
                      }`}
                    >
                      <p className="font-manrope text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-text-muted'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary font-manrope"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-4" strokeWidth={1} />
                <p className="text-text-muted font-manrope">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>

        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-paper rounded-xl p-6 w-full max-w-md border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-oswald text-xl text-text-primary uppercase">Nouvelle Conversation</h2>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Rechercher un membre..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary font-manrope"
                  autoFocus
                />
              </div>

              <div className="mt-4 max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => startConversation(result.id)}
                      className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-oswald text-text-primary">{result.name}</p>
                        <p className="text-xs text-text-muted">{result.type}</p>
                      </div>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center text-text-muted py-8 font-manrope">Aucun résultat</p>
                ) : (
                  <p className="text-center text-text-muted py-8 font-manrope">Tapez au moins 2 caractères</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberMessages;
