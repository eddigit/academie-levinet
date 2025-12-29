import React, { useState, useEffect } from 'react';
import { Bot, Save, Loader2, ToggleLeft, ToggleRight, RefreshCw, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import api from '../utils/api';
import { toast } from 'sonner';

const AIConfigPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    ai_enabled: true,
    visitor_extra_instructions: '',
    member_extra_instructions: '',
    visitor_base_prompt: '',
    member_base_prompt: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/ai-config');
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching AI config:', error);
      toast.error('Erreur lors du chargement de la configuration');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/ai-config', {
        ai_enabled: config.ai_enabled,
        visitor_extra_instructions: config.visitor_extra_instructions,
        member_extra_instructions: config.member_extra_instructions
      });
      toast.success('Configuration IA mise à jour');
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                <Bot className="w-8 h-8 text-primary" />
                Configuration IA
              </h1>
              <p className="text-text-muted font-manrope mt-1">
                Personnalisez les instructions des assistants IA
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-dark">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>

          {/* AI Toggle */}
          <div className="bg-paper rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-oswald text-xl text-text-primary uppercase">Activer l'assistant IA</h2>
                <p className="text-text-muted text-sm mt-1">
                  Désactivez pour masquer le chat IA sur tout le site
                </p>
              </div>
              <Switch
                checked={config.ai_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, ai_enabled: checked })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitor Assistant */}
            <div className="bg-paper rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-oswald text-lg text-text-primary uppercase">Assistant Visiteurs</h2>
                  <p className="text-text-muted text-xs">Pages publiques</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary text-sm">Instructions de base (non modifiables)</Label>
                  <div className="mt-2 bg-background/50 border border-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-text-muted text-xs whitespace-pre-wrap">{config.visitor_base_prompt?.substring(0, 500)}...</p>
                  </div>
                </div>

                <div>
                  <Label className="text-text-secondary">Instructions supplémentaires</Label>
                  <Textarea
                    value={config.visitor_extra_instructions}
                    onChange={(e) => setConfig({ ...config, visitor_extra_instructions: e.target.value })}
                    className="mt-2 bg-background border-white/10 text-text-primary min-h-[150px]"
                    placeholder="Ajoutez des instructions spécifiques pour l'assistant visiteurs...

Ex: 
- Mentionner la prochaine journée portes ouvertes le 15 janvier
- Proposer un code promo BIENVENUE pour -10%
- Insister sur les cours d'essai gratuits"
                  />
                  <p className="text-text-muted text-xs mt-2">
                    Ces instructions seront ajoutées aux instructions de base
                  </p>
                </div>
              </div>
            </div>

            {/* Member Assistant */}
            <div className="bg-paper rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-oswald text-lg text-text-primary uppercase">Assistant Membres</h2>
                  <p className="text-text-muted text-xs">Espace membre</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary text-sm">Instructions de base (non modifiables)</Label>
                  <div className="mt-2 bg-background/50 border border-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-text-muted text-xs whitespace-pre-wrap">{config.member_base_prompt?.substring(0, 500)}...</p>
                  </div>
                </div>

                <div>
                  <Label className="text-text-secondary">Instructions supplémentaires</Label>
                  <Textarea
                    value={config.member_extra_instructions}
                    onChange={(e) => setConfig({ ...config, member_extra_instructions: e.target.value })}
                    className="mt-2 bg-background border-white/10 text-text-primary min-h-[150px]"
                    placeholder="Ajoutez des instructions spécifiques pour l'assistant membres...

Ex:
- Rappeler le prochain stage le 20 janvier
- Informer de la maintenance prévue le dimanche
- Promouvoir la nouvelle collection de la boutique"
                  />
                  <p className="text-text-muted text-xs mt-2">
                    Ces instructions seront ajoutées aux instructions de base
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="font-oswald text-lg text-blue-400 uppercase mb-3">💡 Conseils</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>• Les modifications sont appliquées immédiatement aux nouvelles conversations</li>
              <li>• Soyez précis et concis dans vos instructions</li>
              <li>• Utilisez des exemples pour guider l'IA sur le ton à adopter</li>
              <li>• Mettez à jour régulièrement pour les événements et promotions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIConfigPage;
