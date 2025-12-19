import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle, Award, Users, Globe, BookOpen, ChevronRight, Star } from 'lucide-react';

const JoinPage = () => {
  const benefits = [
    { icon: Award, title: 'Certifications Reconnues', description: 'Grades et diplômes validés par la Commission Internationale.' },
    { icon: Globe, title: 'Réseau Mondial', description: 'Accès aux clubs et événements dans plus de 50 pays.' },
    { icon: BookOpen, title: 'E-Learning Exclusif', description: 'Bibliothèque de cours vidéo HD accessible 24/7.' },
    { icon: Users, title: 'Communauté', description: 'Rejoignez une famille de 50 000+ pratiquants.' },
  ];

  const membershipTypes = [
    {
      name: 'Pratiquant',
      description: 'Pour les personnes souhaitant pratiquer dans un club affilié.',
      features: [
        'Accès aux cours en club',
        'Passage de grades',
        'Assurance incluse',
        'Accès e-learning basique',
      ],
      cta: 'Trouver un Club',
      link: '/international',
      highlight: false,
    },
    {
      name: 'Membre Premium',
      description: 'Pour un accès complet à toutes les ressources de l\'Académie.',
      features: [
        'Tout du niveau Pratiquant',
        'E-learning complet (100+ cours)',
        'Stages et séminaires prioritaires',
        'Magazine international',
        'Réductions boutique',
      ],
      cta: 'Devenir Premium',
      link: '/onboarding',
      highlight: true,
    },
    {
      name: 'Instructeur',
      description: 'Pour ceux qui souhaitent enseigner la méthode SPK.',
      features: [
        'Formation instructeur certifiée',
        'Licence d\'enseignement',
        'Support pédagogique complet',
        'Réseau professionnel',
      ],
      cta: 'Candidater',
      link: '/onboarding',
      highlight: false,
    },
  ];

  const steps = [
    { number: '01', title: 'Inscription', description: 'Remplissez le formulaire en ligne avec vos informations.' },
    { number: '02', title: 'Validation', description: 'Votre dossier est examiné par nos équipes.' },
    { number: '03', title: 'Bienvenue', description: 'Accédez à votre espace membre et commencez l\'aventure.' },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-sm mb-6">
            <span className="text-secondary font-oswald text-sm uppercase tracking-wider">Rejoignez-Nous</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-6xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Devenez <span className="text-secondary">Membre</span>
          </h1>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            Rejoignez l'élite de la self-défense mondiale. 
            Intégrez une communauté de passionnés et accédez à des ressources exclusives.
          </p>
          
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Commencer l'Inscription
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Avantages <span className="text-secondary">Membres</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-secondary/50 transition-colors text-center">
                <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-secondary" strokeWidth={1.5} />
                </div>
                <h3 className="font-oswald text-lg font-bold text-white uppercase mb-2">{item.title}</h3>
                <p className="text-text-muted font-manrope text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Types Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Types d'<span className="text-secondary">Adhésion</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTypes.map((type, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg p-8 ${type.highlight ? 'bg-secondary/10 border-2 border-secondary' : 'bg-white/5 border border-white/10'}`}
              >
                {type.highlight && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                    <span className="text-secondary font-oswald text-sm uppercase tracking-wider">Recommandé</span>
                  </div>
                )}
                <h3 className="font-oswald text-2xl text-white uppercase mb-2">{type.name}</h3>
                <p className="text-text-muted font-manrope text-sm mb-6">{type.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {type.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${type.highlight ? 'text-secondary' : 'text-primary'}`} strokeWidth={1.5} />
                      <span className="text-text-secondary font-manrope text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={type.link}
                  className={`block w-full py-3 text-center font-oswald uppercase leading-none tracking-wider rounded-sm transition-all ${
                    type.highlight 
                      ? 'bg-secondary hover:bg-secondary/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'border border-white/20 hover:border-white/50 text-white'
                  }`}
                >
                  {type.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Processus d'<span className="text-secondary">Adhésion</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center mx-auto mb-6">
                  <span className="font-oswald text-3xl text-secondary font-bold">{step.number}</span>
                </div>
                <h3 className="font-oswald text-xl text-white uppercase mb-2">{step.title}</h3>
                <p className="text-text-muted font-manrope">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selection Process Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-oswald text-2xl text-white uppercase mb-4">Processus Sélectif</h3>
                <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                  L'Académie Jacques Levinet maintient un processus d'adhésion sélectif et qualitatif. 
                  Chaque candidature est examinée pour garantir l'intégrité et la qualité de notre communauté.
                </p>
                <p className="text-text-muted font-manrope">
                  Cette approche assure que chaque membre partage nos valeurs d'excellence, 
                  de respect et d'engagement envers la self-défense responsable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Prêt à Nous Rejoindre ?
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Faites le premier pas vers l'excellence en self-défense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
            >
              Démarrer l'Inscription
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              En Savoir Plus
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default JoinPage;