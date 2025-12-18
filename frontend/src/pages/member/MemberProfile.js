import React, { useState, useEffect } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Mail, Phone, MapPin, Calendar, Award, Edit, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Belt colors
const beltColors = {
  'Ceinture Blanche': { accent: '#E5E7EB', badgeBg: '#E5E7EB', badgeText: '#1F2937' },
  'Ceinture Jaune': { accent: '#FBBF24', badgeBg: '#FBBF24', badgeText: '#1F2937' },
  'Ceinture Orange': { accent: '#F97316', badgeBg: '#F97316', badgeText: '#FFFFFF' },
  'Ceinture Verte': { accent: '#22C55E', badgeBg: '#22C55E', badgeText: '#FFFFFF' },
  'Ceinture Bleue': { accent: '#3B82F6', badgeBg: '#3B82F6', badgeText: '#FFFFFF' },
  'Ceinture Marron': { accent: '#B45309', badgeBg: '#B45309', badgeText: '#FFFFFF' },
  'Ceinture Noire': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
};

const MemberProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    first_name: 'Jean',
    last_name: 'Dupont',
    email: user?.email || 'jean.dupont@academie-levinet.com',
    phone: '+33 6 12 34 56 78',
    date_of_birth: '1990-01-15',
    city: 'Paris',
    country: 'France',
    belt_grade: 'Ceinture Orange',
    membership_type: 'Premium',
    membership_start_date: '2024-06-01',
    membership_end_date: '2025-06-01',
    membership_status: 'Actif'
  });

  const beltStyle = beltColors[profile.belt_grade] || beltColors['Ceinture Blanche'];

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
            Mon Profil
          </h1>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" strokeWidth={1.5} />
            Modifier
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-paper rounded-xl border border-white/5 overflow-hidden">
              {/* Photo Section with Belt Color */}
              <div 
                className="relative h-48 flex items-center justify-center"
                style={{ background: `radial-gradient(circle at center, ${beltStyle.accent}40 0%, ${beltStyle.accent}20 30%, transparent 70%)` }}
              >
                {/* Concentric circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-2 opacity-20" style={{ borderColor: beltStyle.accent }}></div>
                  <div className="absolute w-32 h-32 rounded-full border-2 opacity-30" style={{ borderColor: beltStyle.accent }}></div>
                </div>
                
                {/* Photo */}
                <div 
                  className="relative z-10 w-28 h-28 rounded-xl overflow-hidden border-4 shadow-xl"
                  style={{ borderColor: beltStyle.accent }}
                >
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-4xl font-oswald font-bold text-white">
                      {profile.first_name[0]}{profile.last_name[0]}
                    </span>
                  </div>
                </div>
                
                {/* Camera button */}
                <button className="absolute bottom-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                </button>
              </div>
              
              {/* Name and Grade */}
              <div className="p-4 text-center">
                <h2 className="font-oswald text-2xl text-text-primary">
                  {profile.first_name} {profile.last_name}
                </h2>
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-3"
                  style={{ backgroundColor: beltStyle.badgeBg, color: beltStyle.badgeText }}
                >
                  <Award className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-oswald uppercase text-sm font-bold">{profile.belt_grade}</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 border-t border-white/5">
                <div className="text-center">
                  <p className="font-oswald text-2xl text-primary">45</p>
                  <p className="text-xs text-text-muted">Cours suivis</p>
                </div>
                <div className="text-center">
                  <p className="font-oswald text-2xl text-accent">6</p>
                  <p className="text-xs text-text-muted">Mois</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-xl text-text-primary uppercase mb-6">Informations Personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Prénom</label>
                  <p className="text-lg text-text-primary font-manrope mt-1">{profile.first_name}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Nom</label>
                  <p className="text-lg text-text-primary font-manrope mt-1">{profile.last_name}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Email</label>
                  <p className="text-lg text-text-primary font-manrope mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Téléphone</label>
                  <p className="text-lg text-text-primary font-manrope mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {profile.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Date de naissance</label>
                  <p className="text-lg text-text-primary font-manrope mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {profile.date_of_birth}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Localisation</label>
                  <p className="text-lg text-text-primary font-manrope mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {profile.city}, {profile.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Membership */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-oswald text-xl text-text-primary uppercase">Mon Adhésion</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {profile.membership_status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Type</label>
                  <p className="text-lg text-text-primary font-manrope mt-1">{profile.membership_type}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Début</label>
                  <p className="text-lg text-text-primary font-manrope mt-1">{profile.membership_start_date}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-manrope uppercase tracking-wide">Fin</label>
                  <p className="text-lg text-text-primary font-manrope mt-1">{profile.membership_end_date}</p>
                </div>
              </div>
              
              <Button className="mt-6 bg-primary hover:bg-primary-dark">
                Renouveler mon adhésion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
