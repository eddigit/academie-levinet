import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, Server, Lock, Save, TestTube, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import api, { getErrorMessage } from '../utils/api';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Académie Jacques Levinet'
  });
  const [passwordSet, setPasswordSet] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings/smtp');
      setSmtpSettings({
        smtp_host: response.data.smtp_host || 'smtp.gmail.com',
        smtp_port: response.data.smtp_port || 587,
        smtp_user: response.data.smtp_user || '',
        smtp_password: '',
        from_email: response.data.from_email || '',
        from_name: response.data.from_name || 'Académie Jacques Levinet'
      });
      setPasswordSet(response.data.smtp_password_set || false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...smtpSettings };
      // Don't send empty password (keep existing)
      if (!dataToSave.smtp_password) {
        delete dataToSave.smtp_password;
      }
      
      await api.put('/admin/settings/smtp', dataToSave);
      toast.success('Paramètres SMTP enregistrés avec succès');
      if (smtpSettings.smtp_password) {
        setPasswordSet(true);
        setSmtpSettings({ ...smtpSettings, smtp_password: '' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      await api.post('/admin/settings/smtp/test');
      toast.success('Email de test envoyé ! Vérifiez votre boîte de réception.');
    } catch (error) {
      console.error('Error testing SMTP:', error);
      toast.error(getErrorMessage(error, 'Échec du test SMTP'));
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Paramètres Techniques
            </h1>
            <p className="text-text-muted font-manrope mt-1">
              Configuration du système et des notifications
            </p>
          </div>

          {/* SMTP Settings Card */}
          <div className="bg-paper rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-oswald text-xl text-text-primary uppercase">Configuration SMTP</h2>
                <p className="text-text-muted text-sm">Paramètres pour l'envoi des emails (notifications, mots de passe)</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Gmail Notice */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Pour Gmail, activez l'<strong>accès aux applications moins sécurisées</strong> ou créez un 
                    <strong> mot de passe d'application</strong> dans les paramètres de sécurité de votre compte Google.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMTP Host */}
                <div>
                  <Label className="text-text-secondary flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4" /> Serveur SMTP
                  </Label>
                  <Input
                    value={smtpSettings.smtp_host}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>

                {/* SMTP Port */}
                <div>
                  <Label className="text-text-secondary mb-2">Port SMTP</Label>
                  <Input
                    type="number"
                    value={smtpSettings.smtp_port}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: parseInt(e.target.value) })}
                    placeholder="587"
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>

                {/* SMTP User */}
                <div>
                  <Label className="text-text-secondary flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" /> Email SMTP (identifiant)
                  </Label>
                  <Input
                    type="email"
                    value={smtpSettings.smtp_user}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                    placeholder="votre-email@gmail.com"
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>

                {/* SMTP Password */}
                <div>
                  <Label className="text-text-secondary flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" /> Mot de passe SMTP
                    {passwordSet && (
                      <span className="text-green-500 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Configuré
                      </span>
                    )}
                  </Label>
                  <Input
                    type="password"
                    value={smtpSettings.smtp_password}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_password: e.target.value })}
                    placeholder={passwordSet ? "••••••••••••" : "Mot de passe d'application"}
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>

                {/* From Email */}
                <div>
                  <Label className="text-text-secondary mb-2">Email d'expédition</Label>
                  <Input
                    type="email"
                    value={smtpSettings.from_email}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, from_email: e.target.value })}
                    placeholder="contact@academie-levinet.com"
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>

                {/* From Name */}
                <div>
                  <Label className="text-text-secondary mb-2">Nom d'expéditeur</Label>
                  <Input
                    value={smtpSettings.from_name}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, from_name: e.target.value })}
                    placeholder="Académie Jacques Levinet"
                    className="bg-background border-white/10 text-text-primary"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
                  )}
                </Button>
                
                <Button
                  onClick={handleTestEmail}
                  disabled={testing || !smtpSettings.smtp_user}
                  variant="outline"
                  className="border-white/10"
                >
                  {testing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                  ) : (
                    <><TestTube className="w-4 h-4 mr-2" /> Tester la configuration</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-paper rounded-xl border border-white/10 p-6">
            <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Guide de configuration Gmail</h3>
            <ol className="space-y-3 text-text-secondary text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Connectez-vous à votre compte Gmail et allez dans <strong>Paramètres &gt; Sécurité</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Activez la <strong>validation en deux étapes</strong> si ce n'est pas déjà fait</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Cliquez sur <strong>Mots de passe des applications</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                <span>Sélectionnez "Autre (nom personnalisé)" et entrez "Académie Levinet"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                <span>Copiez le mot de passe généré (16 caractères) et collez-le ci-dessus</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
