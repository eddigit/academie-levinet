import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, Globe } from 'lucide-react';

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
              to="/login" 
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
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Légitimité & Expertise</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Héritage du Capitaine Jacques Levinet, Champion du Monde de Karaté
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Méthode éprouvée et reconnue mondialement (WKMO, IPC)
              </p>
            </div>

            <div className="stat-card text-center" data-testid="feature-card-securite">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="font-oswald text-xl font-bold text-text-primary uppercase mb-3">Sécurité & Éthique</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-3">
                Évolution responsable du Krav Maga avec des "garde-fous" éthiques
              </p>
              <p className="text-text-muted font-manrope text-sm">
                Une pratique sûre basée sur l'instinct de survie
              </p>
            </div>

            <div className="stat-card text-center" data-testid="feature-card-accessibilite">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-glow rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Grand Public</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                Hommes, femmes, enfants : développez votre confiance et votre sécurité personnelle
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li>✓ Techniques efficaces et réalistes</li>
                <li>✓ Discipline et respect</li>
                <li>✓ Gestion des conflits</li>
              </ul>
            </div>

            <div className="stat-card hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Self-Défense Féminine</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                SFJL : Reprenez le contrôle de votre sécurité avec empowerment
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li>✓ Scénarios réalistes adaptés</li>
                <li>✓ Confiance en soi</li>
                <li>✓ Sans agressivité excessive</li>
              </ul>
            </div>

            <div className="stat-card hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-3">Professionnels</h4>
              <p className="text-text-secondary font-manrope leading-relaxed mb-4">
                IPC/ROS : Formation opérationnelle pour forces de l'ordre
              </p>
              <ul className="text-left space-y-2 text-text-muted font-manrope text-sm">
                <li>✓ Validé par unités d'élite (ERIS, Spetsnaz)</li>
                <li>✓ Expertise terrain</li>
                <li>✓ Excellence opérationnelle</li>
              </ul>
            </div>
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
              <div className="text-primary text-3xl">✓</div>
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Méthode Brevetée</h5>
                <p className="text-text-secondary font-manrope text-sm">SPK - Self Pro Krav, validé et reconnu internationalement</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <div className="text-primary text-3xl">✓</div>
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Efficacité Réaliste</h5>
                <p className="text-text-secondary font-manrope text-sm">Basé sur l'instinct de survie et les réflexes innés</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <div className="text-primary text-3xl">✓</div>
              <div>
                <h5 className="font-oswald text-lg font-bold text-text-primary uppercase mb-2">Pratique Sécurisée</h5>
                <p className="text-text-secondary font-manrope text-sm">Garde-fous éthiques pour une formation responsable</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-background/50 rounded-lg border border-white/5">
              <div className="text-primary text-3xl">✓</div>
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
              to="/login" 
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