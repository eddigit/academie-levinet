import React, { useState } from 'react';
import { Calendar, MapPin, Phone, Euro, ChevronRight, X, ZoomIn } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const events = [
  {
    id: 1,
    title: 'Stage KRAVMAGA SPK',
    date: 'Dimanche 19 Avril 2026',
    location: 'Montpellier Ouest — Saint Jean de Védas',
    description: 'Stage de Krav Maga Self Pro Krav dirigé par le Capitaine Jacques Levinet, 10ème Dan. Ouvert à tous les niveaux.',
    contact: '06 98 07 08 51',
    image: 'https://res.cloudinary.com/dool0ngfx/image/upload/v1774535438/academie-levinet/events/viuffsdrwzw3hrk08nii.jpg',
    price: '50 €',
  },
  {
    id: 2,
    title: '1ère Édition Security and Self Defense (SSD)',
    date: '23 et 24 Mai 2026',
    location: 'Espace Jean Bernard — La Fare les Oliviers',
    description: 'Première édition du salon Security and Self Defense. Démonstrations, initiations et rencontres avec les experts de la self-défense.',
    contact: '07 82 97 69 29',
    image: 'https://res.cloudinary.com/dool0ngfx/image/upload/v1774535452/academie-levinet/events/qa7xgh9vwsypaw87nro8.jpg',
    price: '10 €',
  },
  {
    id: 3,
    title: 'Stage KRAVMAGA SPK',
    date: 'Samedi 14 Juin 2026',
    location: 'Montpellier Ouest — Saint Jean de Védas',
    description: 'Stage de Krav Maga Self Pro Krav dirigé par le Capitaine Jacques Levinet, 10ème Dan. Ouvert à tous les niveaux.',
    contact: '06 98 07 08 51',
    image: 'https://res.cloudinary.com/dool0ngfx/image/upload/v1774536954/academie-levinet/events/qryfjtlmpb58lvhuo2oa.jpg',
    price: '50 €',
  },
];

// Lightbox pour voir l'affiche en grand
const ImageLightbox = ({ image, title, onClose }) => (
  <div 
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 cursor-pointer"
    onClick={onClose}
  >
    <button 
      onClick={onClose}
      className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 z-10"
    >
      <X className="w-8 h-8" />
    </button>
    <img
      src={image}
      alt={title}
      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EventCard = ({ event, onImageClick }) => (
  <div className="bg-paper border border-white/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group">
    {event.image ? (
      <div 
        className="aspect-[16/10] overflow-hidden relative cursor-pointer"
        onClick={() => onImageClick(event.image, event.title)}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    ) : (
      <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Calendar className="w-16 h-16 text-primary/40" />
      </div>
    )}
    <div className="p-6">
      <h3 className="font-oswald text-xl md:text-2xl font-bold text-text-primary uppercase mb-4">
        {event.title}
      </h3>
      <p className="text-text-secondary font-manrope mb-4 leading-relaxed">
        {event.description}
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="font-manrope text-sm font-semibold">{event.date}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="font-manrope text-sm">{event.location}</span>
        </div>
        {event.price && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Euro className="w-4 h-4 flex-shrink-0" />
            <span className="font-manrope text-sm">Tarif : {event.price}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-text-secondary">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span className="font-manrope text-sm">Contact : {event.contact}</span>
        </div>
      </div>
    </div>
  </div>
);

const PublicEventsPage = () => {
  const [lightbox, setLightbox] = useState(null);

  return (
    <PublicLayout>
      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox 
          image={lightbox.image} 
          title={lightbox.title} 
          onClose={() => setLightbox(null)} 
        />
      )}

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-background via-background to-paper">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-primary font-oswald text-sm uppercase tracking-wider">Calendrier</span>
          </div>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold text-text-primary uppercase mb-4 tracking-tight">
            <span className="text-primary">Événements</span> & Stages
          </h1>
          <p className="text-xl text-text-secondary font-manrope max-w-2xl mx-auto">
            Retrouvez tous les stages, séminaires et manifestations de l'Académie Jacques Levinet
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-paper">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onImageClick={(image, title) => setLightbox({ image, title })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-primary uppercase mb-4">
            Vous souhaitez participer ?
          </h2>
          <p className="text-text-secondary font-manrope mb-8 max-w-xl mx-auto">
            Contactez-nous pour réserver votre place ou obtenir plus d'informations sur nos prochains événements.
          </p>
          <a
            href="mailto:contact@academielevinet.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            Nous Contacter
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </a>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicEventsPage;
