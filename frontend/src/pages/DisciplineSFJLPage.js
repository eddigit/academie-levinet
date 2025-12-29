import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Shield, Heart, Sparkles, Target, Users, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const DisciplineSFJLPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data.disciplines?.sfjl || {});
      } catch (error) {
        console.error('Error fetching discipline content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const discTitle = content?.title || 'Self-Défense Féminine';
  const discSubtitle = content?.subtitle || 'Apprenez à Vous Protéger';
  const discDescription = content?.description || 'Vous avez le droit de vous sentir en sécurité. Nous sommes là pour vous apprendre des gestes simples et efficaces, dans un cadre bienveillant et rassurant.';
  const discImage = content?.image || 'https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/mbtzqqpj_Self-D%C3%A9fense%20F%C3%A9minine.jpeg';

  const pillars = [
    { icon: Sparkles, title: 'Reprendre Confiance', description: 'Apprenez à vous faire confiance. Vous êtes plus forte que vous ne le pensez.' },
    { icon: Target, title: 'Des Gestes Simples', description: 'Des techniques faciles à retenir, adaptées à votre quotidien.' },
    { icon: Shield, title: 'En Toute Sécurité', description: 'Un cadre bienveillant où vous apprenez à votre rythme, sans jugement.' },
    { icon: Users, title: 'Entre Nous', description: 'Des cours entre femmes, dans une ambiance de soutien et de solidarité.' },
  ];

  const scenarios = [
    'Se défendre dans la rue',
    'Réagir face au harcèlement',
    'Se dégager d\'une agression',
    'Se sentir en sécurité dans les transports',
    'Se libérer d\'une prise',
    'Savoir dire non fermement',
    'Gérer la peur et le stress',
    'Prendre confiance en soi',
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
          <div className="inline-block px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-sm mb-6">
            <span className="text-secondary font-oswald text-sm uppercase tracking-wider">Pour Vous, Mesdames</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-7xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            <span className="text-secondary">{discTitle}</span>
          </h1>
          <p className="font-oswald text-2xl text-text-secondary uppercase tracking-wide mb-6">
            {discSubtitle}
          </p>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            {discDescription}
          </p>
          
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Je Veux Apprendre
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Why SFJL Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Pourquoi <span className="text-secondary">Nous Rejoindre</span> ?
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Vous n'avez pas besoin d'être sportive. Vous n'avez pas besoin d'être forte. 
                Nous vous apprenons des gestes simples que vous pouvez utiliser, 
                peu importe votre âge ou votre condition physique.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Nos instructrices sont là pour vous accompagner avec patience et bienveillance. 
                Vous apprenez à votre rythme, dans un environnement où vous vous sentez à l'aise.
              </p>
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6">
                <p className="text-secondary font-oswald uppercase leading-none tracking-wide mb-2">Notre Promesse</p>
                <p className="text-text-secondary font-manrope italic">
                  "Nous sommes là pour vous. Pas pour vous juger, mais pour vous aider 
                  à vous sentir plus forte et plus confiante au quotidien."
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                <div 
                  className="w-full h-full bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/mbtzqqpj_Self-D%C3%A9fense%20F%C3%A9minine.jpeg)' }}
                  data-placeholder="sfjl-women-training"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Ce Que <span className="text-secondary">Nous Vous Offrons</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, idx) => (
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

      {/* Scenarios Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Ce Que <span className="text-secondary">Vous Apprendrez</span>
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">{scenario}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-center text-text-muted font-manrope mt-6">
            Des gestes simples pour des situations de la vie quotidienne.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 rounded-lg p-8 md:p-12 text-center">
            <Heart className="w-12 h-12 text-secondary mx-auto mb-6" strokeWidth={1.5} />
            <blockquote className="text-xl md:text-2xl text-text-secondary font-manrope italic leading-relaxed mb-6">
              "Avant, j'avais peur de marcher seule le soir. Aujourd'hui, 
              je me sens capable de réagir. Ça change tout."
            </blockquote>
            <p className="text-secondary font-oswald uppercase leading-none tracking-wider">
              — Marie, 34 ans
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Mesdames, Défendez-Vous
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Vous méritez de vous sentir en sécurité. Venez essayer, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
            >
              Essayer un Cours
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/international"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Trouver un Cours
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default DisciplineSFJLPage;