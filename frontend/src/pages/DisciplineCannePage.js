import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Shield, Target, Users, Award, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const DisciplineCannePage = () => {
  const { content, loading } = useSiteContent();

  // Valeurs dynamiques avec fallbacks
  const discTitle = content?.disciplines?.canne?.title || 'Canne Défense';
  const discSubtitle = content?.disciplines?.canne?.subtitle || 'Méthode Novatrice';
  const discDescription = content?.disciplines?.canne?.description || "Une méthode nouvelle française adaptée aux agressions de la rue. La canne devient un instrument de protection efficace et légal.";
  const discImage = content?.disciplines?.canne?.hero_image || content?.disciplines?.canne?.image || '/images/image pour la page Canne defense.jpeg';
  const discLogoImage = content?.disciplines?.canne?.logo_image || '/images/image pour la page Canne defense.jpeg';
  const discSecondaryImage = content?.disciplines?.canne?.secondary_image || '/images/image pour la page Canne defense.jpeg';

  const benefits = [
    { icon: Shield, title: 'Protection Efficace', description: 'La canne offre une distance de sécurité et une protection contre les agressions.' },
    { icon: Target, title: 'Précision Technique', description: 'Techniques précises et contrôlées pour une défense proportionnée.' },
    { icon: Users, title: 'Accessible à Tous', description: 'Particulièrement adapté aux seniors et personnes avec handicap.' },
    { icon: Award, title: 'Méthode Française', description: 'Une innovation française créée par le Capitaine Jacques Levinet pour se défendre dans la rue.' },
  ];

  const modules = [
    'Postures et déplacements',
    'Parades et blocages',
    'Ripostes contrôlées',
    'Techniques de désarmement',
    'Défense contre plusieurs adversaires',
    'Gestion de l\'espace',
    'Utilisation légale de la canne',
    'Scénarios réalistes',
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
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: discImage ? `url(${discImage})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-sm mb-6">
            <span className="text-accent font-oswald text-sm uppercase tracking-wider">Discipline Traditionnelle</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-7xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            <span className="text-accent">{discTitle}</span>
          </h1>
          <p className="font-oswald text-2xl text-text-secondary uppercase tracking-wide mb-6">
            {discSubtitle}
          </p>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            {discDescription}
          </p>
          
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Découvrir la Canne Défense
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Pourquoi la <span className="text-accent">Canne Défense</span> ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent/50 transition-colors text-center">
                <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-oswald text-lg font-bold text-white uppercase mb-2">{item.title}</h3>
                <p className="text-text-muted font-manrope text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Une Méthode <span className="text-accent">Déposée</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                La Canne Défense Jacques Levinet est une méthode moderne de self-défense utilisant 
                la canne comme instrument de protection. Créée par le Capitaine Jacques Levinet, 
                elle répond aux besoins actuels de sécurité personnelle face aux agressions de rue.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Particulièrement adaptée aux seniors et aux personnes ayant besoin d'un appui, 
                la canne devient un outil de confiance et de sécurité au quotidien.
              </p>
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
                <p className="text-accent font-oswald uppercase leading-none tracking-wide mb-2">Notre Engagement</p>
                <p className="text-text-secondary font-manrope">
                  "Transformer un objet du quotidien en instrument adapté de protection efficace et légal."
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-xl">
                <img 
                  src={discLogoImage}
                  alt="Canne Défense Jacques Levinet - Entraînement"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Content Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Programme de <span className="text-accent">Formation</span>
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">{module}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-center text-text-muted font-manrope mt-6">
            Formation adaptée à tous les niveaux. Certification officielle AJL.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Prêt à Commencer ?
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Découvrez la Canne Défense dans un club près de chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-accent hover:bg-accent/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              S'inscrire
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/international"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Trouver un Club
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default DisciplineCannePage;
