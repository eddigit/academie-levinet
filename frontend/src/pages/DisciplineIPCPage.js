import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Shield, Target, Award, Users, ChevronRight, CheckCircle, Star, Loader2 } from 'lucide-react';
import api from '../utils/api';

const DisciplineIPCPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data.disciplines?.ipc || {});
      } catch (error) {
        console.error('Error fetching discipline content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const discTitle = content?.title || 'IPC / ROS';
  const discSubtitle = content?.subtitle || 'International Police Confederation';
  const discDescription = content?.description || "Formation professionnelle pour les forces de l'ordre et agents de sécurité.";
  const discImage = content?.image || 'https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/vjnvljgu_Professionnels%20Card.jpeg';

  const features = [
    { icon: Target, title: 'Efficacité Opérationnelle', description: 'Techniques validées sur le terrain par des unités d\'élite.' },
    { icon: Shield, title: 'Cadre Légal', description: 'Formation conforme aux règlementations de chaque pays.' },
    { icon: Award, title: 'Certification ROS', description: 'Certification délivrée dans le cadre de contrats de formation et de conventions.' },
    { icon: Users, title: 'Partenariats Élite', description: 'Collaborations avec OMON, ROTAM, BOPE, ERIS, GAD...' },
  ];

  const eliteUnits = [
    { name: 'OMON', country: 'Russie', description: 'Escadron d\'élite de la police russe' },
    { name: 'BOPE', country: 'Brésil', description: 'Batallão de Operações Policiais Especiais' },
    { name: 'ROTAM', country: 'Brésil', description: 'Rondas Ostensivas Tático Móvel' },
    { name: 'ERIS', country: 'France', description: 'Équipes Régionales d\'Intervention et de Sécurité' },
    { name: 'GAD', country: 'Argentine', description: 'Grupo de Apoyo Departamental' },
    { name: 'OSTTU', country: 'Australie', description: 'Partenaire australien de formation tactique' },
  ];

  const modules = [
    'Techniques d\'interpellation',
    'Maîtrise sans arme',
    'Usage proportionné de la force',
    'Tonfa police',
    'Bâton télescopique',
    'GTPI (Gestion Tactique de la Personne Interpellée)',
    'Défense contre armes',
    'Techniques de menottage',
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
          style={{ backgroundImage: `url(${discImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-6">
            <span className="text-primary font-oswald text-sm uppercase tracking-wider">Branche Professionnelle</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-7xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            <span className="text-primary">{discTitle}</span>
          </h1>
          <p className="font-oswald text-2xl text-text-secondary uppercase tracking-wide mb-6">
            {discSubtitle}
          </p>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            {discDescription}
          </p>
          
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            Demander une Formation
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Pourquoi <span className="text-primary">IPC</span> ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-colors text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-oswald text-lg font-bold text-white uppercase mb-2">{item.title}</h3>
                <p className="text-text-muted font-manrope text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROS Certification Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-2 tracking-tight">
                Certification <span className="text-primary">ROS</span>
              </h2>
              <p className="font-oswald text-lg text-text-secondary uppercase tracking-wide mb-6">
                Real Operational System
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Certification délivrée dans le cadre de contrats de formation et de conventions 
                avec les forces de l'ordre et les services de sécurité.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-8">
                Reconnue internationalement, cette certification atteste d'un niveau d'expertise 
                opérationnelle validé par l'Académie Jacques Levinet et ses partenaires.
              </p>
              
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  <span className="font-oswald text-lg text-primary uppercase">Dan ROS</span>
                </div>
                <p className="text-text-secondary font-manrope">
                  Les Dan ROS sont reconnus sur le plan international par l'ensemble des partenaires de l'IPC.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                <div 
                  className="w-full h-full bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/vjnvljgu_Professionnels%20Card.jpeg)' }}
                  data-placeholder="ipc-tactical-training"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Units Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-tight">
            Unités d'<span className="text-primary">Élite</span> Partenaires
          </h2>
          <p className="text-center text-text-secondary font-manrope mb-12">
            L'IPC collabore avec les unités les plus prestigieuses au monde.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eliteUnits.map((unit, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  <span className="font-oswald text-lg text-white uppercase">{unit.name}</span>
                </div>
                <p className="text-text-muted font-manrope text-sm">
                  <span className="text-primary">{unit.country}</span> — {unit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Modules Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Modules de <span className="text-primary">Formation</span>
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">{module}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-center text-text-muted font-manrope mt-6">
            Formations adaptées aux besoins spécifiques de chaque unité et pays.
          </p>
        </div>
      </section>

      {/* Certification ROS Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-tight">
            Certification <span className="text-primary">ROS</span>
          </h2>
          <p className="font-oswald text-xl text-center text-text-secondary uppercase tracking-wide mb-8">
            Real Operational System
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <p className="text-text-secondary font-manrope leading-relaxed mb-6">
              Certification délivrée dans le cadre de contrats de formation et de conventions avec les 
              institutions et forces de l'ordre. Les Dan ROS sont reconnus sur le plan international 
              par l'ensemble des partenaires de l'IPC.
            </p>
            <p className="text-text-secondary font-manrope leading-relaxed">
              Qualifications professionnelles délivrées par contrat ou convention pour les agents des 
              forces de l'ordre et professionnels de la sécurité.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Contactez l'IPC
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Pour les demandes de formation professionnelle et partenariats institutionnels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Demande de Formation
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/international"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Réseau International
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default DisciplineIPCPage;