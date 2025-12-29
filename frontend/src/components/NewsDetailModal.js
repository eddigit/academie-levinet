import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, Clock, User, Eye, Send, Trash2, ThumbsUp, Heart, Flame, Award, MessageCircle, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_URL}/api`;

const REACTION_ICONS = {
  like: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-500/20', label: 'J\'aime' },
  love: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-500/20', label: 'J\'adore' },
  fire: { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/20', label: 'Feu' },
  clap: { icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'Bravo' },
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString('fr-FR');
};

const NewsDetailModal = ({ news, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reactions, setReactions] = useState({ counts: {}, total: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!news?.id) return;
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/news/${news.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoadingComments(false);
  }, [news?.id]);

  const fetchReactions = useCallback(async () => {
    if (!news?.id) return;
    try {
      const response = await axios.get(`${API}/news/${news.id}/reactions`);
      setReactions({
        counts: response.data.counts || {},
        total: response.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, [news?.id]);

  const fetchUserReaction = useCallback(async () => {
    if (!news?.id || !user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/news/${news.id}/user-reaction`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserReaction(response.data.reaction?.reaction_type || null);
    } catch (error) {
      console.error('Error fetching user reaction:', error);
    }
  }, [news?.id, user]);

  useEffect(() => {
    if (isOpen && news?.id) {
      fetchComments();
      fetchReactions();
      fetchUserReaction();
    }
  }, [isOpen, news?.id, fetchComments, fetchReactions, fetchUserReaction]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/news/${news.id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Commentaire ajouté');
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/news/${news.id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Commentaire supprimé');
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleReaction = async (reactionType) => {
    setShowReactionPicker(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/news/${news.id}/reactions`,
        { reaction_type: reactionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.action === 'removed') {
        setUserReaction(null);
        setReactions(prev => ({
          ...prev,
          counts: {
            ...prev.counts,
            [reactionType]: Math.max(0, (prev.counts[reactionType] || 0) - 1)
          },
          total: Math.max(0, prev.total - 1)
        }));
      } else if (response.data.action === 'added') {
        setUserReaction(reactionType);
        setReactions(prev => ({
          ...prev,
          counts: {
            ...prev.counts,
            [reactionType]: (prev.counts[reactionType] || 0) + 1
          },
          total: prev.total + 1
        }));
      } else if (response.data.action === 'updated') {
        const oldReaction = userReaction;
        setUserReaction(reactionType);
        setReactions(prev => ({
          ...prev,
          counts: {
            ...prev.counts,
            [oldReaction]: Math.max(0, (prev.counts[oldReaction] || 0) - 1),
            [reactionType]: (prev.counts[reactionType] || 0) + 1
          }
        }));
      }
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Erreur lors de la réaction');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  if (!isOpen || !news) return null;

  const getCategoryColor = (category) => {
    const colors = {
      'Événement': 'bg-accent/20 text-accent',
      'Résultat': 'bg-primary/20 text-primary',
      'Formation': 'bg-secondary/20 text-secondary',
      'Annonce': 'bg-text-primary/20 text-text-primary',
      'Réussite': 'bg-green-500/20 text-green-500',
      'Technique': 'bg-purple-500/20 text-purple-500'
    };
    return colors[category] || 'bg-text-muted/20 text-text-muted';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl border border-white/10 w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="font-oswald text-xl text-text-primary uppercase">Actualité</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Image */}
          {news.image_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={news.image_url} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getCategoryColor(news.category)}`}>
              {news.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              <span>{formatDate(news.published_at || news.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Eye className="w-3 h-3" />
              <span>{news.views || 0} vues</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-oswald text-2xl md:text-3xl font-bold text-text-primary uppercase">
            {news.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{news.author_name || 'Anonyme'}</p>
              <p className="text-xs text-text-muted">Auteur</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary font-manrope leading-relaxed whitespace-pre-wrap">
              {news.content}
            </p>
          </div>

          {/* Reactions Summary */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-white/10">
            <div className="flex items-center gap-2">
              {Object.entries(reactions.counts).filter(([_, count]) => count > 0).map(([type, count]) => {
                const config = REACTION_ICONS[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div key={type} className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs text-text-primary">{count}</span>
                  </div>
                );
              })}
              {reactions.total === 0 && (
                <span className="text-sm text-text-muted">Soyez le premier à réagir</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-text-muted ml-auto">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{comments.length} commentaire{comments.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className={`border-white/10 ${userReaction ? REACTION_ICONS[userReaction]?.color : 'text-text-secondary'}`}
              >
                {userReaction ? (
                  <>
                    {React.createElement(REACTION_ICONS[userReaction]?.icon || ThumbsUp, { className: "w-4 h-4 mr-2" })}
                    {REACTION_ICONS[userReaction]?.label}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    J'aime
                  </>
                )}
              </Button>
              
              {/* Reaction Picker */}
              {showReactionPicker && (
                <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-2 bg-paper border border-white/10 rounded-full shadow-lg z-10">
                  {Object.entries(REACTION_ICONS).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${userReaction === type ? config.bgColor : ''}`}
                        title={config.label}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="border-white/10 text-text-secondary"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Commenter
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-white/10 text-text-secondary"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-oswald text-lg text-text-primary uppercase">
              Commentaires ({comments.length})
            </h3>

            {/* Comment Input */}
            {user && (
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 relative">
                  <input
                    id="comment-input"
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrivez un commentaire..."
                    className="w-full px-4 py-3 pr-12 bg-background border border-white/10 rounded-full text-text-primary font-manrope focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-text-muted py-4">Aucun commentaire pour le moment</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      {comment.author_photo ? (
                        <img src={comment.author_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-background rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-text-primary text-sm">{comment.author_name}</p>
                          {(comment.author_id === user?.id || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-text-secondary text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-text-muted mt-1 ml-3">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;
