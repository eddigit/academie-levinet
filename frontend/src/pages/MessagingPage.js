import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import UserAvatar from '../components/UserAvatar';
import { 
  MessageSquare, Search, Send, ChevronLeft, Plus, X, 
  Check, CheckCheck, Phone, Video, MoreVertical, 
  Smile, Paperclip, Mic
} from 'lucide-react';

const MessagingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
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
  const [conversationFilter, setConversationFilter] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les conversations au montage
  useEffect(() => {
    fetchConversations();
    
    // Polling pour les nouveaux messages toutes les 5 secondes
    pollIntervalRef.current = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, false);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Gérer la navigation avec conversationId
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === location.state.conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [location.state, conversations]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, true);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

  const fetchMessages = async (conversationId, scroll = true) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
      if (scroll) {
        setTimeout(scrollToBottom, 100);
      }
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
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Optimistic update
    const tempMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: selectedConversation.id,
      sender_id: user?.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      read: false,
      sending: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: messageContent
      });
      fetchMessages(selectedConversation.id, true);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatConversationTime = (dateStr) => {
    if (!dateStr) return '';
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

  // Grouper les messages par date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.created_at });
      }
      groups.push({ type: 'message', ...msg });
    });

    return groups;
  };

  const filteredConversations = conversations.filter(conv => 
    !conversationFilter || 
    conv.other_participant_name?.toLowerCase().includes(conversationFilter.toLowerCase())
  );

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex ml-64 h-screen">
        {/* Conversations List - WhatsApp Style */}
        <div className={`w-full md:w-[380px] bg-[#111b21] border-r border-[#2a3942] flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <span className="font-semibold text-[#e9edef]">Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Nouvelle conversation"
              >
                <Plus className="w-5 h-5 text-[#aebac1]" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-[#aebac1]" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-2 bg-[#111b21]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                value={conversationFilter}
                onChange={(e) => setConversationFilter(e.target.value)}
                placeholder="Rechercher ou démarrer une discussion"
                className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-16 h-16 text-[#8696a0] mx-auto mb-4 opacity-50" />
                <p className="text-[#8696a0] text-sm">Aucune conversation</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="mt-4 px-4 py-2 bg-[#00a884] hover:bg-[#02735e] text-white text-sm rounded-full transition-colors"
                >
                  Démarrer une discussion
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-[#2a3942] ${
                    selectedConversation?.id === conv.id 
                      ? 'bg-[#2a3942]' 
                      : 'hover:bg-[#202c33]'
                  }`}
                >
                  <div className="relative">
                    <UserAvatar
                      user={{ full_name: conv.other_participant_name, photo_url: conv.other_participant_photo }}
                      size="lg"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#e9edef] truncate text-[15px]">
                        {conv.other_participant_name}
                      </h3>
                      <span className={`text-xs ${conv.unread_count > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                        {formatConversationTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-[#8696a0] truncate flex items-center gap-1">
                        {conv.last_sender_id === user?.id && (
                          <CheckCheck className="w-4 h-4 text-[#53bdeb] flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {conv.last_message || 'Démarrer la conversation'}
                        </span>
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-[#00a884] text-white text-xs rounded-full flex items-center justify-center font-medium">
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

        {/* Messages Area - WhatsApp Style */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-1 hover:bg-white/10 rounded-full transition-colors mr-1"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#aebac1]" />
                  </button>
                  <UserAvatar
                    user={{ full_name: selectedConversation.other_participant_name, photo_url: selectedConversation.other_participant_photo }}
                    size="md"
                  />
                  <div>
                    <h2 className="font-medium text-[#e9edef] text-[16px]">
                      {selectedConversation.other_participant_name}
                    </h2>
                    <p className="text-xs text-[#8696a0]">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-[#aebac1]" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-[#aebac1]" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Search className="w-5 h-5 text-[#aebac1]" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-[#aebac1]" />
                  </button>
                </div>
              </div>

              {/* Messages Container with WhatsApp background pattern */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 md:px-16 py-4"
                style={{
                  backgroundColor: '#0b141a',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                <div className="max-w-4xl mx-auto space-y-1">
                  {groupedMessages.map((item, index) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${index}`} className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-[#182229] text-[#8696a0] text-xs rounded-lg shadow">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      );
                    }

                    const msg = item;
                    const isMe = msg.sender_id === user?.id;
                    const isTemp = msg.sending;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                      >
                        <div
                          className={`relative max-w-[65%] md:max-w-[45%] px-3 py-2 shadow-sm ${
                            isMe
                              ? 'bg-[#005c4b] rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                              : 'bg-[#202c33] rounded-tl-lg rounded-tr-lg rounded-br-lg'
                          }`}
                        >
                          <div 
                            className={`absolute top-0 w-3 h-3 ${
                              isMe 
                                ? 'right-[-6px] bg-[#005c4b]' 
                                : 'left-[-6px] bg-[#202c33]'
                            }`}
                            style={{
                              clipPath: isMe 
                                ? 'polygon(0 0, 0% 100%, 100% 0)' 
                                : 'polygon(100% 0, 0 0, 100% 100%)'
                            }}
                          />
                          
                          <p className="text-[#e9edef] text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          
                          <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
                            <span className="text-[11px] text-[#8696a0]">
                              {formatTime(msg.created_at)}
                            </span>
                            {isMe && (
                              <span className="ml-1">
                                {isTemp ? (
                                  <Check className="w-4 h-4 text-[#8696a0]" />
                                ) : msg.read ? (
                                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                                ) : (
                                  <CheckCheck className="w-4 h-4 text-[#8696a0]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input - WhatsApp Style */}
              <div className="bg-[#202c33] px-4 py-3">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <button 
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Smile className="w-6 h-6 text-[#8696a0]" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Paperclip className="w-6 h-6 text-[#8696a0]" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez un message"
                      className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg px-4 py-3 text-[15px] focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                  </div>
                  
                  {newMessage.trim() ? (
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="p-3 bg-[#00a884] hover:bg-[#02735e] disabled:opacity-50 rounded-full transition-colors"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="p-3 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <Mic className="w-6 h-6 text-[#8696a0]" />
                    </button>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#222e35]">
              <div className="text-center max-w-md px-8">
                <div className="w-[320px] h-[188px] mx-auto mb-8 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#00a884]/20 to-[#25d366]/20 flex items-center justify-center">
                      <MessageSquare className="w-24 h-24 text-[#8696a0]" strokeWidth={1} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-[#00a884]/30 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-[#e9edef] text-[32px] font-light mb-3">
                  Académie Levinet Messages
                </h2>
                <p className="text-[#8696a0] text-sm leading-5">
                  Envoyez et recevez des messages avec les membres de l'Académie.<br/>
                  Sélectionnez une conversation ou démarrez-en une nouvelle.
                </p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="mt-6 px-6 py-3 bg-[#00a884] hover:bg-[#02735e] text-white rounded-full transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle conversation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Conversation Modal - WhatsApp Style */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111b21] rounded-xl w-full max-w-md border border-[#2a3942] overflow-hidden shadow-2xl">
              <div className="bg-[#202c33] px-4 py-4 flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-[#aebac1]" />
                </button>
                <h2 className="text-[#e9edef] text-lg font-medium">Nouvelle discussion</h2>
              </div>

              <div className="px-4 py-3 bg-[#111b21]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="Rechercher un membre..."
                    className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-11 pr-4 py-3 text-[15px] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a884]"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-2 text-[#00a884] text-xs uppercase font-medium">
                      Membres trouvés
                    </p>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => startConversation(result.id)}
                        className="px-4 py-3 hover:bg-[#202c33] cursor-pointer transition-colors flex items-center gap-3"
                      >
                        <UserAvatar user={{ full_name: result.name, photo_url: result.photo_url }} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#e9edef] text-[15px] font-medium truncate">{result.name}</p>
                          <p className="text-[13px] text-[#8696a0] truncate">{result.type} • {result.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-12">
                    <p className="text-[#8696a0]">Aucun résultat pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <Search className="w-12 h-12 text-[#8696a0] mx-auto mb-4 opacity-50" />
                    <p className="text-[#8696a0] text-sm">
                      Tapez le nom d'un membre pour démarrer une conversation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;