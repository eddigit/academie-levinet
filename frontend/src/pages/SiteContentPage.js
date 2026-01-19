import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Save, Loader2, Image, Type, Mail, Upload, X,
  Facebook, Instagram, Youtube, Linkedin, Twitter, Home, User, BookOpen, MapPin, Phone,
  GraduationCap, Map, Shield, Package, UserPlus, Search, ShoppingBag, Book
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import api from '../utils/api';
import { toast } from 'sonner';

// Composant d'upload d'image
const ImageUploader = ({ label, value, onChange, placeholder }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB for better performance)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`L'image est trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum: 5 Mo`);
      return;
    }

    setUploading(true);
    console.log(`📤 [ImageUploader] Début upload: ${label}`, { fileName: file.name, size: file.size, type: file.type });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        console.log(`📦 [ImageUploader] Fichier lu, taille data URL: ${dataUrl.length} caractères`);

        try {
          // Upload to Cloudinary via API
          console.log(`☁️ [ImageUploader] Upload vers Cloudinary: ${label}`);
          const response = await api.post('/upload/image', { image_data: dataUrl });

          const cloudinaryUrl = response.data.url;
          console.log(`✅ [ImageUploader] Image uploadée sur Cloudinary: ${cloudinaryUrl}`);

          // Save Cloudinary URL instead of base64
          setPreview(cloudinaryUrl);
          onChange(cloudinaryUrl);
          toast.success(`Image "${label}" uploadée sur Cloudinary ! Cliquez sur "Enregistrer tout" pour sauvegarder.`);
        } catch (uploadError) {
          console.error('❌ [ImageUploader] Erreur upload Cloudinary:', uploadError);
          toast.error(`Erreur upload Cloudinary: ${uploadError.response?.data?.detail || uploadError.message}`);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        console.error('❌ [ImageUploader] Erreur lecture fichier');
        toast.error('Impossible de lire le fichier');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      console.error('❌ [ImageUploader] Erreur inattendue:', error);
      toast.error('Erreur lors du traitement du fichier');
    }
  };

  const handleClear = () => {
    console.log(`🗑️ [ImageUploader] Image effacée: ${label}`);
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-text-secondary">{label}</Label>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="relative w-32 h-24 rounded-lg border border-white/10 overflow-hidden bg-background flex items-center justify-center">
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 w-6 h-6 bg-secondary/80 rounded-full flex items-center justify-center hover:bg-secondary"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </>
          ) : (
            <Image className="w-8 h-8 text-text-muted" />
          )}
        </div>
        
        {/* Upload controls */}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-white/10"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? 'Upload...' : 'Choisir une image'}
          </Button>
          <Input
            value={preview}
            onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
            placeholder={placeholder || "ou collez une URL d'image"}
            className="bg-background border-white/10 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

const SiteContentPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('branding');
  const [content, setContent] = useState({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/site-content');
      const data = response.data || response;
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('💾 [SiteContent] Début sauvegarde...');
    console.log('💾 [SiteContent] Sections à sauvegarder:', Object.keys(content));
    
    // Log les images présentes
    const imagesLog = {};
    ['disciplines', 'pages', 'founder', 'hero', 'about'].forEach(section => {
      if (content[section]) {
        const sectionImages = {};
        const scanForImages = (obj, prefix = '') => {
          Object.entries(obj || {}).forEach(([key, val]) => {
            if (typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http'))) {
              sectionImages[prefix + key] = val.substring(0, 50) + '...';
            } else if (typeof val === 'object' && val !== null) {
              scanForImages(val, prefix + key + '.');
            }
          });
        };
        scanForImages(content[section]);
        if (Object.keys(sectionImages).length > 0) {
          imagesLog[section] = sectionImages;
        }
      }
    });
    console.log('🖼️ [SiteContent] Images détectées:', imagesLog);
    
    try {
      const response = await api.put('/admin/site-content', content);
      console.log('✅ [SiteContent] Sauvegarde réussie:', response);
      toast.success('Contenu du site mis à jour !');
    } catch (error) {
      console.error('❌ [SiteContent] Erreur sauvegarde:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Message d'erreur plus détaillé
      const errorDetail = error.response?.data?.detail || error.message || 'Erreur inconnue';
      toast.error(`Erreur lors de la sauvegarde: ${errorDetail}`);
    }
    setSaving(false);
  };

  const updateField = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const updateNestedField = (section, subsection, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [subsection]: {
          ...(prev[section]?.[subsection] || {}),
          [field]: value
        }
      }
    }));
  };

  const sections = [
    { id: 'branding', label: 'Identité & Branding', icon: Globe },
    { id: 'hero', label: 'Page d\'Accueil', icon: Home },
    { id: 'login', label: 'Page Connexion', icon: User },
    { id: 'founder', label: 'Fondateur', icon: User },
    { id: 'about', label: 'À Propos', icon: BookOpen },
    { id: 'disciplines', label: 'Disciplines', icon: BookOpen },
    { id: 'pedagogy', label: 'Pédagogie', icon: GraduationCap },
    { id: 'international', label: 'International', icon: Map },
    { id: 'kravmag', label: 'Krav Mag AJL', icon: Shield },
    { id: 'editions', label: 'Éditions AJL', icon: Book },
    { id: 'join', label: 'Nous Rejoindre', icon: UserPlus },
    { id: 'find_club', label: 'Trouver un Club', icon: Search },
    { id: 'shop', label: 'Boutique', icon: ShoppingBag },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Réseaux Sociaux', icon: Facebook },
    { id: 'images', label: 'Logos & Branding', icon: Image },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <Globe className="w-7 h-7 text-primary" />
              Gestion du Site
            </h1>
            <p className="text-text-muted font-manrope mt-1 text-sm">
              Modifiez les textes et images du site public
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-dark">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer tout
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                activeSection === section.id
                  ? 'bg-primary text-white'
                  : 'bg-paper border border-white/10 text-text-secondary hover:border-primary/50'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* BRANDING SECTION */}
        {activeSection === 'branding' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Identité de Marque & Navigation
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Branding */}
              <div className="space-y-4">
                <h3 className="font-oswald text-lg text-primary uppercase">Identité Visuelle</h3>
                
                <ImageUploader
                  label="Logo"
                  value={content.branding?.logo_url || ''}
                  onChange={(url) => updateField('branding', 'logo_url', url)}
                />
                
                <div>
                  <Label className="text-text-secondary">Nom complet</Label>
                  <Input
                    value={content.branding?.name || ''}
                    onChange={(e) => updateField('branding', 'name', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Académie Jacques Levinet"
                  />
                </div>
                
                <div>
                  <Label className="text-text-secondary">Nom court (sigle)</Label>
                  <Input
                    value={content.branding?.short_name || ''}
                    onChange={(e) => updateField('branding', 'short_name', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="AJL"
                  />
                </div>
                
                <div>
                  <Label className="text-text-secondary">Tagline (sous le nom)</Label>
                  <Input
                    value={content.branding?.tagline || ''}
                    onChange={(e) => updateField('branding', 'tagline', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="École Internationale de Self-Défense"
                  />
                </div>
                
                <div>
                  <Label className="text-text-secondary">Année de fondation</Label>
                  <Input
                    value={content.branding?.foundation_year || ''}
                    onChange={(e) => updateField('branding', 'foundation_year', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="1998"
                  />
                </div>
                
                <div>
                  <Label className="text-text-secondary">Description (footer)</Label>
                  <Textarea
                    value={content.branding?.description || ''}
                    onChange={(e) => updateField('branding', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={2}
                    placeholder="L'Académie Jacques Levinet forme l'élite..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="space-y-4">
                <h3 className="font-oswald text-lg text-primary uppercase">Footer</h3>
                
                <div>
                  <Label className="text-text-secondary">Copyright</Label>
                  <Input
                    value={content.footer?.copyright || ''}
                    onChange={(e) => updateField('footer', 'copyright', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="© 2025 Académie Jacques Levinet"
                  />
                </div>
                
                <div>
                  <Label className="text-text-secondary">Développeur</Label>
                  <Input
                    value={content.footer?.developer || ''}
                    onChange={(e) => updateField('footer', 'developer', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="GILLES KORZEC"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary">Tagline officielle (organisations)</Label>
                  <Input
                    value={content.footer?.tagline || ''}
                    onChange={(e) => updateField('footer', 'tagline', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="World Krav Maga Organization - International Police Confederation"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        {activeSection === 'hero' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page d'Accueil - Section Héro
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre principal</Label>
                  <Input
                    value={content.hero?.title || ''}
                    onChange={(e) => updateField('hero', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="ACADÉMIE JACQUES LEVINET"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.hero?.subtitle || ''}
                    onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="L'Excellence en Self-Défense"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.hero?.description || ''}
                    onChange={(e) => updateField('hero', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Texte bouton</Label>
                    <Input
                      value={content.hero?.cta_text || ''}
                      onChange={(e) => updateField('hero', 'cta_text', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Lien bouton</Label>
                    <Input
                      value={content.hero?.cta_link || ''}
                      onChange={(e) => updateField('hero', 'cta_link', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-text-secondary">URL Vidéo YouTube (fond)</Label>
                  <Input
                    value={content.hero?.video_url || ''}
                    onChange={(e) => updateField('hero', 'video_url', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              </div>
              
              <div>
                <ImageUploader
                  label="Image de fond (fallback si vidéo indisponible)"
                  value={content.hero?.background_image || ''}
                  onChange={(url) => updateField('hero', 'background_image', url)}
                  placeholder="URL de l'image de fond"
                />
                
                <div className="mt-6 space-y-4">
                  <h3 className="font-oswald text-lg text-primary uppercase border-b border-white/10 pb-2">
                    Images Cartes Audiences (Landing Page)
                  </h3>
                  <ImageUploader
                    label="Card Grand Public"
                    value={content.hero?.audience_cards?.public_image || ''}
                    onChange={(url) => updateNestedField('hero', 'audience_cards', 'public_image', url)}
                    placeholder="Image de la carte 'Pour Tout Public'"
                  />
                  <ImageUploader
                    label="Card Self-Défense Féminine"
                    value={content.hero?.audience_cards?.women_image || ''}
                    onChange={(url) => updateNestedField('hero', 'audience_cards', 'women_image', url)}
                    placeholder="Image de la carte 'Pour les Femmes'"
                  />
                  <ImageUploader
                    label="Card Professionnels"
                    value={content.hero?.audience_cards?.pro_image || ''}
                    onChange={(url) => updateNestedField('hero', 'audience_cards', 'pro_image', url)}
                    placeholder="Image de la carte 'Forces de Sécurité'"
                  />
                  <ImageUploader
                    label="Background CTA Finale"
                    value={content.hero?.cta_background_image || ''}
                    onChange={(url) => updateField('hero', 'cta_background_image', url)}
                    placeholder="Image de fond de la section Call-to-Action finale"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGIN SECTION */}
        {activeSection === 'login' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page de Connexion
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.login?.title || ''}
                    onChange={(e) => updateField('login', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.login?.subtitle || ''}
                    onChange={(e) => updateField('login', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Tagline</Label>
                  <Input
                    value={content.login?.tagline || ''}
                    onChange={(e) => updateField('login', 'tagline', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="L'excellence en self-défense"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <ImageUploader
                  label="Image de fond (côté gauche)"
                  value={content.login?.background_image || ''}
                  onChange={(url) => updateField('login', 'background_image', url)}
                />
                
                <div>
                  <Label className="text-text-secondary">Couleur de l'overlay</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={content.login?.overlay_color || '#0B1120'}
                      onChange={(e) => updateField('login', 'overlay_color', e.target.value)}
                      className="w-16 h-10 p-1 bg-background border-white/10 cursor-pointer"
                    />
                    <Input
                      value={content.login?.overlay_color || '#0B1120'}
                      onChange={(e) => updateField('login', 'overlay_color', e.target.value)}
                      className="flex-1 bg-background border-white/10"
                      placeholder="#0B1120"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-text-secondary">Opacité de l'overlay ({Math.round((content.login?.overlay_opacity || 0.7) * 100)}%)</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={content.login?.overlay_opacity || 0.7}
                    onChange={(e) => updateField('login', 'overlay_opacity', parseFloat(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Transparent</span>
                    <span>Opaque</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOUNDER SECTION */}
        {activeSection === 'founder' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Fondateur
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Nom</Label>
                  <Input
                    value={content.founder?.name || ''}
                    onChange={(e) => updateField('founder', 'name', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Capitaine Jacques LEVINET"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Titre / Fonction</Label>
                  <Input
                    value={content.founder?.title || ''}
                    onChange={(e) => updateField('founder', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Grade</Label>
                  <Input
                    value={content.founder?.grade || ''}
                    onChange={(e) => updateField('founder', 'grade', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="10ème Dan"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Biographie</Label>
                  <Textarea
                    value={content.founder?.bio || ''}
                    onChange={(e) => updateField('founder', 'bio', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Citation</Label>
                  <Textarea
                    value={content.founder?.quote || ''}
                    onChange={(e) => updateField('founder', 'quote', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={3}
                  />
                </div>
              </div>
              
              <ImageUploader
                label="Photo du fondateur"
                value={content.founder?.photo || ''}
                onChange={(url) => updateField('founder', 'photo', url)}
              />
            </div>

            {/* Message du jour section */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-oswald text-lg text-primary uppercase mb-4">
                📢 Message du jour (affiché sur le Tableau de Bord)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-text-secondary">Message du jour</Label>
                    <Textarea
                      value={content.founder?.daily_message || ''}
                      onChange={(e) => updateField('founder', 'daily_message', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                      rows={4}
                      placeholder="Écrivez votre message du jour pour les membres..."
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Ce message sera affiché sur le tableau de bord des membres avec votre photo.
                    </p>
                  </div>
                  <div>
                    <Label className="text-text-secondary">Date du message</Label>
                    <Input
                      type="date"
                      value={content.founder?.daily_message_date || ''}
                      onChange={(e) => updateField('founder', 'daily_message_date', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                    />
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-white/5">
                  <p className="text-sm text-text-muted mb-2">Aperçu du message:</p>
                  {content.founder?.daily_message ? (
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4">
                      <p className="text-text-primary italic">"{content.founder.daily_message}"</p>
                      {content.founder?.daily_message_date && (
                        <p className="text-xs text-text-muted mt-2">
                          Message du {new Date(content.founder.daily_message_date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">Aucun message configuré</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Images Section */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-oswald text-lg text-primary uppercase mb-4">
                📸 Images de la Timeline (Parcours)
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Ces images illustrent les différentes étapes du parcours du fondateur sur la page /founder
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <ImageUploader
                    label="1. Carrière Policière (Années 70-80)"
                    value={content.founder?.timeline_image_1 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_1', url)}
                    placeholder="Photo de la période policière"
                  />
                </div>
                
                <div className="space-y-2">
                  <ImageUploader
                    label="2. Champion de Karaté (Années 70-90)"
                    value={content.founder?.timeline_image_2 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_2', url)}
                    placeholder="Photo champion de karaté"
                  />
                </div>
                
                <div className="space-y-2">
                  <ImageUploader
                    label="3. Recherche Internationale (Années 90)"
                    value={content.founder?.timeline_image_3 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_3', url)}
                    placeholder="Photo recherche internationale"
                  />
                </div>
                
                <div className="space-y-2">
                  <ImageUploader
                    label="4. Création de l'Académie (1998)"
                    value={content.founder?.timeline_image_4 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_4', url)}
                    placeholder="Logo ou photo de création"
                  />
                </div>
                
                <div className="space-y-2">
                  <ImageUploader
                    label="5. Expansion Mondiale (2000s)"
                    value={content.founder?.timeline_image_5 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_5', url)}
                    placeholder="Globe AJL-WKMO-IPC"
                  />
                </div>
                
                <div className="space-y-2">
                  <ImageUploader
                    label="6. Héritage Vivant (Aujourd'hui)"
                    value={content.founder?.timeline_image_6 || ''}
                    onChange={(url) => updateField('founder', 'timeline_image_6', url)}
                    placeholder="Carte mondiale présence"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT SECTION */}
        {activeSection === 'about' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page À Propos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.about?.title || ''}
                    onChange={(e) => updateField('about', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.about?.description || ''}
                    onChange={(e) => updateField('about', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Mission</Label>
                  <Textarea
                    value={content.about?.mission || ''}
                    onChange={(e) => updateField('about', 'mission', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={3}
                  />
                </div>
                
                <h3 className="font-oswald text-lg text-text-primary pt-4">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Pays</Label>
                    <Input
                      value={content.about?.stats?.countries || ''}
                      onChange={(e) => updateNestedField('about', 'stats', 'countries', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                      placeholder="50+"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Directeurs</Label>
                    <Input
                      value={content.about?.stats?.directors || ''}
                      onChange={(e) => updateNestedField('about', 'stats', 'directors', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Clubs</Label>
                    <Input
                      value={content.about?.stats?.clubs || ''}
                      onChange={(e) => updateNestedField('about', 'stats', 'clubs', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                      placeholder="100+"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Membres</Label>
                    <Input
                      value={content.about?.stats?.members || ''}
                      onChange={(e) => updateNestedField('about', 'stats', 'members', e.target.value)}
                      className="mt-1 bg-background border-white/10"
                      placeholder="10000+"
                    />
                  </div>
                </div>
              </div>
              
              <ImageUploader
                label="Image À propos"
                value={content.about?.image || ''}
                onChange={(url) => updateField('about', 'image', url)}
              />
            </div>
          </div>
        )}

        {/* DISCIPLINES SECTION */}
        {activeSection === 'disciplines' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Pages Disciplines
            </h2>
            
            {['wkmo', 'ipc', 'spk', 'sfjl', 'canne', 'enfant', 'baton'].map((disc) => (
              <div key={disc} className="border border-white/10 rounded-lg p-4 space-y-4">
                <h3 className="font-oswald text-lg text-primary uppercase">{disc.toUpperCase()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-text-secondary">Titre</Label>
                      <Input
                        value={content.disciplines?.[disc]?.title || ''}
                        onChange={(e) => updateNestedField('disciplines', disc, 'title', e.target.value)}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Sous-titre</Label>
                      <Input
                        value={content.disciplines?.[disc]?.subtitle || ''}
                        onChange={(e) => updateNestedField('disciplines', disc, 'subtitle', e.target.value)}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Description</Label>
                      <Textarea
                        value={content.disciplines?.[disc]?.description || ''}
                        onChange={(e) => updateNestedField('disciplines', disc, 'description', e.target.value)}
                        className="mt-1 bg-background border-white/10"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <ImageUploader
                      label={`Logo ${disc.toUpperCase()}`}
                      value={content.disciplines?.[disc]?.logo_image || ''}
                      onChange={(url) => updateNestedField('disciplines', disc, 'logo_image', url)}
                      placeholder="Logo officiel de la discipline"
                    />
                    <ImageUploader
                      label={`Image Hero ${disc.toUpperCase()}`}
                      value={content.disciplines?.[disc]?.hero_image || content.disciplines?.[disc]?.image || ''}
                      onChange={(url) => updateNestedField('disciplines', disc, 'hero_image', url)}
                      placeholder="Image principale de la page"
                    />
                    <ImageUploader
                      label={`Image Secondaire ${disc.toUpperCase()}`}
                      value={content.disciplines?.[disc]?.secondary_image || ''}
                      onChange={(url) => updateNestedField('disciplines', disc, 'secondary_image', url)}
                      placeholder="Image de la section contenu"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERNATIONAL SECTION */}
        {activeSection === 'international' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page International
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.international?.title || ''}
                    onChange={(e) => updateField('international', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.international?.subtitle || ''}
                    onChange={(e) => updateField('international', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Nom du Magazine</Label>
                  <Input
                    value={content.international?.magazine_name || ''}
                    onChange={(e) => updateField('international', 'magazine_name', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="KRAV MAG AJL"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre Magazine</Label>
                  <Input
                    value={content.international?.magazine_subtitle || ''}
                    onChange={(e) => updateField('international', 'magazine_subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
              </div>
              
              <ImageUploader
                label="Carte / Image International"
                value={content.international?.map_image || ''}
                onChange={(url) => updateField('international', 'map_image', url)}
              />
            </div>
          </div>
        )}

        {/* PEDAGOGY PAGE */}
        {activeSection === 'pedagogy' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Pédagogie
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.pedagogy?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'pedagogy', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Pédagogie"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.pedagogy?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'pedagogy', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Notre Méthode d'Enseignement"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.pedagogy?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'pedagogy', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.pedagogy?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'pedagogy', 'hero_image', url)}
                />
                <ImageUploader
                  label="Image Contenu"
                  value={content.pages?.pedagogy?.content_image || ''}
                  onChange={(url) => updateNestedField('pages', 'pedagogy', 'content_image', url)}
                />
                <ImageUploader
                  label="Image Secondaire"
                  value={content.pages?.pedagogy?.secondary_image || ''}
                  onChange={(url) => updateNestedField('pages', 'pedagogy', 'secondary_image', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* KRAV MAG AJL PAGE */}
        {activeSection === 'kravmag' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Krav Mag AJL
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.kravmag?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'kravmag', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Krav Mag AJL"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.kravmag?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'kravmag', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="La Méthode Jacques Levinet"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.kravmag?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'kravmag', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.kravmag?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'kravmag', 'hero_image', url)}
                />
                <ImageUploader
                  label="Image Contenu"
                  value={content.pages?.kravmag?.content_image || ''}
                  onChange={(url) => updateNestedField('pages', 'kravmag', 'content_image', url)}
                />
                <ImageUploader
                  label="Image Secondaire"
                  value={content.pages?.kravmag?.secondary_image || ''}
                  onChange={(url) => updateNestedField('pages', 'kravmag', 'secondary_image', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* EDITIONS AJL PAGE */}
        {activeSection === 'editions' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Éditions AJL
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.editions?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'editions', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Éditions AJL"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.editions?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'editions', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Publications et Ouvrages"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.editions?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'editions', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.editions?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'editions', 'hero_image', url)}
                />
                <ImageUploader
                  label="Couverture Livre Principal"
                  value={content.pages?.editions?.featured_book_image || ''}
                  onChange={(url) => updateNestedField('pages', 'editions', 'featured_book_image', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* JOIN PAGE */}
        {activeSection === 'join' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Nous Rejoindre
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.join?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'join', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Nous Rejoindre"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.join?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'join', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Devenez Membre"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.join?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'join', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.join?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'join', 'hero_image', url)}
                />
                <ImageUploader
                  label="Image Avantages"
                  value={content.pages?.join?.benefits_image || ''}
                  onChange={(url) => updateNestedField('pages', 'join', 'benefits_image', url)}
                />
                <ImageUploader
                  label="Background CTA"
                  value={content.pages?.join?.cta_background || ''}
                  onChange={(url) => updateNestedField('pages', 'join', 'cta_background', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* FIND CLUB PAGE */}
        {activeSection === 'find_club' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Trouver un Club
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.find_club?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'find_club', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Trouver un Club"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.find_club?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'find_club', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Clubs Partenaires"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.find_club?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'find_club', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.find_club?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'find_club', 'hero_image', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* SHOP PAGE */}
        {activeSection === 'shop' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Page Boutique
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Titre</Label>
                  <Input
                    value={content.pages?.shop?.title || ''}
                    onChange={(e) => updateNestedField('pages', 'shop', 'title', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Boutique"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Sous-titre</Label>
                  <Input
                    value={content.pages?.shop?.subtitle || ''}
                    onChange={(e) => updateNestedField('pages', 'shop', 'subtitle', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    placeholder="Équipements et Produits"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Description</Label>
                  <Textarea
                    value={content.pages?.shop?.description || ''}
                    onChange={(e) => updateNestedField('pages', 'shop', 'description', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                    rows={4}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUploader
                  label="Image Hero"
                  value={content.pages?.shop?.hero_image || ''}
                  onChange={(url) => updateNestedField('pages', 'shop', 'hero_image', url)}
                />
                <ImageUploader
                  label="Bannière Promotionnelle"
                  value={content.pages?.shop?.banner_image || ''}
                  onChange={(url) => updateNestedField('pages', 'shop', 'banner_image', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT SECTION */}
        {activeSection === 'contact' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Informations de Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                  <Input
                    value={content.contact?.email || ''}
                    onChange={(e) => updateField('contact', 'email', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary flex items-center gap-2"><Phone className="w-4 h-4" /> Téléphone</Label>
                  <Input
                    value={content.contact?.phone || ''}
                    onChange={(e) => updateField('contact', 'phone', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary flex items-center gap-2"><MapPin className="w-4 h-4" /> Adresse</Label>
                  <Input
                    value={content.contact?.address || ''}
                    onChange={(e) => updateField('contact', 'address', e.target.value)}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL SECTION */}
        {activeSection === 'social' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Réseaux Sociaux
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-text-secondary flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</Label>
                <Input
                  value={content.social_links?.facebook || ''}
                  onChange={(e) => updateField('social_links', 'facebook', e.target.value)}
                  className="mt-1 bg-background border-white/10"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label className="text-text-secondary flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</Label>
                <Input
                  value={content.social_links?.instagram || ''}
                  onChange={(e) => updateField('social_links', 'instagram', e.target.value)}
                  className="mt-1 bg-background border-white/10"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label className="text-text-secondary flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube</Label>
                <Input
                  value={content.social_links?.youtube || ''}
                  onChange={(e) => updateField('social_links', 'youtube', e.target.value)}
                  className="mt-1 bg-background border-white/10"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <Label className="text-text-secondary flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                <Input
                  value={content.social_links?.linkedin || ''}
                  onChange={(e) => updateField('social_links', 'linkedin', e.target.value)}
                  className="mt-1 bg-background border-white/10"
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <Label className="text-text-secondary flex items-center gap-2"><Twitter className="w-4 h-4" /> X (Twitter)</Label>
                <Input
                  value={content.social_links?.twitter || ''}
                  onChange={(e) => updateField('social_links', 'twitter', e.target.value)}
                  className="mt-1 bg-background border-white/10"
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* IMAGES GLOBALES */}
        {activeSection === 'images' && (
          <div className="bg-paper rounded-xl border border-white/10 p-6 space-y-6">
            <h2 className="font-oswald text-xl text-text-primary uppercase border-b border-white/10 pb-3">
              Logos & Identité Visuelle
            </h2>
            <p className="text-text-muted text-sm -mt-4 mb-4">Ces éléments apparaissent sur toutes les pages du site</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                label="Logo principal"
                value={content.images?.logo || ''}
                onChange={(url) => updateField('images', 'logo', url)}
              />
              <ImageUploader
                label="Logo blanc (pour fonds sombres)"
                value={content.images?.logo_white || ''}
                onChange={(url) => updateField('images', 'logo_white', url)}
              />
              <ImageUploader
                label="Favicon"
                value={content.images?.favicon || ''}
                onChange={(url) => updateField('images', 'favicon', url)}
              />
              <ImageUploader
                label="Image Open Graph (partage réseaux sociaux)"
                value={content.images?.og_image || ''}
                onChange={(url) => updateField('images', 'og_image', url)}
              />
            </div>

            {/* Logos des organisations */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-oswald text-lg text-primary uppercase mb-4">
                🏛️ Logos des Organisations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImageUploader
                  label="Logo WKMO"
                  value={content.images?.logo_wkmo || ''}
                  onChange={(url) => updateField('images', 'logo_wkmo', url)}
                  placeholder="World Krav Maga Organization"
                />
                <ImageUploader
                  label="Logo IPC"
                  value={content.images?.logo_ipc || ''}
                  onChange={(url) => updateField('images', 'logo_ipc', url)}
                  placeholder="International Police Confederation"
                />
                <ImageUploader
                  label="Logo SPK"
                  value={content.images?.logo_spk || ''}
                  onChange={(url) => updateField('images', 'logo_spk', url)}
                  placeholder="Self Pro Krav"
                />
              </div>
            </div>

            {/* Images International */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-oswald text-lg text-primary uppercase mb-4">
                🌍 Images Internationales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader
                  label="Globe AJL-WKMO-IPC"
                  value={content.images?.globe_international || ''}
                  onChange={(url) => updateField('images', 'globe_international', url)}
                  placeholder="Globe avec logos AJL WKMO IPC"
                />
                <ImageUploader
                  label="Carte Mondiale"
                  value={content.images?.world_map || ''}
                  onChange={(url) => updateField('images', 'world_map', url)}
                  placeholder="Carte AJL-WKMO-IPC Worldwide"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer copyright */}
        <div className="bg-paper rounded-xl border border-white/10 p-6">
          <h2 className="font-oswald text-lg text-text-primary uppercase mb-4">Pied de Page</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-text-secondary">Tagline</Label>
              <Input
                value={content.footer?.tagline || ''}
                onChange={(e) => updateField('footer', 'tagline', e.target.value)}
                className="mt-1 bg-background border-white/10"
                placeholder="Académie Jacques Levinet – World Krav Maga Organization – International Police Confederation"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Copyright</Label>
              <Input
                value={content.footer?.copyright || ''}
                onChange={(e) => updateField('footer', 'copyright', e.target.value)}
                className="mt-1 bg-background border-white/10"
                placeholder="© 2025 Académie Jacques Levinet. Tous droits réservés."
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteContentPage;
