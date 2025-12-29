import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { Search, Globe, Mail, MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { getFlag } from '../utils/countries';
import UserAvatar from '../components/UserAvatar';
import { formatFirstName, formatLastName } from '../lib/utils';

const OnlineStudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOnlineStudents();
  }, []);

  const fetchOnlineStudents = async () => {
    try {
      const response = await api.get('/users');
      const allUsers = response.data.users || response.data || [];
      // Filter only eleve_libre (online students)
      const onlineStudents = allUsers.filter(u => u.role === 'eleve_libre');
      setStudents(onlineStudents);
    } catch (error) {
      console.error('Error fetching online students:', error);
      toast.error('Erreur lors du chargement des élèves libres');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.country?.toLowerCase().includes(searchLower) ||
      student.city?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="online-students-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <Globe className="w-10 h-10 text-green-500" />
              Élèves Libres
            </h1>
            <p className="text-text-secondary font-manrope mt-2">
              {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''} en formation e-learning
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            <Globe className="w-4 h-4 inline mr-2" />
            Les élèves libres sont des membres qui suivent leur formation en ligne, sans être rattachés à un club physique.
          </p>
        </div>

        {/* Search */}
        <div className="stat-card">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              placeholder="Rechercher un élève libre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-text-primary"
            />
          </div>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-muted mt-4">Chargement...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
            <Globe className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">Aucun élève libre trouvé</p>
            {searchTerm && (
              <p className="text-text-muted text-sm mt-2">Essayez avec d'autres termes de recherche</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-paper rounded-xl border border-white/10 p-4 hover:border-green-500/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/members/${student.id}`)}
              >
                <div className="flex items-start gap-4">
                  <UserAvatar user={student} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary truncate">
                        {formatFirstName(student.first_name)} {formatLastName(student.last_name)}
                      </h3>
                      {student.country && (
                        <span className="text-lg" title={student.country}>
                          {getFlag(student.country)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{student.email}</span>
                      </p>
                      
                      {student.city && (
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {student.city}
                        </p>
                      )}
                      
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Inscrit le {formatDate(student.created_at)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        <Globe className="w-3 h-3" />
                        E-learning
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/members/${student.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Voir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OnlineStudentsPage;
