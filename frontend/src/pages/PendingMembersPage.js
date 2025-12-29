import React, { useState, useEffect } from 'react';
import { 
  UserCheck, UserX, Clock, Search, Filter, 
  CheckCircle, XCircle, ChevronDown, Mail, Phone, MapPin, Award, Users, Home
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import api, { getErrorMessage } from '../utils/api';
import { toast } from 'sonner';

const PendingMembersPage = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('En attente');
  const [processingId, setProcessingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPendingMembers();
  }, [statusFilter]);

  const fetchPendingMembers = async () => {
    try {
      const response = await api.get('/admin/pending-members', {
        params: statusFilter ? { status: statusFilter } : {}
      });
      setPendingMembers(response.data.pending_members || []);
    } catch (error) {
      console.error('Error fetching pending members:', error);
      toast.error('Erreur lors du chargement des demandes');
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/admin/pending-members/${id}/approve`);
      toast.success('Membre approuvé ! Un email avec les identifiants a été envoyé.');
      fetchPendingMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de l\'approbation'));
    }
    setProcessingId(null);
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Raison du refus (optionnel):');
    setProcessingId(id);
    try {
      await api.post(`/admin/pending-members/${id}/reject`, null, {
        params: { reason }
      });
      toast.success('Demande refusée');
      fetchPendingMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Erreur lors du refus');
    }
    setProcessingId(null);
  };

  const filteredMembers = pendingMembers.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'En attente':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'Approuvé':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approuvé</span>;
      case 'Rejeté':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>;
    }
  };

  const pendingCount = pendingMembers.filter(m => m.status === 'En attente').length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-primary" />
                Membres en Attente
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-white text-sm px-2 py-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </h1>
              <p className="text-text-muted font-manrope mt-1">
                Validez les demandes d'accès des membres existants
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par nom, email ou instructeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-paper border-white/10 text-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'En attente' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('En attente')}
                className={statusFilter === 'En attente' ? 'bg-amber-500 hover:bg-amber-600' : 'border-white/10'}
              >
                <Clock className="w-4 h-4 mr-2" /> En attente
              </Button>
              <Button
                variant={statusFilter === 'Approuvé' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Approuvé')}
                className={statusFilter === 'Approuvé' ? 'bg-green-500 hover:bg-green-600' : 'border-white/10'}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approuvés
              </Button>
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('')}
                className={statusFilter === '' ? 'bg-primary' : 'border-white/10'}
              >
                <Filter className="w-4 h-4 mr-2" /> Tous
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-muted">Chargement...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
              <UserCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucune demande {statusFilter ? `"${statusFilter}"` : ''} pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="bg-paper rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Main row */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="font-oswald text-primary text-lg">
                          {member.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-oswald text-lg text-text-primary">{member.full_name}</h3>
                        <p className="text-text-muted text-sm">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(member.status)}
                      <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expandedId === member.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Expanded details */}
                  {expandedId === member.id && (
                    <div className="border-t border-white/10 p-4 bg-background/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Phone className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">{member.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPin className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">{member.city}, {member.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Home className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">{member.club_name || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Users className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">Instructeur: <strong>{member.instructor_name || 'Non renseigné'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Award className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">{member.belt_grade || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">
                            {new Date(member.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Motivations */}
                      {member.motivations && member.motivations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-text-muted text-xs mb-2">Motivations:</p>
                          <div className="flex flex-wrap gap-2">
                            {member.motivations.map((m, i) => (
                              <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      {member.status === 'En attente' && (
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleApprove(member.id); }}
                            disabled={processingId === member.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {processingId === member.id ? 'Traitement...' : 'Approuver'}
                          </Button>
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleReject(member.id); }}
                            disabled={processingId === member.id}
                            variant="outline"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      )}
                      
                      {member.admin_notes && (
                        <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                          <p className="text-red-400 text-sm">Note: {member.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingMembersPage;
