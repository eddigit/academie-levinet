import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { MessageSquare, Trash2, ChevronDown, ChevronUp, User, AlertTriangle } from 'lucide-react';

const AdminMessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_conversations: 0, total_messages: 0 });

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/admin/conversations');
      setConversations(response.data.conversations);
      setStats({ total_conversations: response.data.total });
      
      // Also get total messages
      const msgResponse = await api.get('/admin/messages?limit=1');
      setStats(prev => ({ ...prev, total_messages: msgResponse.data.total }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesForConversation = async (conversationId) => {
    if (conversationMessages[conversationId]) {
      return; // Already fetched
    }
    
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setConversationMessages(prev => ({
        ...prev,
        [conversationId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const toggleConversation = async (conversationId) => {
    if (expandedConversation === conversationId) {
      setExpandedConversation(null);
    } else {
      setExpandedConversation(conversationId);
      await fetchMessagesForConversation(conversationId);
    }
  };

  const deleteMessage = async (messageId, conversationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    
    try {
      await api.delete(`/admin/messages/${messageId}`);
      // Refresh messages for this conversation
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setConversationMessages(prev => ({
        ...prev,
        [conversationId]: response.data
      }));
      fetchConversations();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl text-text-primary uppercase tracking-wide flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Modération des Messages
          </h1>
          <p className="text-text-muted font-manrope mt-2">
            Gérez et modérez les conversations de la plateforme
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-paper border border-white/5 rounded-xl p-6">
            <p className="text-text-muted font-manrope text-sm">Total Conversations</p>
            <p className="font-oswald text-3xl text-primary mt-1">{stats.total_conversations}</p>
          </div>
          <div className="bg-paper border border-white/5 rounded-xl p-6">
            <p className="text-text-muted font-manrope text-sm">Total Messages</p>
            <p className="font-oswald text-3xl text-accent mt-1">{stats.total_messages}</p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-paper border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-oswald text-xl text-text-primary uppercase">Toutes les Conversations</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" strokeWidth={1} />
              <p className="text-text-muted font-manrope">Aucune conversation</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {conversations.map((conv) => (
                <div key={conv.id}>
                  {/* Conversation Header */}
                  <div
                    onClick={() => toggleConversation(conv.id)}
                    className="p-4 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {conv.participant_names.map((name, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-paper"
                            title={name}
                          >
                            <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="font-oswald text-text-primary">
                          {conv.participant_names.join(' ↔ ')}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {conv.message_count} message{conv.message_count > 1 ? 's' : ''} • 
                          Dernière activité: {formatDate(conv.updated_at)}
                        </p>
                      </div>
                    </div>
                    {expandedConversation === conv.id ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Expanded Messages */}
                  {expandedConversation === conv.id && (
                    <div className="bg-background/50 border-t border-white/5 p-4">
                      {!conversationMessages[conv.id] ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : conversationMessages[conv.id].length === 0 ? (
                        <p className="text-center text-text-muted py-4">Aucun message</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {conversationMessages[conv.id].map((msg) => (
                            <div key={msg.id} className="bg-paper rounded-lg p-3 flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-oswald text-sm text-primary">{msg.sender_name}</span>
                                  <span className="text-xs text-text-muted">{formatDate(msg.created_at)}</span>
                                </div>
                                <p className="text-text-secondary font-manrope text-sm">{msg.content}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMessage(msg.id, conv.id);
                                }}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Supprimer ce message"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Moderation Notice */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h4 className="font-oswald text-yellow-500 uppercase text-sm">Règles de Modération</h4>
            <p className="text-text-secondary font-manrope text-sm mt-1">
              Supprimez uniquement les messages inappropriés (spam, harcèlement, contenu offensant). 
              Les messages supprimés ne peuvent pas être récupérés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;