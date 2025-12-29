import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, CheckCircle, XCircle, Clock, 
  Download, FileText, RefreshCw, Loader2, Calendar, User, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import api from '../utils/api';
import { toast } from 'sonner';

const SubscriptionManagementPage = () => {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, never_paid: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/admin/members/subscriptions');
      setMembers(response.data.members || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleToggleSubscription = async (userId, currentStatus) => {
    setProcessingId(userId);
    try {
      await api.put(`/admin/members/${userId}/subscription`, null, {
        params: { has_paid_license: !currentStatus }
      });
      toast.success('Statut mis à jour');
      fetchMembers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Erreur lors de la mise à jour');
    }
    setProcessingId(null);
  };

  const handleGenerateInvoice = async (userId) => {
    setProcessingId(userId);
    try {
      const response = await api.post('/admin/invoices/generate', null, {
        params: { user_id: userId, amount: 35, invoice_type: 'membership' }
      });
      toast.success('Facture générée');
      
      // Download the invoice
      const pdfResponse = await api.get(`/invoices/${response.data.invoice_id}/pdf`);
      downloadPDF(pdfResponse.data);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
    setProcessingId(null);
  };

  const handleDownloadInvoice = async (userId) => {
    setProcessingId(userId);
    try {
      // Get user's invoices
      const invoicesResponse = await api.get('/admin/members/subscriptions');
      const member = invoicesResponse.data.members?.find(m => m.id === userId);
      
      if (!member) {
        toast.error('Membre non trouvé');
        setProcessingId(null);
        return;
      }
      
      // Generate and download
      const genResponse = await api.post('/admin/invoices/generate', null, {
        params: { user_id: userId, amount: 35, invoice_type: 'membership' }
      });
      
      const pdfResponse = await api.get(`/invoices/${genResponse.data.invoice_id}/pdf`);
      downloadPDF(pdfResponse.data);
      toast.success('Facture téléchargée');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Erreur lors du téléchargement');
    }
    setProcessingId(null);
  };

  const downloadPDF = (data) => {
    const byteCharacters = atob(data.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = data.filename;
    link.click();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> À jour</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Expiré</span>;
      case 'never_paid':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Non payé</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || member.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                Gestion des Cotisations
              </h1>
              <p className="text-text-muted font-manrope mt-1">
                Gérez les adhésions et générez les factures
              </p>
            </div>
            <Button onClick={fetchMembers} variant="outline" className="border-white/10">
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-paper rounded-xl border border-white/10 p-4 text-center">
              <p className="text-text-muted text-sm">Total membres</p>
              <p className="font-oswald text-3xl text-text-primary">{stats.total}</p>
            </div>
            <div className="bg-paper rounded-xl border border-green-500/30 p-4 text-center">
              <p className="text-green-400 text-sm">Cotisations à jour</p>
              <p className="font-oswald text-3xl text-green-500">{stats.active}</p>
            </div>
            <div className="bg-paper rounded-xl border border-red-500/30 p-4 text-center">
              <p className="text-red-400 text-sm">Expirées</p>
              <p className="font-oswald text-3xl text-red-500">{stats.expired}</p>
            </div>
            <div className="bg-paper rounded-xl border border-gray-500/30 p-4 text-center">
              <p className="text-gray-400 text-sm">Jamais payé</p>
              <p className="font-oswald text-3xl text-gray-500">{stats.never_paid}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-paper border-white/10 text-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('')}
                className={statusFilter === '' ? 'bg-primary' : 'border-white/10'}
              >
                Tous
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-green-500 hover:bg-green-600' : 'border-white/10'}
              >
                À jour
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('expired')}
                className={statusFilter === 'expired' ? 'bg-red-500 hover:bg-red-600' : 'border-white/10'}
              >
                Expirés
              </Button>
              <Button
                variant={statusFilter === 'never_paid' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('never_paid')}
                className={statusFilter === 'never_paid' ? 'bg-gray-500 hover:bg-gray-600' : 'border-white/10'}
              >
                Non payé
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-text-muted">Chargement...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
              <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucun membre trouvé</p>
            </div>
          ) : (
            <div className="bg-paper rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50">
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Membre</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Statut</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Expiration</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Jours restants</th>
                    <th className="text-center p-4 text-text-muted font-manrope text-sm">Cotisation payée</th>
                    <th className="text-right p-4 text-text-muted font-manrope text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="font-oswald text-primary">{member.full_name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-oswald text-text-primary">{member.full_name}</p>
                            <p className="text-text-muted text-xs">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(member.subscription_status)}
                      </td>
                      <td className="p-4">
                        <span className="text-text-secondary text-sm">
                          {member.expiry_date 
                            ? new Date(member.expiry_date).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${
                          member.days_remaining > 30 ? 'text-green-500' :
                          member.days_remaining > 0 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {member.days_remaining > 0 ? `${member.days_remaining} jours` : 
                           member.subscription_status === 'never_paid' ? '-' : 'Expiré'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Switch
                          checked={member.has_paid_license || false}
                          onCheckedChange={() => handleToggleSubscription(member.id, member.has_paid_license)}
                          disabled={processingId === member.id}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(member.id)}
                            disabled={processingId === member.id}
                            className="border-white/10 text-text-secondary hover:text-text-primary"
                            title="Télécharger la facture"
                          >
                            {processingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagementPage;
