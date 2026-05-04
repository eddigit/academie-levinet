import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Phone, Euro, ChevronRight, X, ZoomIn, Loader2 } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const CONTACT_PHONE = '06 98 07 08 51';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAYS_FR = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

const parseDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDateRange = (startIso, endIso) => {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  if (!start) return '';
  const sameDay = !end || start.getTime() === end.getTime();
  if (sameDay) {
    return `${WEEKDAYS_FR[start.getDay()]} ${start.getDate()} ${MONTHS_FR[start.getMonth()]} ${start.getFullYear()}`;
  }
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()} et ${end.getDate()} ${MONTHS_FR[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_FR[start.getMonth()]} → ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined || Number(price) === 0) return null;
  return `${Number(price).toFixed(0)} €`;
};

const ImageLightbox = ({ image, title, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 cursor-pointer"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 z-10"
      aria-label="Fermer"
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

const EventCard = ({ event, onImageClick }) => {
  const dateLabel = formatDateRange(event.start_date, event.end_date);
  const cityCountry = [event.city, event.country].filter(Boolean).join(', ');
  const locationLabel = event.location && cityCountry
    ? `${event.location} — ${cityCountry}`
    : (event.location || cityCountry);
  const priceLabel = formatPrice(event.price);

  return (
    <div className="bg-paper border border-white/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group">
      {event.image_url ? (
        <div
          className="aspect-[16/10] overflow-hidden relative cursor-pointer"
          onClick={() => onImageClick(event.image_url, event.title)}
        >
          <img
            src={event.image_url}
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
        {event.description && (
          <p className="text-text-secondary font-manrope mb-4 leading-relaxed">
            {event.description}
          </p>
        )}
        <div className="space-y-2">
          {dateLabel && (
            <div className="flex items-center gap-2 text-primary">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="font-manrope text-sm font-semibold">{dateLabel}</span>
            </div>
          )}
          {locationLabel && (
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="font-manrope text-sm">{locationLabel}</span>
            </div>
          )}
          {priceLabel && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Euro className="w-4 h-4 flex-shrink-0" />
              <span className="font-manrope text-sm">Tarif : {priceLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-text-secondary">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="font-manrope text-sm">Contact : {CONTACT_PHONE}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicEventsPage = () => {
  const [lightbox, setLightbox] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/events?limit=100');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((e) => {
            const end = parseDate(e.end_date) || parseDate(e.start_date);
            return end ? end.getTime() >= today.getTime() : true;
          })
          .sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
        setEvents(upcoming);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <PublicLayout>
      {lightbox && (
        <ImageLightbox
          image={lightbox.image}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}

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

      <section className="py-16 bg-paper">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <span className="font-manrope">Chargement des événements...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-text-secondary font-manrope">
              <p>Impossible de charger les événements pour le moment.</p>
              <p className="text-sm text-text-muted mt-2">Merci de réessayer dans quelques instants.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2">
                Prochain événement bientôt annoncé
              </h2>
              <p className="text-text-secondary font-manrope max-w-xl mx-auto">
                Aucun événement n'est programmé pour le moment. Revenez prochainement ou contactez-nous pour être informé des prochaines dates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onImageClick={(image, title) => setLightbox({ image, title })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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
