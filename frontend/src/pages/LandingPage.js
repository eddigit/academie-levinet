import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Globe, Video, CheckCircle, Target, Sparkles, Loader2, Facebook, Youtube, Linkedin, Twitter } from 'lucide-react';
import MegaMenu from '../components/MegaMenu';
import api from '../utils/api';
import BUILD_INFO from '../buildInfo';

const LandingPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data);
      } catch (error) {
        console.error('Error fetching site content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const heroTitle = content?.hero?.title || "La Self-Défense Efficace, Réaliste et Sécurisée";
  const heroSubtitle = content?.hero?.subtitle || "Validée par l'Expérience d'Élite du Capitaine Jacques Levinet";
  const heroDescription = content?.hero?.description || "Méthode brevetée par l'ex-capitaine de police et champion de France de karaté.";
  const heroImage = content?.hero?.background_image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80';
  const logoUrl = content?.images?.logo || 'https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg';
  const footerTagline = content?.footer?.tagline || 'Académie Jacques Levinet – World Krav Maga Organization – International Police Confederation';
  const footerCopyright = content?.footer?.copyright || '© 2025 Académie Jacques Levinet. Tous droits réservés.';
  
  // Contact dynamique
  const contactPhone = content?.contact?.phone || '+33698070851';
  const contactAddress = content?.contact?.address || 'Saint Jean de Védas';
  
  // Réseaux sociaux dynamiques
  const socialFacebook = content?.social_links?.facebook || 'https://www.facebook.com/capitainejacqueslevinet/';
  const socialYoutube = content?.social_links?.youtube || 'https://www.youtube.com/@CapitaineJacquesLevinet';
  const socialLinkedin = content?.social_links?.linkedin || 'https://www.linkedin.com/in/jacqueslevinet/';
  const socialTwitter = content?.social_links?.twitter || 'https://x.com/Jacques_LEVINET';

  // Vidéo YouTube - utiliser l'URL du CMS hero.video_url ou la vidéo par défaut
  // L'URL doit être au format embed avec les paramètres autoplay
  const getVideoUrl = () => {
    const cmsUrl = content?.hero?.video_url;
    const defaultVideoId = 'mX3cGUHUgKo';
    
    if (!cmsUrl) {
      return `https://www.youtube.com/embed/${defaultVideoId}?autoplay=1&mute=1&loop=1&playlist=${defaultVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`;
    }
    
    // Extraire l'ID vidéo de l'URL du CMS
    let videoId = defaultVideoId;
    if (cmsUrl.includes('youtube.com/embed/')) {
      videoId = cmsUrl.split('youtube.com/embed/')[1]?.split('?')[0] || defaultVideoId;
    } else if (cmsUrl.includes('youtube.com/watch?v=')) {
      videoId = cmsUrl.split('v=')[1]?.split('&')[0] || defaultVideoId;
    } else if (cmsUrl.includes('youtu.be/')) {
      videoId = cmsUrl.split('youtu.be/')[1]?.split('?')[0] || defaultVideoId;
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`;
  };
  const heroVideoUrl = getVideoUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Header - Mobile First */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-white/5 safe-top">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img 
              src={logoUrl} 
              alt="Logo Académie Jacques Levinet" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              data-testid="header-logo"
            />
            <div className="hidden sm:block">
              <h1 className="font-oswald text-base md:text-xl font-bold text-text-primary uppercase tracking-wide">
                Académie Jacques Levinet
              </h1>
              <p className="text-[10px] md:text-xs text-text-secondary font-manrope">École Internationale de Self-Défense</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <MegaMenu />
            <Link 
              to="/login" 
              data-testid="header-login-button"
              className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider leading-none rounded-sm transition-all"
            >
              <span className="hidden sm:inline">Connexion</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 relative overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center" 
        data-testid="hero-section"
      >
        {/* Background with Video and Fallback Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Fallback background image (shows if video doesn't load) */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${heroImage})`,
              filter: 'brightness(0.4)'
            }}
          />
          {/* YouTube Video Background */}
          <iframe
            className="absolute top-1/2 left-1/2 w-[300vw] md:w-[100vw] h-[300vw] md:h-[56.25vw] min-h-[100vh] min-w-[177.77vh] z-10"
            style={{
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
            src={heroVideoUrl}
            title="Académie Jacques Levinet Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-20"></div>
        </div>

        {/* Content - Mobile First */}
        <div className="container mx-auto text-center max-w-4xl relative z-30 px-4">
          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary uppercase mb-6 md:mb-10 tracking-wide drop-shadow-2xl leading-tight">
            {heroTitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-text-secondary font-manrope mb-4 md:mb-8 leading-relaxed drop-shadow-lg">
            {heroSubtitle}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-text-primary/90 font-manrope mb-8 md:mb-12 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
            {heroDescription}
          </p>
          <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="hero-cta-button"
              className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-base md:text-lg tracking-wider leading-none rounded-sm transition-all w-full sm:w-auto"
            >
              Rejoindre l'Académie
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Les 3 Piliers - Mobile First */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-paper" data-testid="features-section">
        <div className="container mx-auto">
          <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary uppercase mb-3 md:mb-4 tracking-wide">
            Les 3 Piliers de Nos Méthodes
          </h3>
          <p className="text-center text-text-secondary font-manrope text-sm md:text-lg mb-2 max-w-3xl mx-auto">
            Krav Maga SPK - Self Pro Krav - Canne Défense - Bâton Défense - Self-Défense Femmes - Self-Défense Enfants
          </p>
          <p className="text-center text-primary font-manrope text-xs md:text-base mb-8 md:mb-16 max-w-3xl mx-auto">
            Pour les professionnels de la sécurité et Forces de l'ordre : Real Operational System
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            <div className="stat-card text-center p-4 md:p-6" data-testid="feature-card-legitimite">
              <Award className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-2 md:mb-3">Légitimité & Expertise</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-2 md:mb-3 text-sm md:text-base">
                Héritage du Capitaine Jacques Levinet, Champion de France de Karaté
              </p>
              <p className="text-text-muted font-manrope text-xs md:text-sm">
                Méthodes éprouvées et reconnues mondialement (WKMO, IPC)
              </p>
            </div>

            <div className="stat-card text-center p-4 md:p-6" data-testid="feature-card-securite">
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-secondary mx-auto mb-3 md:mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-2 md:mb-3">Sécurité & Éthique</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-2 md:mb-3 text-sm md:text-base">
                Respect de la légitime défense
              </p>
              <p className="text-text-muted font-manrope text-xs md:text-sm">
                Une pratique simple basée sur l'instinct de survie et les réflexes
              </p>
            </div>

            <div className="stat-card text-center p-4 md:p-6 sm:col-span-2 md:col-span-1" data-testid="feature-card-accessibilite">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-accent mx-auto mb-3 md:mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-2 md:mb-3">Accessibilité & Communauté</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-2 md:mb-3 text-sm md:text-base">
                Conçue pour tous : hommes, femmes, enfants, seniors
              </p>
              <p className="text-text-muted font-manrope text-xs md:text-sm">
                Esprit familial avec présence internationale forte
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section - Mobile First */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-background">
        <div className="container mx-auto">
          <div className="mb-8 md:mb-16 max-w-3xl">
            <h3 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-text-primary mb-3 md:mb-4">
              Pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Qui ?</span>
            </h3>
            <div className="h-1 w-16 md:w-24 bg-accent mb-4 md:mb-6" />
            <p className="font-manrope text-sm md:text-lg text-text-secondary">
              L'Académie Jacques Levinet, organisme de formation, propose des parcours adaptés à chaque profil, du débutant au professionnel aguerri.
            </p>
          </div>

          <div className="grid gap-4 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pour Tout Public Card */}
            <div 
              className="group relative h-[350px] sm:h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:border-accent/50"
              data-testid="audience-card-public"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/m50t9hgn_Grand%20Public%20Card.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-8 md:w-12 bg-accent mb-3 md:mb-4 transition-all duration-500 group-hover:w-16 md:group-hover:w-24" />
                  <h4 className="font-oswald text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-2 md:mb-3 drop-shadow-lg">
                    Pour Tout Public
                  </h4>
                  <p className="font-manrope text-sm md:text-base text-gray-300 mb-4 md:mb-6 opacity-90 max-w-xs">
                    Apprenez à vous défendre avec notre méthode Self-Pro Krav, adaptée à tous
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-accent">Je veux apprendre</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Les Femmes Card - Mobile First */}
            <div 
              className="group relative h-[350px] sm:h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20 hover:border-secondary/50"
              data-testid="audience-card-women"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/mbtzqqpj_Self-D%C3%A9fense%20F%C3%A9minine.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-8 md:w-12 bg-secondary mb-3 md:mb-4 transition-all duration-500 group-hover:w-16 md:group-hover:w-24" />
                  <h4 className="font-oswald text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-2 md:mb-3 drop-shadow-lg">
                    Pour les Femmes
                  </h4>
                  <p className="font-manrope text-sm md:text-base text-gray-300 mb-4 md:mb-6 opacity-90 max-w-xs">
                    Apprenez à vous défendre avec des gestes simples et efficaces. On est là pour vous aider.
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-secondary">Je veux apprendre</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Forces de Sécurité Card - Mobile First */}
            <div 
              className="group relative h-[350px] sm:h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 sm:col-span-2 lg:col-span-1"
              data-testid="audience-card-pro"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/vjnvljgu_Professionnels%20Card.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-8 md:w-12 bg-primary mb-3 md:mb-4 transition-all duration-500 group-hover:w-16 md:group-hover:w-24" />
                  <h4 className="font-oswald text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-2 md:mb-3 drop-shadow-lg">
                    Forces de Sécurité
                  </h4>
                  <p className="font-manrope text-sm md:text-base text-gray-300 mb-4 md:mb-6 opacity-90 max-w-xs">
                    Formation opérationnelle pour les forces de l'ordre et les agents de sécurité
                  </p>
                  <div className="flex items-center gap-2 md:gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary">Formation Pro</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapmonde - Communauté Mondiale - Mobile First */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-background">
        <div className="container mx-auto">
          <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary uppercase mb-3 md:mb-4 tracking-wide">
            Trouvez Votre Club
          </h3>
          <p className="text-center text-text-secondary font-manrope text-sm md:text-lg mb-8 md:mb-12 max-w-3xl mx-auto">
            Trouvez votre club partout dans le monde
          </p>
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full rounded-lg border border-white/10 overflow-hidden" style={{ paddingBottom: '75%' }}>
              <iframe
                src="https://www.google.com/maps/d/u/0/embed?mid=1RdKNrRv4jEPjQTr7BDBCpXuuYAs&ll=-0.10736278113021733%2C0&z=1"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte mondiale des clubs de l'Académie Jacques Levinet"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 max-w-4xl mx-auto">
            <div className="text-center p-3 md:p-4 rounded-lg bg-white/5">
              <p className="text-2xl md:text-4xl font-oswald font-bold text-primary mb-1 md:mb-2">50+</p>
              <p className="text-text-secondary font-manrope text-xs md:text-sm">Pays</p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-lg bg-white/5">
              <p className="text-2xl md:text-4xl font-oswald font-bold text-primary mb-1 md:mb-2">50</p>
              <p className="text-text-secondary font-manrope text-xs md:text-sm">Directeurs Techniques</p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-lg bg-white/5 col-span-2 md:col-span-1">
              <p className="text-2xl md:text-4xl font-oswald font-bold text-primary mb-1 md:mb-2">50 ans</p>
              <p className="text-text-secondary font-manrope text-xs md:text-sm">d'Expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cours en Ligne */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-paper">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary uppercase mb-4 md:mb-6 tracking-wide">
                  Formations en Ligne
                </h3>
                <p className="text-text-secondary font-manrope text-sm md:text-lg mb-4 md:mb-6 leading-relaxed">
                  Accédez à une bibliothèque complète de supports pédagogiques pour vous former où que vous soyez, à votre rythme.
                </p>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary text-lg md:text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1">Supports Pédagogiques</h5>
                      <p className="text-text-secondary font-manrope text-xs md:text-sm">Vidéos et PDF téléchargeables</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary text-lg md:text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1">Programmes Structurés</h5>
                      <p className="text-text-secondary font-manrope text-xs md:text-sm">Progressions adaptées à chaque niveau</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-primary text-lg md:text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1">Manuels</h5>
                      <p className="text-text-secondary font-manrope text-xs md:text-sm">Supports pédagogiques imprimés et numériques</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="stat-card p-6 md:p-8 text-center">
                  <Video className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4" strokeWidth={1} />
                  <h4 className="font-oswald text-xl md:text-2xl font-bold text-text-primary uppercase mb-3 md:mb-4">E-Learning Self Défense</h4>
                  <p className="text-text-secondary font-manrope mb-4 md:mb-6 text-sm md:text-base">
                    Rejoignez les élèves qui se forment en ligne
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-oswald font-bold text-primary">50+</p>
                      <p className="text-[10px] md:text-xs text-text-muted font-manrope">Supports</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-oswald font-bold text-primary">24/7</p>
                      <p className="text-[10px] md:text-xs text-text-muted font-manrope">Accès Illimité</p>
                    </div>
                  </div>
                  <Link 
                    to="/onboarding"
                    className="inline-flex items-center justify-center mt-4 md:mt-6 px-5 md:px-6 py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider leading-none rounded-sm transition-all text-sm md:text-base w-full sm:w-auto"
                  >
                    Apprendre en Ligne
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encart Défense Féminine - Mobile First */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-secondary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 md:w-64 h-32 md:h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 md:w-96 h-48 md:h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-secondary/20 rounded-full mb-4 md:mb-6">
              <span className="text-secondary font-oswald text-xs md:text-sm uppercase tracking-wide">Spécial Femmes</span>
            </div>
            <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary uppercase mb-4 md:mb-6 tracking-wide">
              Self-Défense Féminine
            </h3>
            <p className="text-base md:text-xl text-text-secondary font-manrope mb-6 md:mb-8 leading-relaxed">
              Reprenez le Contrôle de Votre Sécurité
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-secondary mx-auto mb-2 md:mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Empowerment</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Développez votre confiance et votre force intérieure</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <Target className="w-10 h-10 md:w-12 md:h-12 text-accent mx-auto mb-2 md:mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Scénarios Réalistes</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Techniques adaptées aux situations réelles</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2 md:mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Sans Agressivité</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Pratique sûre et respectueuse des lois</p>
              </div>
            </div>
            <p className="text-sm md:text-lg text-text-primary/90 font-manrope mb-6 md:mb-8 max-w-2xl mx-auto">
              <strong>Dans un contexte où la sécurité personnelle est plus importante que jamais</strong>, 
              notre programme vous donne les outils pour vous défendre efficacement contre toutes les formes de violence.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs Section - Mobile First */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-center text-text-primary uppercase mb-3 md:mb-4 tracking-wide">
            Pourquoi Nous Choisir ?
          </h3>
          <p className="text-center text-text-secondary font-manrope text-sm md:text-lg mb-3 md:mb-4 max-w-3xl mx-auto">
            Des méthodes de self-défense éprouvées depuis des décennies
          </p>
          <p className="text-center text-primary font-manrope text-xs md:text-base mb-8 md:mb-16 max-w-3xl mx-auto">
            Organisme de formation professionnelle à vocation internationale
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">100% Légal</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Nos méthodes respectent les lois françaises sur la légitime défense</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Simple & Efficace</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Des techniques basées sur vos réflexes naturels. Nul besoin d'être sportif</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Pour Tous</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Hommes, femmes, enfants, seniors — chacun progresse à son rythme</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-base md:text-lg font-bold text-text-primary uppercase mb-1 md:mb-2">Réseau International</h5>
                <p className="text-text-secondary font-manrope text-xs md:text-sm">Plus de 40 pays, des clubs partout pour s'entraîner près de chez vous</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile First */}
      <section 
        className="py-12 md:py-20 px-4 md:px-6 relative" 
        style={{
          backgroundImage: `linear-gradient(rgba(11, 17, 32, 0.85), rgba(11, 17, 32, 0.9)), url('https://images.unsplash.com/photo-1644594570589-ef85bd03169f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxrcmF2JTIwbWFnYSUyMHRyYWluaW5nJTIwY2xhc3N8ZW58MHx8fHwxNzY1NzM2Njg0fDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="cta-section"
      >
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary uppercase mb-4 md:mb-6 tracking-wide">
            Rejoignez Notre Fédération Internationale
          </h3>
          <p className="text-sm md:text-lg text-text-secondary font-manrope mb-6 md:mb-10 leading-relaxed">
            Développez votre confiance, votre sécurité et vos capacités avec l'Académie Jacques Levinet
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="cta-button"
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-base md:text-lg tracking-wider leading-none rounded-sm transition-all w-full sm:w-auto"
            >
              Devenir Membre
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Mobile First */}
      <footer className="bg-paper py-10 md:py-16 px-4 md:px-6 border-t border-white/5" data-testid="footer">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <img 
                  src={logoUrl} 
                  alt="Logo Académie Jacques Levinet" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-oswald text-sm md:text-lg font-bold text-text-primary uppercase">Académie Jacques Levinet</h3>
                  <p className="text-[10px] md:text-xs text-text-muted">Depuis 1998</p>
                </div>
              </div>
              <p className="text-text-secondary font-manrope text-xs md:text-sm leading-relaxed hidden md:block">
                L'Académie Jacques Levinet forme l'élite de la self-défense mondiale depuis plus de 25 ans.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-6">Navigation</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/founder" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Le Fondateur</Link></li>
                <li><Link to="/about" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">À Propos</Link></li>
                <li><Link to="/pedagogy" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Pédagogie</Link></li>
              </ul>
            </div>

            {/* Disciplines */}
            <div>
              <h4 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-6">Disciplines</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/disciplines/wkmo" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">WKMO</Link></li>
                <li><Link to="/disciplines/ipc" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">IPC / ROS</Link></li>
                <li><Link to="/disciplines/spk" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Self-Pro Krav</Link></li>
                <li><Link to="/disciplines/canne" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Canne Défense</Link></li>
                <li><Link to="/disciplines/sfjl" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Self Féminine</Link></li>
              </ul>
            </div>

            {/* Média */}
            <div>
              <h4 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-6">Média</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="https://kravmag-ajl.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Krav Mag AJL</a></li>
                <li><a href="https://editions-ajl.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Éditions A.J.L.</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-6">Contact</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/international" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">Trouver un Club</Link></li>
                <li><Link to="/onboarding" className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">S'inscrire</Link></li>
                <li><a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-text-secondary hover:text-primary transition-colors font-manrope text-xs md:text-sm">{contactPhone}</a></li>
                <li><span className="text-text-secondary font-manrope text-xs md:text-sm">{contactAddress}</span></li>
              </ul>
            </div>

            {/* Réseaux Sociaux - Icônes horizontales */}
            <div>
              <h4 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-6">Suivez-nous</h4>
              <div className="flex items-center gap-4">
                {socialFacebook && (
                  <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title="Facebook">
                    <Facebook className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                )}
                {socialYoutube && (
                  <a href={socialYoutube} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title="YouTube">
                    <Youtube className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                )}
                {socialLinkedin && (
                  <a href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title="LinkedIn">
                    <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                )}
                {socialTwitter && (
                  <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title="X (Twitter)">
                    <Twitter className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-white/5 text-center">
            <p className="text-text-secondary font-oswald text-sm md:text-base uppercase tracking-wide mb-2">
              {footerTagline}
            </p>
            <p className="text-text-muted font-manrope text-xs md:text-sm">
              {footerCopyright}
            </p>
            <p className="text-text-muted/50 font-mono text-[10px] mt-2" title={`Build ID: ${BUILD_INFO.buildId}`}>
              v{BUILD_INFO.version} • Build: {BUILD_INFO.date} {BUILD_INFO.time}
            </p>
            <p className="text-text-muted/40 font-manrope text-[10px] mt-3">
              Site réalisé par <a href="https://coachdigitalparis.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GILLES KORZEC</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;