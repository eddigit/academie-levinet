import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Shield, Target, Zap, Brain, CheckCircle, ChevronRight } from 'lucide-react';

const DisciplineSPKPage = () => {
  const principles = [
    { icon: Target, title: 'Efficacité Réaliste', description: 'Techniques éprouvées sur le terrain, basées sur l\'instinct de survie.' },
    { icon: Shield, title: 'Légalité', description: 'Adapté aux législations françaises et européennes sur la légitime défense.' },
    { icon: Brain, title: 'Instinct Naturel', description: 'Exploite les réflexes innés de l\'humain face au danger.' },
    { icon: Zap, title: 'Rapidité d\'Apprentissage', description: 'Méthode structurée pour une progression rapide et mesurable.' },
  ];

  const modules = [
    'Défense contre attaques à mains nues',
    'Défense contre armes blanches',
    'Défense contre armes à feu (menace)',
    'Gestion du stress et de l\'agressivité',
    'Techniques de désengagement',
    'Protection de tiers',
    'Situations multiples agresseurs',
    'Self-défense au sol',
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1655558846882-fa55132d6c20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHx0YWN0aWNhbCUyMHNlbGYlMjBkZWZlbnNlJTIwdHJhaW5pbmclMjBhY3Rpb258ZW58MHx8fHwxNzY1ODAzNzAwfDA&ixlib=rb-4.1.0&q=85)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-sm mb-6">
            <span className="text-accent font-oswald text-sm uppercase tracking-wider">Méthode Phare</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-7xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Self-Pro <span className="text-accent">Krav</span>
          </h1>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            La méthode de self-défense créée par le Capitaine Jacques Levinet. 
            Efficace, réaliste, et conforme aux lois sur la légitime défense.
          </p>
          
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/80 text-white font-oswald uppercase tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Commencer l'Entraînement
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* What is SPK Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Qu'est-ce que le <span className="text-accent">SPK</span> ?
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Le Self-Pro Krav (SPK) est une méthode de self-défense développée par le Capitaine 
                Jacques Levinet après des années de recherche internationale et d'expérience terrain 
                dans la Police Nationale.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Contrairement au Krav Maga traditionnel, le SPK intègre des "garde-fous" éthiques 
                et légaux, rendant la pratique à la fois efficace et responsable.
              </p>
              <p className="text-text-muted font-manrope leading-relaxed">
                <strong className="text-white">SPK = Self-Pro Krav</strong> — L'évolution responsable 
                du Krav Maga, conçue pour les réalités du 21ème siècle.
              </p>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                <div 
                  className="w-full h-full bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/m50t9hgn_Grand%20Public%20Card.jpeg)' }}
                  data-placeholder="spk-training-session"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Les <span className="text-accent">Principes</span> Fondamentaux
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((item, idx) => (
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
            Programmes adaptés du débutant au pratiquant confirmé. Certification officielle AJL.
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
            Rejoignez les milliers de pratiquants qui ont choisi le Self-Pro Krav.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-accent hover:bg-accent/80 text-white font-oswald uppercase tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              S'inscrire Maintenant
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/pedagogy"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Système de Grades
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default DisciplineSPKPage;