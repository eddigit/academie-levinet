import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../utils/api';
import { Plus, Mail, Phone, MapPin, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const TechnicalDirectorsPage = () => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: ''
  });

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      const data = await api.getTechnicalDirectors();
      setDirectors(data);
    } catch (error) {
      console.error('Error fetching directors:', error);
      toast.error('Erreur lors du chargement des directeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDirector = async (e) => {
    e.preventDefault();
    try {
      await api.createTechnicalDirector(formData);
      toast.success('Directeur ajouté avec succès');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', country: '', city: '' });
      fetchDirectors();
    } catch (error) {
      console.error('Error adding director:', error);
      toast.error('Erreur lors de l\'ajout du directeur');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="directors-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="directors-title">
              Directeurs Techniques
            </h1>
            <p className="text-text-secondary font-manrope mt-2">{directors.length} directeurs</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-director-button" className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un Directeur
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-paper border-border" data-testid="add-director-modal">
              <DialogHeader>
                <DialogTitle className="font-oswald text-2xl text-text-primary uppercase">Nouveau Directeur Technique</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDirector} className="space-y-4 mt-4">
                <div>
                  <Label className="text-text-secondary">Nom</Label>
                  <Input
                    data-testid="input-director-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Email</Label>
                  <Input
                    data-testid="input-director-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Téléphone</Label>
                  <Input
                    data-testid="input-director-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Pays</Label>
                    <Input
                      data-testid="input-director-country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Ville</Label>
                    <Input
                      data-testid="input-director-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  data-testid="submit-director-button"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
                >
                  Ajouter le Directeur
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Directors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary font-manrope">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="directors-grid">
            {directors.map((director, index) => (
              <div key={director.id} className="stat-card" data-testid={`director-card-${index}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-oswald font-bold text-white">
                      {director.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-manrope font-medium text-primary">{director.members_count}</span>
                  </div>
                </div>
                <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-2">
                  {director.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="font-manrope">{director.city}, {director.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Mail className="w-4 h-4" />
                    <span className="font-manrope">{director.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Phone className="w-4 h-4" />
                    <span className="font-manrope">{director.phone}</span>
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

export default TechnicalDirectorsPage;