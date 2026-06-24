import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Users, Award, ChevronRight, Loader2 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const KravMagAJLPage = () => {
  const { content, loading } = useSiteContent();

  // Valeurs dynamiques avec fallbacks
  const pageTitle = content?.pages?.kravmag?.title || content?.kravmag?.title || 'Krav Mag AJL';
  const pageSubtitle = content?.pages?.kravmag?.subtitle || content?.kravmag?.subtitle || 'Magazine International Multilingue';
  const pageDescription = content?.pages?.kravmag?.description || content?.kravmag?.description || "KRAV MAG AJL est un magazine international, multilingue, disponible en ligne et sur papier, dédié aux arts martiaux et à la self-défense.";
  const magazineCover = content?.pages?.kravmag?.hero_image || content?.kravmag?.image || '/images/page Krav Maga AJL.jpeg';
  const contentImage = content?.pages?.kravmag?.content_image || '';
  const secondaryImage = content?.pages?.kravmag?.secondary_image || '';

  const features = [
    { icon: Globe, title: 'International & Multilingue', description: 'Accessible dans le monde entier dans plusieurs langues.' },
    { icon: Users, title: '1 Million de Followers', description: 'Une communauté mondiale engagée et passionnée.' },
    { icon: BookOpen, title: 'En ligne & Papier', description: 'Format digital et imprimé pour tous les lecteurs.' },
    { icon: Award, title: 'Contenu Expert', description: 'Analyses, témoignages et vision terrain de professionnels.' },
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
      {/* Hero Banner - Magazine Cover */}
      <section className="pt-24 pb-0 px-0 relative overflow-hidden">
        <div className="relative h-[500px] md:h-[650px]">
          <img 
            src={magazineCover}
            alt="Krav Mag AJL - Magazine"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 pb-12 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 rounded-sm mb-4 backdrop-blur-sm">
                <span className="text-primary font-oswald text-sm uppercase tracking-wider">Magazine International</span>
              </div>
              <h1 className="font-oswald text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase mb-4 tracking-tight drop-shadow-lg">
                <span className="text-primary">Krav Mag AJL</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-manrope mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                Le magazine international multilingue des arts martiaux et de la self-défense
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.calameo.com/books/00804450798efd0bdcc1b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                >
                  Lire en Ligne
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </a>
                <a
                  href="#subscribe"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-oswald uppercase leading-none tracking-wider rounded-sm transition-all backdrop-blur-sm"
                >
                  S'Abonner
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section id="subscribe" className="py-16 px-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/20">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white/5 border border-primary/30 rounded-lg p-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left flex-1">
                <h3 className="font-oswald text-3xl font-bold text-white uppercase mb-2">
                  Abonnement <span className="text-primary">Annuel</span>
                </h3>
                <p className="text-text-secondary font-manrope text-lg mb-2">
                  4 magazines par an à prix réduit
                </p>
                <p className="text-text-muted font-manrope text-sm">
                  Recevez chaque édition trimestrielle directement chez vous
                </p>
              </div>
              <div className="text-center flex-shrink-0">
                <Link
                  to="/boutique"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                >
                  S'Abonner Maintenant
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Un Magazine <span className="text-primary">Unique</span>
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

      {/* Description Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                Un Espace de <span className="text-primary">Partage</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                KRAV MAG AJL est un magazine international, multilingue, disponible en ligne et 
                sur papier, dédié aux arts martiaux et à la self-défense.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Il offre un espace de partage et de réflexion, permettant à experts, instructeurs, 
                forces de l'ordre et pratiquants passionnés de transmettre leur expérience, leurs 
                analyses et leur vision du terrain.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Suivi par un million de followers, Krav Mag AJL est devenu une référence incontournable 
                dans le monde des arts martiaux et de la self-défense.
              </p>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <p className="text-primary font-oswald uppercase leading-none tracking-wide mb-2">Notre Mission</p>
                <p className="text-text-secondary font-manrope">
                  "Partager les connaissances et l'expertise de la communauté martiale internationale."
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10">
                <img 
                  src="https://res.cloudinary.com/dool0ngfx/image/upload/v1768917504/image-page-kravmaga-ajl_g66vpu.jpg"
                  alt="Krav Mag AJL - Dernière édition"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Read Section - Magazine en ligne */}
      <section id="read" className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Lire le <span className="text-primary">Magazine en Ligne</span>
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Accédez gratuitement à la dernière édition de Krav Mag AJL (Été 2026)
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-white/10">
              <iframe 
                src="https://v.calameo.com/?bkcode=00804450798efd0bdcc1b&mode=mini"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                title="KRAV MAG AJL ETE 2026"
                className="w-full h-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.calameo.com/books/00804450798efd0bdcc1b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              Ouvrir en Plein Écran
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </a>
          </div>
          
          <p className="text-text-muted font-manrope mt-8">
            Éditions trimestrielles • 4 numéros par an • Disponibles en ligne et sur papier
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Rejoignez la Communauté
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Suivez-nous et ne manquez aucune publication de Krav Mag AJL.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              S'abonner
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default KravMagAJLPage;
