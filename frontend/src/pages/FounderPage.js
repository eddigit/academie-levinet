import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Award, Shield, Globe, Star, ChevronRight, Loader2 } from 'lucide-react';
import api from '../utils/api';

const FounderPage = () => {
  const [founderContent, setFounderContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setFounderContent(data.founder || {});
      } catch (error) {
        console.error('Error fetching founder content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs par défaut si pas de données du CMS
  const founderName = founderContent?.name || 'Capitaine Jacques Levinet';
  const founderTitle = founderContent?.title || '10ème Dan · Champion de France · Créateur du Self-Pro Krav';
  const founderGrade = founderContent?.grade || '10ème Dan';
  const founderBio = founderContent?.bio || "Ancien membre de la Police Nationale avec une forte expérience de terrain, expert en arts martiaux et visionnaire qui a révolutionné l'approche de la self-défense en créant une méthode adaptée aux réalités modernes.";
  const founderQuote = founderContent?.quote || "J'ai parcouru le monde pour analyser les meilleures techniques de self-défense et d'entraînement policier. Mon objectif : créer des méthodes efficaces, réalistes et adaptées à la législation française.";
  const founderPhoto = founderContent?.photo || 'https://images.unsplash.com/photo-1616005639387-9d59e4b1bdb9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGdyYW5kbWFzdGVyJTIwcG9ydHJhaXQlMjBzZXJpb3VzfGVufDB8fHxibGFja19hbmRfd2hpdGV8MTc2NTgwMzY5N3ww&ixlib=rb-4.1.0&q=85';

  const achievements = [
    { icon: Award, title: '10ème Dan', description: 'Plus haut grade en Self-Pro Krav' },
    { icon: Star, title: 'Champion de France', description: 'Karaté - Compétition nationale' },
    { icon: Shield, title: 'Capitaine', description: 'Police Nationale française' },
    { icon: Globe, title: '50+ Pays', description: 'Méthode enseignée mondialement' },
  ];

  const timeline = [
    { year: 'Années 70-80', title: 'Carrière Policière', description: 'Intègre la Police Nationale comme officier et acquiert une expertise terrain en situations de crise et d\'intervention.' },
    { year: 'Années 80', title: 'Champion de Karaté', description: 'Devient Champion de France de Karaté et atteint le 6ème Dan FEKAMT de Karaté.' },
    { year: 'Années 90', title: 'Recherche Internationale', description: 'Parcourt le monde pour étudier les meilleures techniques de self-défense et d\'entraînement policier.' },
    { year: '1998', title: 'Création de l\'Académie', description: 'Fonde l\'Académie Jacques Levinet et met au point plusieurs méthodes de self-défense et d\'entraînement police, dont le Self-Pro Krav (SPK).' },
    { year: '2000s', title: 'Expansion Mondiale', description: 'Création de la structure tripartite : AJL (Académie Jacques Levinet), WKMO (World Krav Maga Organization) et IPC (International Police Confederation). Reconnaissances internationales multiples.' },
    { year: 'Aujourd\'hui', title: 'Héritage Vivant', description: 'Plus de 50 pays représentés, 50 directeurs techniques, collaboration avec des unités d\'élite mondiales comme la ROTAM (Brésil) et l\'OMON (Russie).' },
  ];

  return (
    <PublicLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
      <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-6">
                <span className="text-primary font-oswald text-sm uppercase tracking-wider">Le Fondateur</span>
              </div>
              
              <h1 className="font-oswald text-5xl md:text-6xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                <span className="text-primary">{founderName}</span>
              </h1>
              
              <p className="text-xl text-text-secondary font-manrope mb-4 leading-relaxed">
                {founderTitle}
              </p>
              
              <p className="text-text-muted font-manrope mb-8 leading-relaxed">
                {founderBio}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {achievements.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <item.icon className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                    <h4 className="font-oswald text-lg text-white uppercase">{item.title}</h4>
                    <p className="text-text-muted font-manrope text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={founderPhoto}
                  alt={founderName}
                  className="w-full h-full object-cover bg-gray-800"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary p-4 rounded-lg">
                <p className="font-oswald text-4xl font-bold text-white">25+</p>
                <p className="text-white/80 font-manrope text-sm">Années d'excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Une Vision <span className="text-primary">Révolutionnaire</span>
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 md:p-12">
            <blockquote className="text-xl md:text-2xl text-text-secondary font-manrope italic leading-relaxed text-center">
              "{founderQuote}"
            </blockquote>
            <p className="text-center text-primary font-oswald uppercase leading-none tracking-wider mt-6">
              — {founderName}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-16 tracking-tight">
            Un Parcours <span className="text-primary">Exceptionnel</span>
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2" />
            
            {timeline.map((item, idx) => (
              <div key={idx} className={`relative flex items-start mb-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Content */}
                <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-8 md:pl-0`}>
                  <span className="font-mono text-primary text-sm">{item.year}</span>
                  <h3 className="font-oswald text-xl font-bold text-white uppercase mt-1 mb-2">{item.title}</h3>
                  <p className="text-text-muted font-manrope">{item.description}</p>
                </div>
                
                {/* Dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 border-4 border-background" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Découvrez Son Héritage
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Rejoignez les milliers de pratiquants qui ont choisi la méthode du Capitaine Levinet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              L'Académie
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/disciplines/spk"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              La Méthode SPK
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
      </>
      )}
    </PublicLayout>
  );
};

export default FounderPage;