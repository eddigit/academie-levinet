import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Globe, Video, CheckCircle, Target, Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
              alt="Logo" 
              className="w-12 h-12"
              data-testid="header-logo"
            />
            <div>
              <h1 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide">
                Académie Jacques Levinet
              </h1>
              <p className="text-xs text-text-secondary font-manrope">Self-Pro Krav</p>
            </div>
          </div>
          <Link 
            to="/login" 
            data-testid="header-login-button"
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider rounded-sm transition-smooth glow-effect"
          >
            Connexion
          </Link>
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
          <h2 className="font-oswald text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary uppercase mb-6 tracking-wide drop-shadow-2xl">
            La Self-Défense Efficace, Réaliste et Sécurisée
          </h2>
          <p className="text-xl md:text-2xl text-text-secondary font-manrope mb-8 leading-relaxed drop-shadow-lg">
            Validée par l'Expérience d'Élite du Capitaine Jacques Levinet
          </p>
          <p className="text-lg md:text-xl text-text-primary/90 font-manrope mb-12 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
            Champion du Monde de Karaté · Capitaine de Gendarmerie · Méthode SPK Brevetée
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="hero-cta-button"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-lg tracking-wider rounded-sm transition-smooth glow-effect"
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
            Les 3 Piliers du SPK
          </h3>
          <p className="text-center text-text-secondary font-manrope text-lg mb-16 max-w-3xl mx-auto">
            Self-Pro Krav : L'évolution responsable du Krav Maga, conçue pour tous
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="stat-card text-center" data-testid="feature-card-legitimite">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Légitimité & Expertise</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Héritage du Capitaine Jacques Levinet, Champion du Monde de Karaté
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Méthode éprouvée et reconnue mondialement (WKMO, IPC)
              </p>
            </div>

            <div className="stat-card text-center" data-testid="feature-card-securite">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Sécurité & Éthique</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Évolution responsable du Krav Maga avec des "garde-fous" éthiques
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Une pratique sûre basée sur l'instinct de survie
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

      {/* Audiences Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-16 tracking-wide">
            Pour Qui ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="stat-card hover:scale-105 transition-transform duration-300">
              <Users className="w-12 h-12 text-accent mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Grand Public</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                Hommes, femmes, enfants : développez votre confiance et votre sécurité personnelle
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Techniques efficaces et réalistes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Discipline et respect</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Gestion des conflits</li>
              </ul>
            </div>

            <div className="stat-card hover:scale-105 transition-transform duration-300">
              <Shield className="w-12 h-12 text-secondary mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Self-Défense Féminine</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                SFJL : Reprenez le contrôle de votre sécurité avec empowerment
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Scénarios réalistes adaptés</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Confiance en soi</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Sans agressivité excessive</li>
              </ul>
            </div>

            <div className="stat-card hover:scale-105 transition-transform duration-300">
              <Globe className="w-12 h-12 text-primary mb-4" strokeWidth={1} />
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Professionnels</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                IPC/ROS : Formation opérationnelle pour forces de l'ordre
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Validé par unités d'élite (ERIS, Spetsnaz)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Expertise terrain</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> Excellence opérationnelle</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mapmonde - Communauté Mondiale */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-wide">
            Présence Mondiale
          </h3>
          <p className="text-center text-text-secondary font-manrope text-lg mb-12 max-w-3xl mx-auto">
            L'Académie Jacques Levinet est représentée sur tous les continents avec des directeurs techniques et clubs affiliés
          </p>
          <div className="max-w-6xl mx-auto">
            <img 
              src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/arc2qkzs_AJL-WKMO-IPC-WORLDWIDE-NETWORK-2048x1120.jpg"
              alt="Réseau mondial de l'Académie Jacques Levinet"
              className="w-full rounded-lg border border-white/10"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">50+</p>
              <p className="text-text-secondary font-manrope text-sm">Pays</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">200+</p>
              <p className="text-text-secondary font-manrope text-sm">Directeurs Techniques</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">500+</p>
              <p className="text-text-secondary font-manrope text-sm">Clubs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-oswald font-bold text-primary mb-2">50K+</p>
              <p className="text-text-secondary font-manrope text-sm">Membres</p>
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
                  Accédez à une bibliothèque complète de cours vidéo pour vous former où que vous soyez, à votre rythme.
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
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-primary" strokeWidth={1} />
                  </div>
                  <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-4">E-Learning SPK</h4>
                  <p className="text-text-secondary font-manrope mb-6">
                    Rejoignez des milliers d'élèves qui se forment en ligne
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-oswald font-bold text-primary">100+</p>
                      <p className="text-xs text-text-muted font-manrope">Cours Vidéo</p>
                    </div>
                    <div>
                      <p className="text-3xl font-oswald font-bold text-primary">24/7</p>
                      <p className="text-xs text-text-muted font-manrope">Accès Illimité</p>
                    </div>
                  </div>
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
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-secondary" strokeWidth={1} />
                </div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Empowerment</h5>
                <p className="text-text-secondary font-manrope text-sm">Développez votre confiance et votre force intérieure</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-7 h-7 text-accent" strokeWidth={1} />
                </div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Scénarios Réalistes</h5>
                <p className="text-text-secondary font-manrope text-sm">Techniques adaptées aux situations réelles</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-primary" strokeWidth={1} />
                </div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Sans Agressivité</h5>
                <p className="text-text-secondary font-manrope text-sm">Pratique sûre et respectueuse</p>
              </div>
            </div>
            <p className="text-lg text-text-primary/90 font-manrope mb-8 max-w-2xl mx-auto">
              <strong>Dans un contexte où la sécurité personnelle est plus importante que jamais</strong>, 
              le programme SFJL vous donne les outils pour vous défendre efficacement tout en respectant votre bien-être.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h3 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-8 tracking-wide">
            Pourquoi Choisir le SPK ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Méthode Brevetée</h5>
                <p className="text-text-secondary font-manrope text-sm">SPK - Self Pro Krav, validé et reconnu internationalement</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Efficacité Réaliste</h5>
                <p className="text-text-secondary font-manrope text-sm">Basé sur l'instinct de survie et les réflexes innés</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Pratique Sécurisée</h5>
                <p className="text-text-secondary font-manrope text-sm">Garde-fous éthiques pour une formation responsable</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Communauté Mondiale</h5>
                <p className="text-text-secondary font-manrope text-sm">Réseau international de directeurs techniques</p>
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
            Maîtrisez l'Autodéfense la Plus Réaliste au Monde
          </h3>
          <p className="text-lg text-text-secondary font-manrope mb-10 leading-relaxed">
            Rejoignez l'Académie Jacques Levinet et développez votre confiance, votre sécurité et vos capacités
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/onboarding" 
              data-testid="cta-button"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase text-lg tracking-wider rounded-sm transition-smooth glow-effect"
            >
              Devenir Membre
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper py-8 px-6 border-t border-white/5" data-testid="footer">
        <div className="container mx-auto text-center">
          <p className="text-text-secondary font-manrope">
            © 2025 Académie Jacques Levinet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;