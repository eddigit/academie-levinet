import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { Globe, Users, MapPin, Star, ChevronRight, Newspaper, Loader2 } from 'lucide-react';
import api from '../utils/api';

const InternationalPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/site-content');
        const data = response.data || response;
        setContent(data.international || {});
      } catch (error) {
        console.error('Error fetching international content:', error);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Valeurs dynamiques avec fallbacks
  const internationalTitle = content?.title || 'Présence Internationale';
  const internationalSubtitle = content?.subtitle || "L'Académie Jacques Levinet est représentée sur tous les continents avec des directeurs techniques et clubs affiliés dans plus de 50 pays.";
  const magazineName = content?.magazine_name || 'KRAV MAG AJL';
  const magazineSubtitle = content?.magazine_subtitle || 'Magazine International';
  const mapImage = content?.map_image;

  const stats = [
    { value: '50+', label: 'Pays' },
    { value: '50', label: 'Directeurs Techniques' },
    { value: '100+', label: 'Clubs Affiliés' },
    { value: '10K+', label: 'Membres' },
  ];

  const eliteUnits = [
    { name: 'OMON', country: 'Russie', flag: '🇷🇺' },
    { name: 'BOPE', country: 'Brésil', flag: '🇧🇷' },
    { name: 'ROTAM', country: 'Brésil', flag: '🇧🇷' },
    { name: 'ERIS', country: 'France', flag: '🇫🇷' },
    { name: 'GAD', country: 'Argentine', flag: '🇦🇷' },
    { name: 'OSTTU', country: 'Australie', flag: '🇦🇺' },
  ];

  const regions = [
    { name: 'Europe', countries: 'France, Espagne, Italie, Portugal, Belgique, Suisse...' },
    { name: 'Amériques', countries: 'Brésil, Argentine, USA, Canada, Mexique...' },
    { name: 'Asie', countries: 'Japon, Corée, Inde, Israël, Vietnam...' },
    { name: 'Afrique', countries: 'Maroc, Tunisie, Sénégal, Côte d\'Ivoire...' },
    { name: 'Océanie', countries: 'Australie, Nouvelle-Zélande...' },
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-6">
            <span className="text-primary font-oswald text-sm uppercase tracking-wider">Réseau Mondial</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-6xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            <span className="text-primary">{internationalTitle}</span>
          </h1>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            {internationalSubtitle}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="font-oswald text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-text-secondary font-manrope">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Notre <span className="text-primary">Réseau</span>
          </h2>
          
          <div className="mb-12">
            <div className="w-full h-[500px] rounded-lg border border-white/10 overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/d/embed?mid=1RdKNrRv4jEPjQTr7BDBCpXuuYAs&ll=-0.1073627811302309%2C0&z=2"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Réseau mondial de l'Académie Jacques Levinet"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  <h3 className="font-oswald text-xl text-white uppercase">{region.name}</h3>
                </div>
                <p className="text-text-muted font-manrope text-sm">{region.countries}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Structure <span className="text-primary">Hiérarchique</span>
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-oswald text-xl text-white uppercase">Siège International</h3>
                  <p className="text-text-muted font-manrope">France — Direction générale et Commission des Grades</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 ml-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-oswald text-xl text-white uppercase">Directions Nationales</h3>
                  <p className="text-text-muted font-manrope">Représentants officiels dans chaque pays</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 ml-16">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-oswald text-xl text-white uppercase">Directions Régionales</h3>
                  <p className="text-text-muted font-manrope">Coordination locale et développement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Units Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-tight">
            Partenaires <span className="text-primary">Élite</span>
          </h2>
          <p className="text-center text-text-secondary font-manrope mb-12">
            Collaborations avec les unités les plus prestigieuses au monde.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {eliteUnits.map((unit, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <span className="text-4xl mb-2 block">{unit.flag}</span>
                <h4 className="font-oswald text-lg text-white uppercase">{unit.name}</h4>
                <p className="text-text-muted font-manrope text-xs">{unit.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-oswald text-3xl text-white uppercase mb-2">{magazineName}</h3>
                <p className="font-oswald text-lg text-primary uppercase tracking-wide mb-4">
                  {magazineSubtitle}
                </p>
                <p className="text-text-secondary font-manrope mb-4">
                  Le magazine du monde de la self-défense, des sports de combat et des arts martiaux. 
                  Publication trimestrielle diffusée en version numérique et papier haute qualité.
                </p>
                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div>
                    <p className="font-oswald text-2xl text-primary">50+</p>
                    <p className="text-text-muted font-manrope text-sm">Pays</p>
                  </div>
                  <div>
                    <p className="font-oswald text-2xl text-primary">3</p>
                    <p className="text-text-muted font-manrope text-sm">Langues</p>
                  </div>
                  <div>
                    <p className="font-oswald text-2xl text-primary">4/an</p>
                    <p className="text-text-muted font-manrope text-sm">Éditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Rejoignez le Réseau
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Trouvez un club près de chez vous ou devenez représentant dans votre région.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Devenir Membre
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/onboarding"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Trouver un Club
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default InternationalPage;