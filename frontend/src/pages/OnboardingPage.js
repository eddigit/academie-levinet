import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, User, UserCircle, Shield, ShieldCheck, 
  Sparkles, Activity, Briefcase, Home, Target, Monitor, Users, 
  Globe, CreditCard, Check, Loader2, Lock, UserCheck, MapPin, Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;

const beltGrades = [
  "Ceinture Blanche",
  "Ceinture Jaune",
  "Ceinture Orange",
  "Ceinture Verte",
  "Ceinture Bleue",
  "Ceinture Marron",
  "Ceinture Noire",
  "Ceinture Noire 1er Dan",
  "Ceinture Noire 2ème Dan",
  "Ceinture Noire 3ème Dan",
  "Ceinture Noire 4ème Dan",
  "Ceinture Noire 5ème Dan",
  "Instructeur",
  "Directeur Technique",
  "Directeur National"
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExistingMember, setIsExistingMember] = useState(false);
  const [showPendingConfirmation, setShowPendingConfirmation] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Profil
    person_type: '',
    // Step 2: Motivations
    motivations: [],
    // Step 3: Mode de formation
    training_mode: '', // 'online', 'club', 'both'
    nearest_club_city: '',
    // Step 4: Coordonnées + Compte
    full_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: 'France',
    // Step 5 - Existing member fields
    club_name: '',
    instructor_name: '',
    belt_grade: ''
  });

  // Fetch countries, instructors, and clubs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, instructorsRes, clubsRes] = await Promise.all([
          api.get('/onboarding/countries').catch(() => ({ data: { countries: [] } })),
          api.get('/onboarding/instructors').catch(() => ({ data: { instructors: [] } })),
          api.get('/onboarding/clubs').catch(() => ({ data: { clubs: [] } }))
        ]);
        setCountries(countriesRes.data.countries || []);
        setInstructors(instructorsRes.data.instructors || []);
        setClubs(clubsRes.data.clubs || []);
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
      }
    };
    fetchData();
  }, []);

  const personTypes = [
    { value: 'Femme', label: 'Femme', icon: User, description: 'Self-défense féminine' },
    { value: 'Homme', label: 'Homme', icon: UserCircle, description: 'Autodéfense efficace' },
    { value: 'Enfant/Parent', label: 'Enfant/Parent', icon: Users, description: 'Formation famille' },
    { value: 'Professionnel', label: 'Professionnel', icon: Shield, description: 'Formation Forces de l\'ordre / Sécurité' }
  ];

  const motivationOptions = [
    { value: 'Sécurité personnelle', label: 'Sécurité personnelle', icon: ShieldCheck },
    { value: 'Confiance en soi', label: 'Confiance en soi', icon: Sparkles },
    { value: 'Condition physique', label: 'Condition physique', icon: Activity },
    { value: 'Carrière professionnelle', label: 'Carrière professionnelle', icon: Briefcase },
    { value: 'Protection familiale', label: 'Protection familiale', icon: Home },
    { value: 'Développement personnel', label: 'Développement personnel', icon: Target }
  ];

  const trainingModes = [
    { 
      value: 'online', 
      label: 'Formation en ligne', 
      icon: Monitor, 
      description: 'Accès aux cours vidéo et cahiers techniques, apprenez à votre rythme',
      features: ['50+ vidéos techniques', 'Cahiers PDF', 'Accès 24/7', 'Communauté en ligne']
    },
    { 
      value: 'club', 
      label: 'En club', 
      icon: Users, 
      description: 'Rejoignez un club partenaire près de chez vous pour une formation en présentiel',
      features: ['Cours en groupe', 'Instructeur certifié', 'Sparring encadré', 'Passages de grades']
    },
    { 
      value: 'both', 
      label: 'Les deux', 
      icon: Globe, 
      description: 'Combinez formation en ligne et en club pour une progression optimale',
      features: ['Tous les avantages', 'Progression accélérée', 'Flexibilité maximale', 'Meilleur rapport qualité/prix']
    }
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

  const handleTrainingModeSelect = (mode) => {
    setFormData({ ...formData, training_mode: mode });
  };

  const handleCreateAccountAndPay = async () => {
    setLoading(true);
    
    try {
      // 1. Create user account
      const registerResponse = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });

      // Save token temporarily
      const token = registerResponse.data.token;
      localStorage.setItem('token', token);

      // 2. Save lead/prospect data
      await api.post('/leads', {
        person_type: formData.person_type,
        motivations: formData.motivations,
        training_mode: formData.training_mode,
        nearest_club_city: formData.nearest_club_city,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        country: formData.country
      });

      // 3. Create Stripe checkout for licence
      const checkoutResponse = await api.post('/payments/membership/checkout', {
        package_id: 'licence',
        origin_url: window.location.origin
      });

      // 4. Redirect to Stripe
      if (checkoutResponse.data.url) {
        window.location.href = checkoutResponse.data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
      
      // If user already exists, suggest login
      if (errorMessage.includes('existe') || errorMessage.includes('exists') || errorMessage.includes('registered')) {
        toast.info('Vous avez déjà un compte ? Connectez-vous !');
      }
    }
    
    setLoading(false);
  };

  const handleExistingMemberSubmit = async () => {
    setLoading(true);
    
    try {
      await api.post('/pending-members', {
        person_type: formData.person_type,
        motivations: formData.motivations,
        training_mode: formData.training_mode,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        club_name: formData.club_name,
        instructor_name: formData.instructor_name,
        belt_grade: formData.belt_grade
      });

      setShowPendingConfirmation(true);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'envoi de votre demande';
      toast.error(errorMessage);
    }
    
    setLoading(false);
  };

  const canGoNext = () => {
    if (step === 1) return formData.person_type !== '';
    if (step === 2) return formData.motivations.length > 0;
    if (step === 3) {
      if (formData.training_mode === '') return false;
      if ((formData.training_mode === 'club' || formData.training_mode === 'both') && !formData.nearest_club_city) return false;
      return true;
    }
    if (step === 4) {
      return formData.full_name && formData.email && formData.password && 
             formData.password.length >= 6 && formData.phone && formData.city;
    }
    return true;
  };

  const canSubmitExistingMember = () => {
    return formData.city && formData.club_name && formData.instructor_name && formData.belt_grade;
  };

  const stepTitles = [
    'Votre profil',
    'Vos motivations', 
    'Mode de formation',
    'Créer votre compte',
    'Devenir Membre'
  ];

  // Pending confirmation screen
  if (showPendingConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-paper rounded-2xl border border-white/10 p-8">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-10 h-10 text-amber-500" />
            </div>
            
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase mb-4">
              Demande Enregistrée
            </h1>
            
            <p className="text-text-secondary mb-6">
              Votre profil est maintenant <strong className="text-amber-500">en attente de validation</strong> par notre équipe.
            </p>
            
            <div className="bg-background rounded-lg p-4 mb-6 text-left">
              <p className="text-text-muted text-sm">
                Un email de confirmation vous a été envoyé. Vous recevrez vos identifiants de connexion dès que votre compte sera validé par l'administration.
              </p>
            </div>
            
            <Link
              to="/"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Existing member form (Step 5 alternative)
  if (isExistingMember && step === 5) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="existing-member-page">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
                alt="Logo Académie Jacques Levinet" 
                className="w-16 h-16 mx-auto rounded-full object-cover"
              />
            </Link>
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide mb-2">
              Membre Existant
            </h1>
            <p className="text-text-secondary font-manrope text-sm">
              Complétez vos informations pour activer votre accès
            </p>
          </div>

          {/* Form */}
          <div className="stat-card">
            <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2 text-center">
              Vérification de votre profil
            </h2>
            <p className="text-text-secondary font-manrope text-center mb-6 text-sm">
              Ces informations nous permettent de vérifier votre adhésion
            </p>
            
            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Votre ville *
                </Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 bg-background border-white/10 text-text-primary"
                  placeholder="Ex: Paris, Lyon, Marseille..."
                />
              </div>
              
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <Home className="w-4 h-4" /> Nom de votre club *
                </Label>
                <Input
                  value={formData.club_name}
                  onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                  className="mt-1 bg-background border-white/10 text-text-primary"
                  placeholder="Ex: Club SPK Paris Centre"
                />
              </div>
              
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <User className="w-4 h-4" /> Nom de votre instructeur *
                </Label>
                <Input
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  className="mt-1 bg-background border-white/10 text-text-primary"
                  placeholder="Prénom et nom de votre instructeur"
                />
              </div>
              
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <Award className="w-4 h-4" /> Votre grade actuel *
                </Label>
                <Select
                  value={formData.belt_grade}
                  onValueChange={(value) => setFormData({ ...formData, belt_grade: value })}
                >
                  <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                    <SelectValue placeholder="Sélectionnez votre grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-paper border-white/10">
                    {beltGrades.map((grade) => (
                      <SelectItem key={grade} value={grade} className="text-text-primary hover:bg-white/5">
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleExistingMemberSubmit}
                  disabled={loading || !canSubmitExistingMember()}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Soumettre ma demande
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-start mt-6">
            <Button
              onClick={() => setIsExistingMember(false)}
              variant="outline"
              className="border-white/10 text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="onboarding-page">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
              alt="Logo Académie Jacques Levinet" 
              className="w-16 h-16 mx-auto rounded-full object-cover"
            />
          </Link>
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide mb-2">
            Rejoignez l'Académie
          </h1>
          <p className="text-text-secondary font-manrope text-sm">
            Étape {step} sur {TOTAL_STEPS} — {stepTitles[step - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-primary' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="stat-card min-h-[420px]">
          {/* Step 1: Person Type */}
          {step === 1 && (
            <div>
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2 text-center">
                Qui êtes-vous ?
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-6 text-sm">
                Sélectionnez votre profil pour une expérience personnalisée
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handlePersonTypeSelect(type.value)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.person_type === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <type.icon className="w-10 h-10 mb-3 text-primary" strokeWidth={1.5} />
                    <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-1">
                      {type.label}
                    </h3>
                    <p className="text-text-muted font-manrope text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Motivations */}
          {step === 2 && (
            <div>
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2 text-center">
                Quelles sont vos motivations ?
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-6 text-sm">
                Sélectionnez une ou plusieurs options
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {motivationOptions.map((motivation) => (
                  <button
                    key={motivation.value}
                    onClick={() => handleMotivationToggle(motivation.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      formData.motivations.includes(motivation.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <motivation.icon className="w-8 h-8 mb-2 mx-auto text-primary" strokeWidth={1.5} />
                    <h3 className="font-oswald text-xs font-bold text-text-primary uppercase">
                      {motivation.label}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Training Mode */}
          {step === 3 && (
            <div>
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2 text-center">
                Comment souhaitez-vous apprendre ?
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-6 text-sm">
                Choisissez votre mode de formation préféré
              </p>
              <div className="space-y-4">
                {trainingModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => handleTrainingModeSelect(mode.value)}
                    className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.training_mode === mode.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <mode.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-1">
                          {mode.label}
                        </h3>
                        <p className="text-text-muted font-manrope text-sm mb-3">{mode.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {mode.features.map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/5 text-text-secondary text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      {formData.training_mode === mode.value && (
                        <Check className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Club city input */}
              {(formData.training_mode === 'club' || formData.training_mode === 'both') && (
                <div className="mt-6">
                  <Label className="text-text-secondary">Ville du club le plus proche *</Label>
                  <Input
                    value={formData.nearest_club_city}
                    onChange={(e) => setFormData({ ...formData, nearest_club_city: e.target.value })}
                    className="mt-2 bg-background border-white/10 text-text-primary"
                    placeholder="Ex: Paris, Lyon, Marseille..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Account Creation */}
          {step === 4 && (
            <div>
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2 text-center">
                Créez votre compte
              </h2>
              <p className="text-text-secondary font-manrope text-center mb-6 text-sm">
                Vos informations pour accéder à l'espace membre
              </p>
              <div className="max-w-lg mx-auto space-y-4">
                <div>
                  <Label className="text-text-secondary">Nom complet *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                    placeholder="jean@example.com"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Mot de passe * (min. 6 caractères)</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Téléphone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Ville *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
            <div className="text-center">
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2">
                Devenir Membre
              </h2>
              <p className="text-text-secondary font-manrope mb-8 text-sm">
                Cotisation membre de l'Académie Jacques Levinet
              </p>

              <div className="max-w-md mx-auto">
                {/* Price Card */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-primary/30 p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="font-oswald text-xl text-text-primary uppercase">Membre AJL</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="font-oswald text-5xl font-bold text-primary">35</span>
                    <span className="font-oswald text-2xl text-primary">€</span>
                    <span className="text-text-muted text-sm block mt-1">/ an</span>
                  </div>

                  <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Accès complet à l'espace membre</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Support pédagogique</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Accès à la communauté</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Communauté mondiale des pratiquants</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Messagerie interne</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Actualités</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">Événements</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateAccountAndPay}
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Devenir membre - 35€
                      </>
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-text-muted text-xs mb-6">
                  <Lock className="w-4 h-4" />
                  <span>Paiement sécurisé par Stripe</span>
                </div>

                {/* Existing Member Button */}
                <div className="border-t border-white/10 pt-6">
                  <button
                    onClick={() => setIsExistingMember(true)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserCheck className="w-5 h-5" />
                    Je suis déjà membre
                  </button>
                  <p className="text-text-muted text-xs mt-2">
                    Vous avez déjà payé votre cotisation en club ? Faites valider votre accès.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="border-white/10 text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          ) : (
            <Link to="/" className="text-text-muted hover:text-primary font-manrope text-sm transition-colors flex items-center">
              <ChevronLeft className="w-4 h-4 mr-1" /> Accueil
            </Link>
          )}

          {step < 5 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
            >
              Suivant <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-text-muted hover:text-primary text-sm transition-colors">
            Déjà membre ? <span className="text-primary">Connectez-vous</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
