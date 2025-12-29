import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Search, Users, Building2, Loader2, Filter
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';
import { getFlag, countries, disciplines as disciplinesList } from '../utils/countries';
import PublicLayout from '../components/PublicLayout';

const FindClubPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      const data = response.data?.clubs || response.data || response;
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  // Get discipline info
  const getDisciplineInfo = (code) => {
    const discipline = disciplinesList.find(d => d.code === code);
    return discipline || { name: code, color: 'bg-gray-500' };
  };

  // Filter clubs
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = 
      club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = countryFilter === 'all' || club.country_code === countryFilter;
    
    const matchesDiscipline = disciplineFilter === 'all' || 
      (club.disciplines && club.disciplines.includes(disciplineFilter));
    
    return matchesSearch && matchesCountry && matchesDiscipline;
  });

  // Get unique countries from clubs
  const uniqueCountries = [...new Set(clubs.map(c => c.country_code))].filter(Boolean);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/20 to-background py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-oswald font-bold text-text-primary mb-4">
              Trouver un Club
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Découvrez les clubs affiliés à l'Académie Jacques Levinet dans le monde entier
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <Input
                  placeholder="Rechercher par nom, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {uniqueCountries.map(code => {
                    const country = countries.find(c => c.code === code);
                    return (
                      <SelectItem key={code} value={code}>
                        {getFlag(code)} {country?.name || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Discipline Filter */}
              <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Toutes disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes disciplines</SelectItem>
                  {disciplinesList.map(disc => (
                    <SelectItem key={disc.code} value={disc.code}>
                      {disc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-text-secondary">
              {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} trouvé{filteredClubs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Clubs Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map(club => (
                <Link 
                  key={club.id} 
                  to={`/club/${club.id}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex items-start gap-4">
                      {/* Club Logo */}
                      {club.logo_url ? (
                        <img 
                          src={club.logo_url} 
                          alt={club.name}
                          className="w-16 h-16 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>
                      )}

                      {/* Club Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getFlag(club.country_code)}</span>
                          <h3 className="text-lg font-oswald font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                            {club.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-1 text-text-secondary text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{club.city}, {club.country}</span>
                        </div>

                        {/* Disciplines */}
                        {club.disciplines && club.disciplines.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {club.disciplines.slice(0, 3).map((code) => {
                              const disc = getDisciplineInfo(code);
                              return (
                                <span 
                                  key={code}
                                  className={`px-2 py-0.5 rounded text-xs font-medium text-white ${disc.color}`}
                                >
                                  {disc.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-text-secondary text-sm">
                        <Users className="w-4 h-4" />
                        <span>{club.member_count || 0} membres</span>
                      </div>
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Voir le club →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredClubs.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-oswald text-text-primary mb-2">
                Aucun club trouvé
              </h3>
              <p className="text-text-secondary">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default FindClubPage;
