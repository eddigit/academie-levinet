import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { 
  MessageCircle, Plus, Edit, Trash2, Users, Lock, Unlock, Search,
  X, Loader2, Pin, MessageSquare, Eye, Clock, User, ChevronRight,
  Settings, UserPlus, FileText, Calendar, Award
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import UserAvatar from '../../components/UserAvatar';
import { formatFullName } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const AdminForumsPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [topics, setTopics] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForumModal, setShowForumModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editingForum, setEditingForum] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalForums: 0,
    totalTopics: 0,
    totalMessages: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      fetchTopics(selectedForum.id);
    }
  }, [selectedForum]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [forumsRes, usersRes, statsRes] = await Promise.all([
        api.get('/forums'),
        api.get('/users'),
        api.get('/forums/stats')
      ]);
      setForums(forumsRes.data);
      setAllUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching forums:', error);
      // Données de démo
      setForums([
        {
          id: '1',
          name: 'Annonces Officielles',
          description: 'Actualités et annonces importantes de l\'académie',
          icon: '📢',
          is_private: false,
          topic_count: 12,
          message_count: 45,
          participants: [],
          created_by: currentUser?.id,
          created_at: '2024-12-01'
        },
        {
          id: '2',
          name: 'Techniques & Entrainements',
          description: 'Discussions sur les techniques, entrainements et conseils',
          icon: '🥋',
          is_private: false,
          topic_count: 28,
          message_count: 156,
          participants: [],
          created_at: '2024-11-15'
        },
        {
          id: '3',
          name: 'Événements & Compétitions',
          description: 'Organisation d\'événements, stages et compétitions',
          icon: '🏆',
          is_private: false,
          topic_count: 15,
          message_count: 89,
          participants: [],
          created_at: '2024-10-20'
        }
      ]);
      setStats({
        totalForums: 3,
        totalTopics: 55,
        totalMessages: 290,
        activeUsers: 42
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (forumId) => {
    try {
      const response = await api.get(`/forums/${forumId}/topics`);
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Données de démo
      setTopics([
        {
          id: '1',
          title: 'Nouvelle saison 2025 - Inscriptions ouvertes',
          description: 'Les inscriptions pour la saison 2025 sont maintenant ouvertes',
          forum_id: forumId,
          author_id: currentUser?.id,
          author_name: currentUser?.full_name,
          author_photo: currentUser?.photo_url,
          is_pinned: true,
          is_locked: false,
          message_count: 15,
          view_count: 234,
          last_activity: '2025-12-26T14:30:00Z',
          created_at: '2025-12-20T10:00:00Z'
        },
        {
          id: '2',
          title: 'Stage intensif prévu en mars',
          description: 'Organisation d\'un stage intensif de 3 jours en mars 2025',
          forum_id: forumId,
          author_id: '123',
          author_name: 'Jean Dupont',
          author_photo: null,
          is_pinned: false,
          is_locked: false,
          message_count: 8,
          view_count: 89,
          last_activity: '2025-12-25T16:45:00Z',
          created_at: '2025-12-22T09:15:00Z'
        }
      ]);
    }
  };

  const deleteForum = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce forum ? Tous les sujets et messages seront également supprimés.')) return;
    try {
      await api.delete(`/forums/${id}`);
      setForums(forums.filter(f => f.id !== id));
      if (selectedForum?.id === id) {
        setSelectedForum(null);
        setTopics([]);
      }
      toast.success('Forum supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteTopic = async (topicId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sujet ?')) return;
    try {
      await api.delete(`/forums/topics/${topicId}`);
      setTopics(topics.filter(t => t.id !== topicId));
      toast.success('Sujet supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleTopicPin = async (topicId, isPinned) => {
    try {
      await api.put(`/forums/topics/${topicId}`, { is_pinned: !isPinned });
      setTopics(topics.map(t => t.id === topicId ? { ...t, is_pinned: !isPinned } : t));
      toast.success(isPinned ? 'Sujet désépinglé' : 'Sujet épinglé');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const toggleTopicLock = async (topicId, isLocked) => {
    try {
      await api.put(`/forums/topics/${topicId}`, { is_locked: !isLocked });
      setTopics(topics.map(t => t.id === topicId ? { ...t, is_locked: !isLocked } : t));
      toast.success(isLocked ? 'Sujet déverrouillé' : 'Sujet verrouillé');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const filteredForums = forums.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-forums-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              Forums de Discussion
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">
              Gérez les forums, sujets et participants
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">{stats.totalForums}</div>
                <div className="text-xs text-text-secondary">Forums</div>
              </div>
            </div>
          </div>
          <div className="stat-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">{stats.totalTopics}</div>
                <div className="text-xs text-text-secondary">Sujets</div>
              </div>
            </div>
          </div>
          <div className="stat-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">{stats.totalMessages}</div>
                <div className="text-xs text-text-secondary">Messages</div>
              </div>
            </div>
          </div>
          <div className="stat-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">{stats.activeUsers}</div>
                <div className="text-xs text-text-secondary">Participants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forums List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Rechercher un forum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-paper border-white/10"
                />
              </div>
              <Button
                onClick={() => { setEditingForum(null); setShowForumModal(true); }}
                className="bg-primary hover:bg-primary-dark"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filteredForums.map((forum) => (
                <div
                  key={forum.id}
                  onClick={() => setSelectedForum(forum)}
                  className={`bg-paper rounded-lg border p-4 cursor-pointer transition-all ${
                    selectedForum?.id === forum.id
                      ? 'border-primary bg-primary/5'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-2xl">{forum.icon || '💬'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-oswald font-bold text-text-primary truncate">
                            {forum.name}
                          </h3>
                          {forum.is_private && (
                            <Lock className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2 mb-2">
                          {forum.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {forum.topic_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {forum.message_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingForum(forum);
                          setShowForumModal(true);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-text-secondary" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteForum(forum.id);
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div className="lg:col-span-2">
            {selectedForum ? (
              <div className="space-y-4">
                {/* Forum Header */}
                <div className="bg-paper rounded-lg border border-white/10 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{selectedForum.icon || '💬'}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-oswald text-2xl font-bold text-text-primary">
                            {selectedForum.name}
                          </h2>
                          {selectedForum.is_private && (
                            <Lock className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-text-secondary font-manrope">
                          {selectedForum.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowParticipantsModal(true)}
                        className="border-white/10"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Participants
                      </Button>
                      <Button
                        onClick={() => { setEditingTopic(null); setShowTopicModal(true); }}
                        className="bg-primary hover:bg-primary-dark"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Sujet
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-text-secondary">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {selectedForum.topic_count || 0} sujets
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {selectedForum.message_count || 0} messages
                    </span>
                  </div>
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  {topics.length === 0 ? (
                    <div className="bg-paper rounded-lg border border-white/10 p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                      <p className="text-text-muted font-manrope">
                        Aucun sujet dans ce forum
                      </p>
                      <Button
                        onClick={() => { setEditingTopic(null); setShowTopicModal(true); }}
                        className="mt-4 bg-primary hover:bg-primary-dark"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Créer le premier sujet
                      </Button>
                    </div>
                  ) : (
                    topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-paper rounded-lg border border-white/10 p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <UserAvatar
                            user={{ full_name: topic.author_name, photo_url: topic.author_photo }}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {topic.is_pinned && (
                                    <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                  <h3 className="font-oswald font-bold text-text-primary">
                                    {topic.title}
                                  </h3>
                                  {topic.is_locked && (
                                    <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                  )}
                                </div>
                                {topic.description && (
                                  <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                                    {topic.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-text-muted">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {topic.author_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(topic.created_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {topic.message_count || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {topic.view_count || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => toggleTopicPin(topic.id, topic.is_pinned)}
                                  className={`p-1.5 rounded transition-colors ${
                                    topic.is_pinned
                                      ? 'bg-primary/20 text-primary'
                                      : 'hover:bg-white/10 text-text-secondary'
                                  }`}
                                  title={topic.is_pinned ? 'Désépingler' : 'Épingler'}
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleTopicLock(topic.id, topic.is_locked)}
                                  className={`p-1.5 rounded transition-colors ${
                                    topic.is_locked
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'hover:bg-white/10 text-text-secondary'
                                  }`}
                                  title={topic.is_locked ? 'Déverrouiller' : 'Verrouiller'}
                                >
                                  {topic.is_locked ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Unlock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTopic(topic);
                                    setShowTopicModal(true);
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5 text-text-secondary" />
                                </button>
                                <button
                                  onClick={() => deleteTopic(topic.id)}
                                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-paper rounded-lg border border-white/10 p-12 text-center">
                <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                <h3 className="font-oswald text-xl text-text-primary mb-2">
                  Sélectionnez un forum
                </h3>
                <p className="text-text-muted font-manrope">
                  Choisissez un forum dans la liste pour voir ses sujets
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Forum Modal */}
        {showForumModal && (
          <ForumModal
            forum={editingForum}
            onClose={() => { setShowForumModal(false); setEditingForum(null); }}
            onSave={fetchData}
          />
        )}

        {/* Topic Modal */}
        {showTopicModal && selectedForum && (
          <TopicModal
            topic={editingTopic}
            forumId={selectedForum.id}
            onClose={() => { setShowTopicModal(false); setEditingTopic(null); }}
            onSave={() => fetchTopics(selectedForum.id)}
          />
        )}

        {/* Participants Modal */}
        {showParticipantsModal && selectedForum && (
          <ParticipantsModal
            forum={selectedForum}
            allUsers={allUsers}
            onClose={() => setShowParticipantsModal(false)}
            onSave={fetchData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Forum Modal Component
const ForumModal = ({ forum, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: forum?.name || '',
    description: forum?.description || '',
    icon: forum?.icon || '💬',
    is_private: forum?.is_private || false
  });
  const [saving, setSaving] = useState(false);

  const emojis = ['💬', '📢', '🥋', '🏆', '📚', '💡', '🎯', '⚡', '🌟', '🔥', '💪', '🎓', '📝', '🤝', '🎉'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (forum) {
        await api.put(`/forums/${forum.id}`, formData);
        toast.success('Forum mis à jour');
      } else {
        await api.post('/forums', formData);
        toast.success('Forum créé');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl p-6 w-full max-w-lg border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {forum ? 'Modifier le Forum' : 'Nouveau Forum'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="icon">Icône</Label>
            <div className="grid grid-cols-10 gap-2 mt-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    formData.icon === emoji
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nom du forum</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/10"
              placeholder="Ex: Annonces Officielles"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-text-primary min-h-[80px]"
              placeholder="Décrivez le but de ce forum..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              className="w-4 h-4 rounded border-white/10"
            />
            <Label htmlFor="is_private" className="cursor-pointer">
              Forum privé (accessible uniquement aux participants invités)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (forum ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Topic Modal Component
const TopicModal = ({ topic, forumId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: topic?.title || '',
    description: topic?.description || '',
    is_pinned: topic?.is_pinned || false,
    is_locked: topic?.is_locked || false
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (topic) {
        await api.put(`/forums/topics/${topic.id}`, formData);
        toast.success('Sujet mis à jour');
      } else {
        await api.post(`/forums/${forumId}/topics`, formData);
        toast.success('Sujet créé');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl p-6 w-full max-w-lg border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {topic ? 'Modifier le Sujet' : 'Nouveau Sujet'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du sujet</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-white/5 border-white/10"
              placeholder="Ex: Nouvelle saison 2025"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-text-primary min-h-[100px]"
              placeholder="Décrivez le sujet en quelques mots..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-4 h-4 rounded border-white/10"
              />
              <Label htmlFor="is_pinned" className="cursor-pointer flex items-center gap-2">
                <Pin className="w-4 h-4 text-primary" />
                Épingler en haut du forum
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_locked"
                checked={formData.is_locked}
                onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                className="w-4 h-4 rounded border-white/10"
              />
              <Label htmlFor="is_locked" className="cursor-pointer flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                Verrouiller (empêcher les nouvelles réponses)
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (topic ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Participants Modal Component
const ParticipantsModal = ({ forum, allUsers, onClose, onSave }) => {
  const [participants, setParticipants] = useState(forum.participants || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredUsers = allUsers.filter(u => 
    !participants.includes(u.id) &&
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addParticipant = (userId) => {
    setParticipants([...participants, userId]);
  };

  const removeParticipant = (userId) => {
    setParticipants(participants.filter(id => id !== userId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/forums/${forum.id}`, { participants });
      toast.success('Participants mis à jour');
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const participantUsers = allUsers.filter(u => participants.includes(u.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl p-6 w-full max-w-2xl border border-white/10 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Gérer les Participants
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Current Participants */}
          <div>
            <h3 className="font-oswald text-sm text-text-secondary uppercase mb-3">
              Participants actuels ({participantUsers.length})
            </h3>
            <div className="space-y-2">
              {participantUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-text-primary">{user.full_name}</div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeParticipant(user.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
              {participantUsers.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  Aucun participant pour l'instant
                </p>
              )}
            </div>
          </div>

          {/* Add Participants */}
          <div>
            <h3 className="font-oswald text-sm text-text-secondary uppercase mb-3">
              Ajouter des participants
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-text-primary">{user.full_name}</div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => addParticipant(user.id)}
                    className="p-2 hover:bg-primary/20 rounded transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              ))}
              {filteredUsers.length === 0 && searchQuery && (
                <p className="text-sm text-text-muted text-center py-4">
                  Aucun utilisateur trouvé
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-white/10">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminForumsPage;
