import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import UserAvatar from './UserAvatar';
import SponsorCard from './SponsorCard';
import { formatFullName } from '../lib/utils';
import {
  Heart, MessageCircle, Send, MoreHorizontal, Trash2,
  Flame, ThumbsUp, Award, Users, TrendingUp, Clock,
  Image as ImageIcon, Video, Smile, X, ChevronDown, ChevronUp, Crown
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const REACTION_ICONS = {
  like: { icon: ThumbsUp, color: 'text-blue-500', label: 'J\'aime' },
  love: { icon: Heart, color: 'text-red-500', label: 'J\'adore' },
  fire: { icon: Flame, color: 'text-orange-500', label: 'Feu' },
  clap: { icon: Award, color: 'text-yellow-500', label: 'Bravo' },
  strong: { icon: TrendingUp, color: 'text-green-500', label: 'Fort' },
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

// Post Card Component
const PostCard = ({ post, onReact, onComment, onDelete, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const response = await api.get(`/wall/posts/${post.id}/comments`);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/wall/posts/${post.id}/comments`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      onComment && onComment(post.id);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
    setSubmittingComment(false);
  };

  const handleReaction = async (reactionType) => {
    setShowReactions(false);
    onReact(post.id, reactionType);
  };

  const totalReactions = post.reactions_count || 0;
  const canDelete = post.author_id === currentUserId || post.author?.role === 'admin';

  return (
    <div className="bg-paper rounded-xl border border-white/10 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} size="md" />
          <div>
            <p className="font-semibold text-text-primary">{formatFullName(post.author?.full_name) || 'Membre'}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        {canDelete && (
          <button 
            onClick={() => onDelete(post.id)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-text-primary whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt="" className="mt-3 rounded-lg max-h-96 w-full object-cover" />
        )}
      </div>

      {/* Reactions & Comments Count */}
      {(totalReactions > 0 || post.comments_count > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-text-muted border-t border-white/5">
          <div className="flex items-center gap-1">
            {Object.entries(post.reactions || {}).slice(0, 3).map(([type, count]) => {
              const ReactionIcon = REACTION_ICONS[type]?.icon || ThumbsUp;
              return (
                <span key={type} className={`${REACTION_ICONS[type]?.color || 'text-blue-500'}`}>
                  <ReactionIcon className="w-4 h-4" />
                </span>
              );
            })}
            {totalReactions > 0 && <span className="ml-1">{totalReactions}</span>}
          </div>
          {post.comments_count > 0 && (
            <button onClick={loadComments} className="hover:underline">
              {post.comments_count} commentaire{post.comments_count > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center gap-2 border-t border-white/5">
        <div className="relative flex-1">
          <button
            onClick={() => setShowReactions(!showReactions)}
            onMouseEnter={() => setShowReactions(true)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-colors ${
              post.user_reaction ? REACTION_ICONS[post.user_reaction]?.color : 'text-text-muted'
            }`}
          >
            {post.user_reaction ? (
              <>
                {React.createElement(REACTION_ICONS[post.user_reaction]?.icon || ThumbsUp, { className: "w-5 h-5" })}
                <span className="text-sm">{REACTION_ICONS[post.user_reaction]?.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm">J'aime</span>
              </>
            )}
          </button>
          
          {/* Reaction Picker */}
          {showReactions && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-background border border-white/10 rounded-full px-2 py-1 flex items-center gap-1 shadow-xl z-10"
              onMouseLeave={() => setShowReactions(false)}
            >
              {Object.entries(REACTION_ICONS).map(([type, { icon: Icon, color, label }]) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`p-2 hover:scale-125 transition-transform ${color}`}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={loadComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-muted"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Commenter</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-white/5 bg-background/50">
          {loadingComments ? (
            <div className="p-4 text-center text-text-muted">Chargement...</div>
          ) : (
            <>
              {/* Comments List */}
              <div className="max-h-64 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="p-3 flex gap-3">
                    <UserAvatar user={comment.author} size="sm" />
                    <div className="flex-1 bg-paper rounded-lg px-3 py-2">
                      <p className="text-sm font-semibold text-text-primary">{formatFullName(comment.author?.full_name)}</p>
                      <p className="text-sm text-text-secondary">{comment.content}</p>
                      <p className="text-xs text-text-muted mt-1">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Comment Input */}
              <form onSubmit={handleSubmitComment} className="p-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrire un commentaire..."
                  className="flex-1 bg-paper border border-white/10 rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-primary-dark transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Create Post Component
const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/wall/posts', { content, post_type: 'text' });
      onPostCreated(response.data);
      setContent('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-paper rounded-xl border border-white/10 p-4">
      <div className="flex gap-3">
        <UserAvatar user={user} size="md" />
        <div className="flex-1">
          {isExpanded ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez quelque chose avec la communauté..."
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 text-text-muted hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-2 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors relative group">
                          <Video className="w-5 h-5" />
                          <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-amber-500 text-white">
                        <p>Fonctionnalité Premium AJL</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button type="button" className="p-2 text-text-muted hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsExpanded(false); setContent(''); }}
                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors"
                  >
                    {isSubmitting ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left bg-background border border-white/10 rounded-full px-4 py-3 text-text-muted hover:border-white/20 transition-colors"
            >
              Partagez quelque chose avec la communauté...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Social Wall Component
const SocialWall = ({ variant = 'full' }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [leftSponsors, setLeftSponsors] = useState([]);
  const [rightSponsors, setRightSponsors] = useState([]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get('/wall/posts');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  }, []);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await api.get('/wall/online-users');
      setOnlineUsers(response.data.online_users || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/wall/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchSponsors = useCallback(async () => {
    try {
      const response = await api.get('/sponsors');
      const sponsorsData = response.data.sponsors || response.data || [];
      const allSponsors = Array.isArray(sponsorsData) ? sponsorsData : [];
      setLeftSponsors(allSponsors.filter(s => s.position === 'left' || s.position === 'both'));
      setRightSponsors(allSponsors.filter(s => s.position === 'right' || s.position === 'both'));
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchOnlineUsers();
    fetchStats();
    fetchSponsors();

    // Refresh online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchOnlineUsers, fetchStats, fetchSponsors]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await api.post(`/wall/posts/${postId}/reactions`, { reaction_type: reactionType });
      fetchPosts(); // Refresh to get updated reactions
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await api.delete(`/wall/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (variant === 'compact') {
    // Compact version for sidebar or smaller spaces
    return (
      <div className="space-y-4">
        <h3 className="font-oswald text-lg font-bold text-text-primary uppercase">Activité Récente</h3>
        {loading ? (
          <div className="text-text-muted">Chargement...</div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map(post => (
              <div key={post.id} className="p-3 bg-background/50 rounded-lg border border-white/5">
                <p className="text-sm text-text-primary line-clamp-2">{post.content}</p>
                <p className="text-xs text-text-muted mt-1">{formatFullName(post.author?.full_name)} · {formatTimeAgo(post.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column - User Info & Stats */}
      <div className="lg:col-span-1 space-y-4">
        {/* User Card */}
        <div className="bg-paper rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="font-semibold text-text-primary">{formatFullName(user?.full_name)}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Mes publications</span>
              <span className="text-text-primary font-semibold">
                {posts.filter(p => p.author_id === user?.id).length}
              </span>
            </div>
          </div>
        </div>

        {/* Sponsors - Colonne Gauche */}
        {leftSponsors.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-oswald text-xs font-bold text-text-muted uppercase">Nos Partenaires</h3>
            {leftSponsors.map(sponsor => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        )}

        {/* Community Stats */}
        {stats && (
          <div className="bg-paper rounded-xl border border-white/10 p-4">
            <h3 className="font-oswald text-sm font-bold text-text-primary uppercase mb-4">Communauté</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Membres</span>
                </div>
                <span className="text-primary font-bold">{stats.total_members}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Publications</span>
                </div>
                <span className="text-primary font-bold">{stats.total_posts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Cette semaine</span>
                </div>
                <span className="text-green-500 font-bold">+{stats.posts_this_week}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Column - Feed */}
      <div className="lg:col-span-2 space-y-4">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {loading ? (
          <div className="text-center py-8 text-text-muted">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Chargement du fil d'actualité...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">Aucune publication pour le moment</p>
            <p className="text-sm text-text-muted">Soyez le premier à partager quelque chose !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onReact={handleReaction}
                onDelete={handleDeletePost}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Online Users & Info */}
      <div className="lg:col-span-1 space-y-4">
        {/* Online Users */}
        <div className="bg-paper rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-oswald text-sm font-bold text-text-primary uppercase">En ligne</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {onlineUsers.length} actif{onlineUsers.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {onlineUsers.slice(0, 10).map(u => (
              <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <UserAvatar user={u} size="sm" showOnlineIndicator isOnline />
                <span className="text-sm text-text-primary truncate">{formatFullName(u.full_name)}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-sm text-text-muted text-center py-2">Aucun membre en ligne</p>
            )}
          </div>
        </div>

        {/* Quick Links / Info */}
        <div className="bg-paper rounded-xl border border-white/10 p-4">
          <h3 className="font-oswald text-sm font-bold text-text-primary uppercase mb-4">Liens Rapides</h3>
          <div className="space-y-2">
            <a href="/member/programs" className="block p-2 text-sm text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              📚 Programmes Techniques
            </a>
            <a href="/member/courses" className="block p-2 text-sm text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              📅 Planning des Cours
            </a>
            <a href="/member/messages" className="block p-2 text-sm text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              💬 Messagerie
            </a>
          </div>
        </div>

        {/* Upcoming Events Preview */}
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-white/10 p-4">
          <h3 className="font-oswald text-sm font-bold text-text-primary uppercase mb-3">Prochain Événement</h3>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-primary mb-1">Stage SPK</p>
            <p className="text-sm text-text-secondary">Paris - 15 Janvier 2025</p>
          </div>
        </div>

        {/* Sponsors - Colonne Droite */}
        {rightSponsors.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-oswald text-xs font-bold text-text-muted uppercase">Sponsors</h3>
            {rightSponsors.map(sponsor => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialWall;
