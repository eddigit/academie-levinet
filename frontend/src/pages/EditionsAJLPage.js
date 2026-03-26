import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Lightbulb, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const EditionsAJLPage = () => {
  const { content, loading } = useSiteContent();

  // Valeurs dynamiques avec fallbacks
  const pageTitle = content?.pages?.editions?.title || content?.editions?.title || 'Éditions AJL';
  const pageSubtitle = content?.pages?.editions?.subtitle || content?.editions?.subtitle || 'Plateforme Ouverte de Diffusion de Travaux';
  const pageDescription = content?.pages?.editions?.description || content?.editions?.description || "Les Éditions AJL sont une plateforme ouverte dédiée à la diffusion de travaux de recherche, d'études techniques et de réflexions sur les arts martiaux et la self-défense.";
  const heroImage = content?.pages?.editions?.hero_image || content?.editions?.image || '/images/logo-levinet.jpeg';
  const featuredBookImage = content?.pages?.editions?.featured_book_image || '';
  const catalogImage = content?.pages?.editions?.catalog_image || '';

  const features = [
    { icon: BookOpen, title: 'Publications Ouvertes', description: 'Espace de libre diffusion de travaux académiques et techniques.' },
    { icon: Lightbulb, title: 'Recherche & Études', description: 'Analyses, mémoires, thèses et études de terrain.' },
    { icon: Users, title: 'Communauté d\'Experts', description: 'Contributions d\'instructeurs, chercheurs et professionnels.' },
  ];

  const publicationTypes = [
    'Mémoires et Thèses',
    'Études Techniques',
    'Analyses Tactiques',
    'Recherches Académiques',
    'Retours d\'Expérience',
    'Guides Pédagogiques',
    'Études Comparatives',
    'Protocoles d\'Entraînement',
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
      {/* Hero Banner - Publiez votre ouvrage */}
      <section className="pt-24 pb-0 px-0 relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px]">
          <img 
            src={heroImage}
            alt="Éditions AJL - Publiez votre ouvrage avec nous"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 pb-12 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="font-oswald text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase mb-4 tracking-tight drop-shadow-lg">
                Publiez Votre Ouvrage <span className="text-primary">Avec Nous</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-manrope mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                Les Éditions AJL accompagnent vos travaux de recherche et vos ouvrages techniques
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#submit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                >
                  Soumettre un Ouvrage
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </a>
                <a
                  href="#publications"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-oswald uppercase leading-none tracking-wider rounded-sm transition-all backdrop-blur-sm"
                >
                  Nos Publications
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Une Plateforme <span className="text-primary">Ouverte</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-primary/50 transition-colors text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-oswald text-xl font-bold text-white uppercase mb-3">{item.title}</h3>
                <p className="text-text-muted font-manrope">{item.description}</p>
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
                Diffuser le <span className="text-primary">Savoir</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Les Éditions AJL sont une plateforme ouverte dédiée à la diffusion de travaux de 
                recherche, d'études techniques et de réflexions sur les arts martiaux et la self-défense.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Notre mission est de favoriser le partage des connaissances et d'encourager la recherche 
                dans le domaine de la défense personnelle et des disciplines martiales. Nous offrons un 
                espace où instructeurs, chercheurs, forces de l'ordre et pratiquants peuvent publier leurs 
                travaux et contribuer à l'avancement de ces disciplines.
              </p>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Toutes les publications sont accessibles librement, garantissant une diffusion large et 
                démocratique du savoir martial et défensif.
              </p>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <p className="text-primary font-oswald uppercase leading-none tracking-wide mb-2">Notre Vision</p>
                <p className="text-text-secondary font-manrope">
                  "Créer un pont entre la recherche académique, l'expertise technique et la pratique opérationnelle."
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                <img 
                  src="https://res.cloudinary.com/dool0ngfx/image/upload/v1768919745/LIVRE_EDITIONS_AJL_giaiek.jpg"
                  alt="Dernier livre Éditions AJL"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publication Types Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-6 tracking-tight">
            Types de <span className="text-primary">Publications</span>
          </h2>
          <p className="text-text-secondary font-manrope text-center mb-12 max-w-3xl mx-auto">
            Les Éditions AJL accueillent une grande variété de travaux académiques et techniques.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {publicationTypes.map((type, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary/50 transition-colors flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                <span className="text-white font-manrope">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications Section */}
      <section id="publications" className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-6 tracking-tight">
            Publications <span className="text-primary">Récentes</span>
          </h2>
          <p className="text-text-secondary font-manrope text-center mb-12">
            Accédez aux derniers travaux publiés par notre communauté d'experts.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <div className="aspect-video rounded-lg overflow-hidden border border-white/10 mb-6">
              {catalogImage ? (
                <img 
                  src={catalogImage}
                  alt="Catalogue Éditions AJL"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <span className="text-text-muted font-manrope text-sm text-center px-4">Catalogue des publications à ajouter</span>
                </div>
              )}
            </div>
            <p className="text-text-secondary font-manrope">
              Catalogue des Éditions AJL - Publications et ouvrages disponibles.
            </p>
          </div>
        </div>
      </section>

      {/* Submit Section */}
      <section id="submit" className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-6 tracking-tight">
            Publiez Votre <span className="text-primary">Ouvrage</span>
          </h2>
          <p className="text-text-secondary font-manrope text-center text-lg mb-12">
            Les Éditions AJL accompagnent les auteurs dans la publication de leurs travaux de recherche, 
            mémoires, thèses et ouvrages techniques sur les arts martiaux et la self-défense.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
            <h3 className="font-oswald text-2xl font-bold text-white uppercase mb-6">Nous Publions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                <p className="text-text-secondary font-manrope">Mémoires et thèses académiques</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                <p className="text-text-secondary font-manrope">Ouvrages techniques et pédagogiques</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                <p className="text-text-secondary font-manrope">Études de recherche et analyses</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                <p className="text-text-secondary font-manrope">Retours d'expérience terrain</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-8">
            <h3 className="font-oswald text-xl text-primary uppercase mb-4">Comment Soumettre ?</h3>
            <p className="text-text-secondary font-manrope mb-6">
              Envoyez-nous votre manuscrit ou proposition d'ouvrage. Notre comité éditorial examine 
              chaque soumission pour garantir la qualité et la pertinence des publications.
            </p>
            <div className="text-center">
              <a
                href="mailto:contact@academielevinet.com?subject=Soumission%20d%27ouvrage"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                Soumettre Mon Ouvrage
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Rejoignez Notre Communauté
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Devenez membre de l'Académie Jacques Levinet et accédez à toutes nos publications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Devenir Membre
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
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

export default EditionsAJLPage;
