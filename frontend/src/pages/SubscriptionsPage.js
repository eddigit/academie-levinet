import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../utils/api';
import { Plus, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_date: '',
    payment_method: 'Carte Bancaire',
    status: 'Complété'
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchMembers();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await api.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Erreur lors du chargement des cotisations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      const subData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await api.createSubscription(subData);
      toast.success('Cotisation ajoutée avec succès');
      setIsAddModalOpen(false);
      setFormData({
        member_id: '',
        amount: '',
        payment_date: '',
        payment_method: 'Carte Bancaire',
        status: 'Complété'
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Erreur lors de l\'ajout de la cotisation');
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.first_name} ${member.last_name}` : 'Inconnu';
  };

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="subscriptions-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="subscriptions-title">
              Gestion des Cotisations
            </h1>
            <p className="text-text-secondary font-manrope mt-2">{subscriptions.length} transactions</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-subscription-button" className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle Cotisation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-paper border-border" data-testid="add-subscription-modal">
              <DialogHeader>
                <DialogTitle className="font-oswald text-2xl text-text-primary uppercase">Nouvelle Cotisation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubscription} className="space-y-4 mt-4">
                <div>
                  <Label className="text-text-secondary">Membre</Label>
                  <Select
                    value={formData.member_id}
                    onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                  >
                    <SelectTrigger data-testid="select-member" className="bg-background border-border text-text-primary">
                      <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-border">
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-text-primary">
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-text-secondary">Montant (€)</Label>
                  <Input
                    data-testid="input-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Date de paiement</Label>
                  <Input
                    data-testid="input-payment-date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Méthode de paiement</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger data-testid="select-payment-method" className="bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-border">
                      <SelectItem value="Carte Bancaire" className="text-text-primary">Carte Bancaire</SelectItem>
                      <SelectItem value="Espèces" className="text-text-primary">Espèces</SelectItem>
                      <SelectItem value="Virement" className="text-text-primary">Virement</SelectItem>
                      <SelectItem value="Chèque" className="text-text-primary">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  data-testid="submit-subscription-button"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
                >
                  Enregistrer la Cotisation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card" data-testid="total-revenue-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Revenu Total</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">€ {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card" data-testid="total-transactions-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Transactions</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{subscriptions.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card" data-testid="avg-payment-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Paiement Moyen</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">
                  € {subscriptions.length > 0 ? (totalRevenue / subscriptions.length).toFixed(2) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="stat-card" data-testid="subscriptions-table">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Aucune cotisation trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Membre</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Montant</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Méthode</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription, index) => (
                    <tr key={subscription.id} className="border-b border-white/5 hover:bg-white/5 transition-smooth" data-testid={`subscription-row-${index}`}>
                      <td className="py-3 px-4 text-text-primary font-manrope">{getMemberName(subscription.member_id)}</td>
                      <td className="py-3 px-4 text-accent font-manrope font-bold">€ {subscription.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-text-secondary font-manrope text-sm">{subscription.payment_date}</td>
                      <td className="py-3 px-4 text-text-secondary font-manrope">{subscription.payment_method}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${
                          subscription.status === 'Complété' ? 'bg-primary/20 text-primary' :
                          subscription.status === 'En attente' ? 'bg-text-muted/20 text-text-muted' :
                          'bg-secondary/20 text-secondary'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionsPage;