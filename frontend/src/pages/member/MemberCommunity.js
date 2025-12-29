import React, { useState, useEffect } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import UserAvatar from '../../components/UserAvatar';
import SponsorCard from '../../components/SponsorCard';
import { Users, Newspaper, Calendar, Heart, MessageSquare, Share2, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';

const MemberCommunity = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('news');
  const [sponsors, setSponsors] = useState([]);
  const [leftSponsors, setLeftSponsors] = useState([]);
  const [rightSponsors, setRightSponsors] = useState([]);

  useEffect(() => {
    fetchData();
    fetchSponsors();
  }, []);

  const fetchData = async () => {
    try {
      const newsRes = await api.get('/news');
      setNews(newsRes.data);
      
      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSponsors = async () => {
    try {
      const res = await api.get('/sponsors');
      // L'API retourne {sponsors: [...]}
      const sponsorsData = res.data.sponsors || res.data || [];
      const allSponsors = Array.isArray(sponsorsData) ? sponsorsData : [];
      setSponsors(allSponsors);
      
      // Séparer les sponsors par position
      setLeftSponsors(allSponsors.filter(s => s.position === 'left' || s.position === 'both'));
      setRightSponsors(allSponsors.filter(s => s.position === 'right' || s.position === 'both'));
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  // Mock data for community features
  const communityMembers = [
    { name: 'Marie L.', grade: 'Ceinture Noire', city: 'Lyon' },
    { name: 'Pierre M.', grade: 'Ceinture Bleue', city: 'Paris' },
    { name: 'Sophie D.', grade: 'Ceinture Verte', city: 'Marseille' },
    { name: 'Lucas R.', grade: 'Ceinture Orange', city: 'Bordeaux' },
    { name: 'Emma B.', grade: 'Ceinture Orange', city: 'Paris' },
  ];

  const mockNews = news.length > 0 ? news : [
    { 
      id: 1,
      title: 'Stage International en Février',
      content: 'Maître Jacques Levinet animera un stage exceptionnel réunissant des pratiquants de 15 pays. Inscriptions ouvertes !',
      category: 'Stage',
      created_at: '2024-12-15',
      likes: 45,
      comments: 12
    },
    {
      id: 2,
      title: 'Nouveau Programme Vidéo Disponible',
      content: 'Le module 5 "Self-défense au sol" est maintenant accessible pour les ceintures vertes et supérieures.',
      category: 'Formation',
      created_at: '2024-12-12',
      likes: 38,
      comments: 8
    },
    {
      id: 3,
      title: 'Résultats Passage de Grade',
      content: 'Félicitations aux 23 pratiquants qui ont réussi leur passage de grade ce week-end !',
      category: 'Grade',
      created_at: '2024-12-10',
      likes: 67,
      comments: 25
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Communauté
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Restez connecté avec les membres de l'Académie
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-lg font-oswald uppercase text-sm transition-colors ${
              activeTab === 'news' 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Newspaper className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
            Actualités
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-oswald uppercase text-sm transition-colors ${
              activeTab === 'events' 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
            Événements
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg font-oswald uppercase text-sm transition-colors ${
              activeTab === 'members' 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
            Membres
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Sponsors */}
          <div className="xl:col-span-2 space-y-4">
            {leftSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>

          {/* Main Content */}
          <div className="xl:col-span-7">
            {activeTab === 'news' && (
              <div className="space-y-6">
                {mockNews.map((item, idx) => (
                  <div key={idx} className="bg-paper rounded-xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-oswald uppercase">
                        {item.category}
                      </span>
                      <span className="text-text-muted text-xs">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="font-oswald text-xl text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-secondary font-manrope text-sm mb-4">{item.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-text-muted hover:text-secondary transition-colors">
                          <Heart className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm">{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm">{item.comments}</span>
                        </button>
                      </div>
                      <button className="text-text-muted hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {(events.length > 0 ? events : [
                  { title: 'Stage SPK Avancé', start_date: '2024-12-18', location: 'Paris', type: 'Stage' },
                  { title: 'Passage de Grade', start_date: '2024-12-22', location: 'Lyon', type: 'Grade' },
                  { title: 'Stage International', start_date: '2025-02-15', location: 'Paris', type: 'Stage' },
                ]).map((event, idx) => (
                  <div key={idx} className="bg-paper rounded-xl border border-white/5 p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="font-oswald text-2xl text-primary font-bold">
                        {new Date(event.start_date).getDate()}
                      </span>
                      <span className="text-xs text-primary uppercase">
                        {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full font-oswald uppercase">
                        {event.type}
                      </span>
                      <h3 className="font-oswald text-lg text-text-primary mt-2">{event.title}</h3>
                      <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
                        <Users className="w-4 h-4" strokeWidth={1.5} />
                        {event.location}
                      </p>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary-dark">
                      S'inscrire
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-paper rounded-xl border border-white/5 p-6">
                <h3 className="font-oswald text-xl text-text-primary uppercase mb-4">Membres de l'Académie</h3>
                <div className="space-y-3">
                  {communityMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ full_name: member.name, photo_url: member.photo_url }} size="md" />
                        <div>
                          <p className="font-oswald text-text-primary">{member.name}</p>
                          <p className="text-xs text-text-muted">{member.grade} • {member.city}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <MessageSquare className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-3 space-y-6">
            {/* Sponsors droite */}
            {rightSponsors.length > 0 && (
              <div className="space-y-4">
                {rightSponsors.map((sponsor) => (
                  <SponsorCard key={sponsor.id} sponsor={sponsor} />
                ))}
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Communauté</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Membres actifs</span>
                  <span className="font-oswald text-primary">2,547</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Dans votre ville</span>
                  <span className="font-oswald text-primary">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Même grade</span>
                  <span className="font-oswald text-primary">324</span>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Prochain Événement</h3>
              <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <p className="font-oswald text-lg text-text-primary">Stage SPK Avancé</p>
                <p className="text-text-muted text-sm mt-1">18 Décembre • Paris</p>
                <Button className="w-full mt-4 bg-primary hover:bg-primary-dark" size="sm">
                  Voir les détails
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCommunity;
