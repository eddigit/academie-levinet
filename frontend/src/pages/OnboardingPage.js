import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, UserCircle, Shield, ShieldCheck, Sparkles, Activity, Briefcase, Home, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';

// Icon mapping
const iconComponents = {
  User, UserCircle, Baby: User, Shield, ShieldCheck, Sparkles, Activity, Briefcase, Home, Target
};

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    person_type: '',
    motivations: [],
    full_name: '',
    email: '',
    phone: '',
    city: '',
    country: ''
  });

  const personTypes = [
    { value: 'Femme', label: 'Femme', icon: 'User', description: 'Self-défense féminine SFJL' },
    { value: 'Homme', label: 'Homme', icon: 'UserCircle', description: 'Autodéfense efficace' },
    { value: 'Enfant', label: 'Enfant', icon: 'Baby', description: 'Discipline et respect' },
    { value: 'Professionnel', label: 'Professionnel', icon: 'Shield', description: 'Formation IPC/ROS' }
  ];

  const motivationOptions = [
    { value: 'Sécurité personnelle', label: 'Sécurité personnelle', icon: 'ShieldCheck' },
    { value: 'Confiance en soi', label: 'Confiance en soi', icon: 'Sparkles' },
    { value: 'Condition physique', label: 'Condition physique', icon: 'Activity' },
    { value: 'Carrière professionnelle', label: 'Carrière professionnelle', icon: 'Briefcase' },
    { value: 'Protection familiale', label: 'Protection familiale', icon: 'Home' },
    { value: 'Développement personnel', label: 'Développement personnel', icon: 'Target' }
  ];

  const handlePersonTypeSelect = (type) => {
    setFormData({ ...formData, person_type: type });
  };

  const handleMotivationToggle = (motivation) => {
    const current = formData.motivations;
    if (current.includes(motivation)) {
      setFormData({ ...formData, motivations: current.filter(m => m !== motivation) });
    } else {
      setFormData({ ...formData, motivations: [...current, motivation] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads`, formData);
      toast.success('Merci ! Nous vous contacterons bientôt.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erreur lors de l\'envoi du formulaire');
    }
  };

  const canGoNext = () => {
    if (step === 1) return formData.person_type !== '';
    if (step === 2) return formData.motivations.length > 0;
    if (step === 3) return formData.full_name && formData.email && formData.phone && formData.city && formData.country;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="onboarding-page">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
              alt="Logo" 
              className="w-20 h-20 mx-auto"
            />
          </Link>
          <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide mb-2">
            Rejoignez l'Académie
          </h1>
          <p className="text-text-secondary font-manrope">Étape {step} sur 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="stat-card min-h-[400px]">
          {step === 1 && (
            <div data-testid="step-person-type">
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-4 text-center">
                Qui êtes-vous ?
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-8">
                Sélectionnez votre profil pour une expérience personnalisée
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personTypes.map((type) => {
                  const IconComponent = iconComponents[type.icon];
                  return (
                    <button
                      key={type.value}
                      data-testid={`person-type-${type.value.toLowerCase()}`}
                      onClick={() => handlePersonTypeSelect(type.value)}
                      className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                        formData.person_type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <IconComponent className="w-12 h-12 mb-3 text-primary" strokeWidth={1} />
                      <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-2">
                        {type.label}
                      </h3>
                      <p className="text-text-secondary font-manrope text-sm">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div data-testid="step-motivations">
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-4 text-center">
                Quelles sont vos motivations ?
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-8">
                Sélectionnez une ou plusieurs options (minimum 1)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {motivationOptions.map((motivation) => (
                  <button
                    key={motivation.value}
                    data-testid={`motivation-${motivation.value.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleMotivationToggle(motivation.value)}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 text-center ${
                      formData.motivations.includes(motivation.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{motivation.icon}</div>
                    <h3 className="font-oswald text-sm font-bold text-text-primary uppercase">
                      {motivation.label}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="step-contact-info">
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-4 text-center">
                Vos Coordonnées
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-8">
                Nous vous contacterons pour finaliser votre inscription
              </p>
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div>
                  <Label className="text-text-secondary">Nom complet *</Label>
                  <Input
                    data-testid="input-fullname"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Email *</Label>
                    <Input
                      data-testid="input-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                      placeholder="jean@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Téléphone *</Label>
                    <Input
                      data-testid="input-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Ville *</Label>
                    <Input
                      data-testid="input-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Pays *</Label>
                    <Input
                      data-testid="input-country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                      placeholder="France"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              data-testid="back-button"
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="border-border text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          ) : (
            <Link to="/" className="text-text-secondary hover:text-primary font-manrope text-sm transition-smooth">
              ← Retour à l'accueil
            </Link>
          )}

          {step < 3 ? (
            <Button
              data-testid="next-button"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
            >
              Suivant <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              data-testid="submit-button"
              onClick={handleSubmit}
              disabled={!canGoNext()}
              className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
            >
              Envoyer ma demande
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;