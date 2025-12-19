import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Globe, Video, CheckCircle, Target, Sparkles } from 'lucide-react';
import MegaMenu from '../components/MegaMenu';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
              alt="Logo Académie Jacques Levinet" 
              className="w-12 h-12 rounded-full object-cover"
              data-testid="header-logo"
            />
            <div>
              <h1 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide">
                Académie Jacques Levinet
              </h1>
              <p className="text-xs text-text-secondary font-manrope">École Internationale de Self-Défense</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <MegaMenu />
            <Link 
              to="/login" 
              data-testid="header-login-button"
              className="flex items-center justify-center px-6 py-3 h-11 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider leading-none rounded-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 px-6 relative overflow-hidden" 
        data-testid="hero-section"
      >
        {/* YouTube Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh]"
            style={{
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
            src="https://www.youtube.com/embed/mX3cGUHUgKo?autoplay=1&mute=1&loop=1&playlist=mX3cGUHUgKo&controls=0&showinfo=0&modestbranding=1&rel=0&enablejsapi=1&playsinline=1"
            title="Académie Jacques Levinet Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h2 className="font-oswald text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary uppercase mb-10 tracking-wide drop-shadow-2xl leading-tight">
            La Self-Défense Efficace,<br />Réaliste et Sécurisée
          </h2>
          <p className="text-xl md:text-2xl text-text-secondary font-manrope mb-8 leading-relaxed drop-shadow-lg">
            Validée par l'Expérience d'Élite du Capitaine Jacques Levinet
          </p>
          <p className="text-lg md:text-xl text-text-primary/90 font-manrope mb-12 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
            Méthode brevetée par l'ex-capitaine de police et champion de France de karaté.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="hero-cta-button"
              className="flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-lg tracking-wider leading-none rounded-sm transition-smooth glow-effect"
            >
              Rejoindre l'Académie
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Les 3 Piliers */}
      <section className="py-20 px-6 bg-paper" data-testid="features-section">
        <div className="container mx-auto">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-wide">
            Les 3 Piliers de Nos Méthodes
          </h3>
          <p className="text-center text-text-secondary font-manrope text-lg mb-2 max-w-3xl mx-auto">
            Krav Maga Self-Défense - Canne Défense - Bâton Défense - Self-Défense Femmes - Self-Défense Enfants
          </p>
          <p className="text-center text-primary font-manrope text-base mb-16 max-w-3xl mx-auto">
            Pour les professionnels de la sécurité et Forces de l'ordre : Real Operational System
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="stat-card text-center" data-testid="feature-card-legitimite">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Légitimité & Expertise</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Héritage du Capitaine Jacques Levinet, Champion de France de Karaté
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Méthode éprouvée et reconnue mondialement (WKMO, IPC)
              </p>
            </div>

            <div className="stat-card text-center" data-testid="feature-card-securite">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Sécurité & Éthique</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Respect de la légitime défense
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Une pratique simple basée sur l'instinct de survie et réflexes
              </p>
            </div>

            <div className="stat-card text-center" data-testid="feature-card-accessibilite">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Accessibilité & Communauté</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Conçue pour tous : hommes, femmes, enfants
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Esprit familial avec présence internationale forte
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section - Obsidian Glass Design */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto">
          <div className="mb-16 max-w-3xl">
            <h3 className="font-oswald text-5xl md:text-6xl font-bold uppercase tracking-tight text-text-primary mb-4">
              Pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Qui ?</span>
            </h3>
            <div className="h-1 w-24 bg-accent mb-6" />
            <p className="font-manrope text-lg text-text-secondary">
              L'Académie Jacques Levinet, organisme de formation, propose des parcours adaptés à chaque profil, du débutant au professionnel aguerri.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Adultes & Enfants Card - Kinetic Shutter Design */}
            <div 
              className="group relative h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:border-accent/50"
              data-testid="audience-card-public"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/m50t9hgn_Grand%20Public%20Card.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-12 bg-accent mb-4 transition-all duration-500 group-hover:w-24" />
                  <h4 className="font-oswald text-3xl font-bold uppercase tracking-tight text-white mb-3 drop-shadow-lg">
                    Krav Maga Self-Défense
                  </h4>
                  <p className="font-manrope text-base text-gray-300 mb-6 opacity-90 max-w-xs">
                    Apprenez à vous défendre avec notre méthode Self-Pro Krav, adaptée à tous
                  </p>
                  <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-sm font-bold uppercase tracking-wider text-accent">Je veux apprendre</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Les Femmes Card - Kinetic Shutter Design */}
            <div 
              className="group relative h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20 hover:border-secondary/50"
              data-testid="audience-card-women"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/mbtzqqpj_Self-D%C3%A9fense%20F%C3%A9minine.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-12 bg-secondary mb-4 transition-all duration-500 group-hover:w-24" />
                  <h4 className="font-oswald text-3xl font-bold uppercase tracking-tight text-white mb-3 drop-shadow-lg">
                    Pour les Femmes
                  </h4>
                  <p className="font-manrope text-base text-gray-300 mb-6 opacity-90 max-w-xs">
                    Apprenez à vous défendre avec des gestes simples. On est là pour vous aider.
                  </p>
                  <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-sm font-bold uppercase tracking-wider text-secondary">Je veux apprendre</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Forces de Sécurité Card - Kinetic Shutter Design */}
            <div 
              className="group relative h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50"
              data-testid="audience-card-pro"
            >
              <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: 'url(https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/vjnvljgu_Professionnels%20Card.jpeg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="h-1 w-12 bg-primary mb-4 transition-all duration-500 group-hover:w-24" />
                  <h4 className="font-oswald text-3xl font-bold uppercase tracking-tight text-white mb-3 drop-shadow-lg">
                    Forces de Sécurité
                  </h4>
                  <p className="font-manrope text-base text-gray-300 mb-6 opacity-90 max-w-xs">
                    Formation opérationnelle pour les forces de l'ordre et les agents de sécurité
                  </p>
                  <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-oswald text-sm font-bold uppercase tracking-wider text-primary">Formation Pro</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapmonde - Communauté Mondiale */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-wide">
            Communauté Mondiale
          </h3>
          <p className="text-center text-text-secondary font-manrope text-lg mb-12 max-w-3xl mx-auto">
            Un réseau mondial pour s'entraîner partout - Découvrez tous nos clubs et membres
          </p>
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full rounded-lg border border-white/10 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.google.com/maps/d/u/0/embed?mid=1RdKNrRv4jEPjQTr7BDBCpXuuYAs&ll=-0.10736278113021733%2C0&z=2"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte mondiale des clubs de l'Académie Jacques Levinet"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">40+</p>
              <p className="text-text-secondary font-manrope text-sm">Pays</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">40</p>
              <p className="text-text-secondary font-manrope text-sm">Directeurs Techniques</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">500+</p>
              <p className="text-text-secondary font-manrope text-sm">Clubs et Membres</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">50 ans</p>
              <p className="text-text-secondary font-manrope text-sm">d'Expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cours en Ligne */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                  Formations en Ligne
                </h3>
                <p className="text-text-secondary font-manrope text-lg mb-6 leading-relaxed">
                  Accédez à une bibliothèque complète de cours vidéo et cahiers techniques pour vous former où que vous soyez, à votre rythme.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-1">Cours Vidéo HD</h5>
                      <p className="text-text-secondary font-manrope text-sm">Techniques détaillées filmées sous tous les angles</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-1">Programmes Structurés</h5>
                      <p className="text-text-secondary font-manrope text-sm">Progressions adaptées à chaque niveau</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-1">Manuels Numériques</h5>
                      <p className="text-text-secondary font-manrope text-sm">Support papier et vidéo téléchargeables</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="stat-card p-8 text-center">
                  <Video className="w-16 h-16 text-primary mx-auto mb-4" strokeWidth={1} />
                  <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-4">E-Learning Self Défense</h4>
                  <p className="text-text-secondary font-manrope mb-6">
                    Rejoignez des centaines d'élèves qui se forment en ligne
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-oswald font-bold text-primary">50+</p>
                      <p className="text-xs text-text-muted font-manrope">Cours Vidéo</p>
                    </div>
                    <div>
                      <p className="text-3xl font-oswald font-bold text-primary">24/7</p>
                      <p className="text-xs text-text-muted font-manrope">Accès Illimité</p>
                    </div>
                  </div>
                  <Link 
                    to="/onboarding"
                    className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider leading-none rounded-sm transition-all"
                  >
                    Apprendre en Ligne
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encart Défense Féminine */}
      <section className="py-20 px-6 bg-gradient-to-br from-secondary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-6">
              <span className="text-secondary font-oswald text-sm uppercase tracking-wide">Spécial Femmes</span>
            </div>
            <h3 className="font-oswald text-5xl font-bold text-text-primary uppercase mb-6 tracking-wide">
              Self-Défense Féminine
            </h3>
            <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed">
              Reprenez le Contrôle de Votre Sécurité
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
                <Sparkles className="w-12 h-12 text-secondary mx-auto mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Empowerment</h5>
                <p className="text-text-secondary font-manrope text-sm">Développez votre confiance et votre force intérieure</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
                <Target className="w-12 h-12 text-accent mx-auto mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Scénarios Réalistes</h5>
                <p className="text-text-secondary font-manrope text-sm">Techniques adaptées aux situations réelles</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" strokeWidth={1} />
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Sans Agressivité</h5>
                <p className="text-text-secondary font-manrope text-sm">Pratique sûre et respectueuse des lois</p>
              </div>
            </div>
            <p className="text-lg text-text-primary/90 font-manrope mb-8 max-w-2xl mx-auto">
              <strong>Dans un contexte où la sécurité personnelle est plus importante que jamais</strong>, 
              notre programme vous donne les outils pour vous défendre efficacement contre toutes formes de violences.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-wide">
            Pourquoi Nous Choisir ?
          </h3>
          <p className="text-center text-text-secondary font-manrope text-lg mb-4 max-w-3xl mx-auto">
            Une méthode de self-défense éprouvée depuis des décennies
          </p>
          <p className="text-center text-primary font-manrope text-base mb-16 max-w-3xl mx-auto">
            Organisme de formation professionnelle à reconnaissance internationale
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">100% Légal</h5>
                <p className="text-text-secondary font-manrope text-sm">Notre méthode Self-Pro Krav respecte les lois françaises sur la légitime défense</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Simple & Efficace</h5>
                <p className="text-text-secondary font-manrope text-sm">Des techniques basées sur vos réflexes naturels, pas besoin d'être sportif</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Pour Tous</h5>
                <p className="text-text-secondary font-manrope text-sm">Hommes, femmes, enfants — chacun progresse à son rythme</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Réseau International</h5>
                <p className="text-text-secondary font-manrope text-sm">Plus de 40 pays, des clubs partout pour s'entraîner près de chez vous</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 px-6 relative" 
        style={{
          backgroundImage: `linear-gradient(rgba(11, 17, 32, 0.85), rgba(11, 17, 32, 0.9)), url('https://images.unsplash.com/photo-1644594570589-ef85bd03169f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxrcmF2JTIwbWFnYSUyMHRyYWluaW5nJTIwY2xhc3N8ZW58MHx8fHwxNzY1NzM2Njg0fDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="cta-section"
      >
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="font-oswald text-4xl md:text-5xl font-bold text-text-primary uppercase mb-6 tracking-wide">
            Rejoignez Notre Fédération Internationale
          </h3>
          <p className="text-lg text-text-secondary font-manrope mb-10 leading-relaxed">
            Développez votre confiance, votre sécurité et vos capacités avec l'Académie Jacques Levinet
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="cta-button"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-lg tracking-wider leading-none rounded-sm transition-smooth glow-effect"
            >
              Devenir Membre
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper py-16 px-6 border-t border-white/5" data-testid="footer">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
                  alt="Logo Académie Jacques Levinet" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-oswald text-lg font-bold text-text-primary uppercase">Académie Jacques Levinet</h3>
                  <p className="text-xs text-text-muted">Depuis 1998</p>
                </div>
              </div>
              <p className="text-text-secondary font-manrope text-sm leading-relaxed">
                L'Académie Jacques Levinet forme l'élite de la self-défense mondiale depuis plus de 25 ans.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Navigation</h4>
              <ul className="space-y-3">
                <li><Link to="/founder" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Le Fondateur</Link></li>
                <li><Link to="/about" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">À Propos</Link></li>
                <li><Link to="/disciplines/spk" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Self-Pro Krav</Link></li>
                <li><Link to="/pedagogy" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Pédagogie</Link></li>
              </ul>
            </div>

            {/* Disciplines */}
            <div>
              <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Nos Disciplines</h4>
              <ul className="space-y-3">
                <li><Link to="/disciplines/spk" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Krav Maga Self-Défense</Link></li>
                <li><Link to="/disciplines/canne" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Canne Défense</Link></li>
                <li><Link to="/disciplines/baton" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Bâton Défense</Link></li>
                <li><Link to="/disciplines/enfants" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Self-Défense Enfants</Link></li>
                <li><Link to="/disciplines/sfjl" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Self-Défense Femmes</Link></li>
                <li><Link to="/disciplines/ipc" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Real Operational System</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Rejoindre</h4>
              <ul className="space-y-3">
                <li><Link to="/join" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Devenir Membre</Link></li>
                <li><Link to="/onboarding" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">S'inscrire</Link></li>
                <li><Link to="/international" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Trouver un Club</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-text-muted font-manrope text-sm">
              © 2025 Académie Jacques Levinet. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;