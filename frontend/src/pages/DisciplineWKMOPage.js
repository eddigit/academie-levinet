import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Users, Heart, Home, Shield, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import api from '../utils/api';

const DisciplineWKMOPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data.disciplines?.wkmo || {});
      } catch (error) {
        console.error('Error fetching discipline content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const discTitle = content?.title || 'WKMO';
  const discSubtitle = content?.subtitle || 'World Krav Maga Organization';
  const discDescription = content?.description || 'La self-défense pour tous. Krav Maga, KAPAP et Self-Pro Krav accessibles au grand public dans un esprit familial et bienveillant.';
  const discImage = content?.image || 'https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/m50t9hgn_Grand%20Public%20Card.jpeg';

  const benefits = [
    { icon: Shield, title: 'Sécurité Personnelle', description: 'Apprenez à vous protéger et à protéger vos proches au quotidien.' },
    { icon: Heart, title: 'Confiance en Soi', description: 'Développez votre assurance et votre présence face aux situations de stress.' },
    { icon: Users, title: 'Communauté', description: 'Rejoignez une famille mondiale de pratiquants partageant les mêmes valeurs.' },
    { icon: Home, title: 'Esprit Familial', description: 'Cours adaptés pour tous : hommes, femmes, enfants, seniors.' },
  ];

  const audiences = [
    { title: 'Adultes', description: 'Programmes complets de self-défense adaptés à tous les niveaux.' },
    { title: 'Adolescents', description: 'Cours spécifiques pour développer confiance et discipline.' },
    { title: 'Enfants', description: 'Initiation ludique aux bases de la self-défense et du respect.' },
    { title: 'Seniors', description: 'Exercices adaptés pour maintenir forme et sécurité.' },
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
            <span className="text-primary font-oswald text-sm uppercase tracking-wider">Branche Civile</span>
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
            Rejoindre la WKMO
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Pourquoi <span className="text-primary">WKMO</span> ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, idx) => (
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

      {/* For Everyone Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Pour <span className="text-primary">Toute la Famille</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-8">
                Le WKMO accueille tous les profils, quel que soit l'âge ou le niveau de forme physique. 
                Nos programmes sont conçus pour s'adapter à chacun tout en maintenant l'excellence 
                technique qui fait la réputation de l'Académie Jacques Levinet.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {audiences.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="font-oswald text-lg text-primary uppercase mb-1">{item.title}</h4>
                    <p className="text-text-muted font-manrope text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                <div 
                  className="w-full h-full bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1595554919503-b806f0f8f106?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxkaXZlcnNlJTIwZ3JvdXAlMjBtYXJ0aWFsJTIwYXJ0cyUyMGNsYXNzJTIwbW9kZXJuJTIwZ3ltfGVufDB8fHx8MTc2NTgwMzcwMnww&ixlib=rb-4.1.0&q=85)' }}
                  data-placeholder="wkmo-family-training"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Disciplines <span className="text-primary">Enseignées</span>
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <h3 className="font-oswald text-xl text-white uppercase mb-2">Self-Pro Krav (SPK)</h3>
                <p className="text-text-secondary font-manrope">La méthode phare de l'Académie, conçue pour une efficacité maximale tout en respectant le cadre légal.</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <h3 className="font-oswald text-xl text-white uppercase mb-2">Krav Maga</h3>
                <p className="text-text-secondary font-manrope">Techniques de combat rapproché israéliennes adaptées pour le civil.</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <h3 className="font-oswald text-xl text-white uppercase mb-2">KAPAP</h3>
                <p className="text-text-secondary font-manrope">"Face to Face Combat" - techniques de combat au corps à corps d'origine militaire.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Trouvez Votre Club
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Près de 100 clubs WKMO dans le monde. Il y en a forcément un près de chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/international"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Carte des Clubs
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/onboarding"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              S'inscrire en Ligne
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default DisciplineWKMOPage;