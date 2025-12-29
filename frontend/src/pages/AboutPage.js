import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Target, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data.about || {});
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const aboutTitle = content?.title || "L'Académie Jacques Levinet";
  const aboutDescription = content?.description || "Depuis plus de 25 ans, l'Académie est spécialisée dans la self-défense de rue et la formation professionnelle des forces de l'ordre. Une structure tripartite internationale regroupant Self-Pro Krav, Krav Maga, KAPAP et autres disciplines de combat.";
  const aboutMission = content?.mission || "Unifier les pratiquants de diverses disciplines — Self-Pro Krav, Krav Maga, KAPAP, Canne Défense, Self Féminine et autres méthodes de self-défense — sous une bannière commune d'excellence et d'efficacité.";
  const aboutImage = content?.image || 'https://images.unsplash.com/photo-1595554919503-b806f0f8f106?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxkaXZlcnNlJTIwZ3JvdXAlMjBtYXJ0aWFsJTIwYXJ0cyUyMGNsYXNzJTIwbW9kZXJuJTIwZ3ltfGVufDB8fHx8MTc2NTgwMzcwMnww&ixlib=rb-4.1.0&q=85';

  const pillars = [
    {
      acronym: 'AJL',
      name: 'Académie Jacques Levinet',
      description: 'Organisation mère qui fédère l\'ensemble de la structure. Centre de décision et garant de la qualité pédagogique.',
      color: 'accent',
      icon: Award,
    },
    {
      acronym: 'WKMO',
      name: 'World Krav Maga Organization',
      description: 'Branche civile rassemblant les pratiquants de self-défense du monde entier. Krav Maga, KAPAP, et Self-Pro Krav pour tous.',
      color: 'primary',
      icon: Users,
    },
    {
      acronym: 'IPC',
      name: 'International Police Conference',
      description: 'Branche professionnelle dédiée à l\'optimisation de l\'entraînement des forces de l\'ordre pour une efficacité opérationnelle maximale.',
      color: 'secondary',
      icon: Shield,
    },
  ];

  const values = [
    'Excellence technique et pédagogique',
    'Éthique et responsabilité',
    'Accessibilité pour tous les publics',
    'Innovation continue',
    'Respect des traditions martiales',
    'Communauté mondiale solidaire',
  ];

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-sm mb-6">
            <span className="text-secondary font-oswald text-sm uppercase tracking-wider">À Propos</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-6xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            <span className="text-secondary">{aboutTitle}</span>
          </h1>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            {aboutDescription}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Notre <span className="text-primary">Mission</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                {aboutMission}
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-8">
                Optimiser l'entraînement des forces de police à travers le monde pour une 
                meilleure efficacité opérationnelle, tout en respectant les cadres légaux de chaque pays.
              </p>
              
              <ul className="space-y-3">
                {values.map((value, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-text-secondary font-manrope">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={aboutImage}
                  alt="Entraînement à l'Académie"
                  className="w-full h-full object-cover bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-4 tracking-tight">
              La Structure <span className="text-primary">Tripartite</span>
            </h2>
            <p className="text-text-secondary font-manrope text-lg max-w-2xl mx-auto">
              Une organisation unique qui couvre tous les aspects de la self-défense, 
              du grand public aux professionnels.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => (
              <div 
                key={idx} 
                className={`bg-white/5 border border-white/10 rounded-lg p-8 hover:border-${pillar.color}/50 transition-all duration-300 group`}
              >
                <div className={`w-16 h-16 rounded-lg bg-${pillar.color}/10 flex items-center justify-center mb-6 group-hover:bg-${pillar.color}/20 transition-colors`}>
                  <pillar.icon className={`w-8 h-8 text-${pillar.color}`} strokeWidth={1.5} />
                </div>
                <h3 className={`font-oswald text-3xl font-bold text-${pillar.color} uppercase mb-2`}>
                  {pillar.acronym}
                </h3>
                <h4 className="font-oswald text-lg text-white uppercase mb-4">
                  {pillar.name}
                </h4>
                <p className="text-text-muted font-manrope leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Notre <span className="text-secondary">Histoire</span>
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <span className="font-mono text-primary text-sm">1998</span>
              <h3 className="font-oswald text-2xl font-bold text-white uppercase mt-2 mb-4">La Fondation</h3>
              <p className="text-text-secondary font-manrope leading-relaxed">
                Le Capitaine Jacques Levinet fonde l'Académie après des années de recherche internationale. 
                Sa mission : créer des méthodes de self-défense efficaces, réalistes et adaptées aux législations modernes.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <span className="font-mono text-primary text-sm">2000s</span>
              <h3 className="font-oswald text-2xl font-bold text-white uppercase mt-2 mb-4">L'Expansion</h3>
              <p className="text-text-secondary font-manrope leading-relaxed">
                Création de la structure tripartite AJL - WKMO - IPC. L'Académie gagne en reconnaissance 
                internationale et commence à former des unités d'élite à travers le monde.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <span className="font-mono text-primary text-sm">Aujourd'hui</span>
              <h3 className="font-oswald text-2xl font-bold text-white uppercase mt-2 mb-4">Une Référence Mondiale</h3>
              <p className="text-text-secondary font-manrope leading-relaxed">
                Plus de 50 pays représentés, 50 directeurs techniques, et des collaborations avec les 
                unités d'élite les plus prestigieuses : ROTAM (Brésil), OMON (Russie), BOPE, ERIS, GAD (Grupo de Apoyo). 
                L'Académie continue d'innover et de former l'élite de demain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Rejoignez l'Académie
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Faites partie d'une communauté mondiale dédiée à l'excellence en self-défense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
            >
              Devenir Membre
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/founder"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Le Fondateur
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;