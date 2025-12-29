import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Users, CheckCircle, ChevronRight, Star, GraduationCap } from 'lucide-react';

const PedagogyPage = () => {
  const grades = [
    { level: 'Ceinture Blanche', dan: 'Débutant', description: 'Initiation aux fondamentaux', color: 'white' },
    { level: 'Ceinture Jaune', dan: 'Débutant', description: 'Bases techniques maîtrisées', color: 'yellow-400' },
    { level: 'Ceinture Orange', dan: 'Débutant', description: 'Techniques intermédiaires', color: 'orange-400' },
    { level: 'Ceinture Verte', dan: 'Débutant', description: 'Niveau confirmé', color: 'green-500' },
    { level: 'Ceinture Bleue', dan: 'Débutant', description: 'Niveau avancé', color: 'blue-500' },
    { level: 'Ceinture Marron', dan: 'Débutant', description: 'Préparation au Dan', color: 'amber-700' },
    { level: 'Ceinture Noire', dan: '1er à 10ème Dan', description: 'Expert certifié', color: 'gray-900' },
  ];

  const pedagogyFeatures = [
    { icon: BookOpen, title: 'Programmes Structurés', description: 'Cahiers techniques et pédagogiques définis pour chaque discipline et niveau.' },
    { icon: GraduationCap, title: 'Supports Pédagogiques', description: 'Supports pédagogiques imprimés (papier), numériques, vidéos et PDF téléchargeables.' },
    { icon: Award, title: 'Commission des Grades', description: 'Qualifications professionnelles par contrat ou convention. Instance de validation.' },
    { icon: Users, title: 'Instructeurs Certifiés', description: 'Réseau mondial d\'instructeurs formés et validés par l\'Académie.' },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-sm mb-6">
            <span className="text-accent font-oswald text-sm uppercase tracking-wider">Formation</span>
          </div>
          
          <h1 className="font-oswald text-5xl md:text-6xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Pédagogie & <span className="text-accent">Grades</span>
          </h1>
          
          <p className="text-xl text-text-secondary font-manrope mb-8 leading-relaxed max-w-3xl mx-auto">
            Un système de formation structuré et des certifications reconnues mondialement. 
            Progressez à votre rythme avec l'accompagnement de l'Académie.
          </p>
        </div>
      </section>

      {/* Pedagogy Features Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-12 tracking-tight">
            Notre <span className="text-accent">Approche</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pedagogyFeatures.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent/50 transition-colors text-center">
                <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-oswald text-lg font-bold text-white uppercase mb-2">{item.title}</h3>
                <p className="text-text-muted font-manrope text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grades System Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-oswald text-4xl font-bold text-center text-text-primary uppercase mb-4 tracking-tight">
            Système de <span className="text-accent">Grades</span>
          </h2>
          <p className="text-center text-text-secondary font-manrope mb-12 max-w-2xl mx-auto">
            Progressez du débutant au 10ème Dan avec notre système de certification structuré.
          </p>
          
          <div className="space-y-4">
            {grades.map((grade, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
                <div className={`w-12 h-12 rounded-lg bg-${grade.color} flex items-center justify-center flex-shrink-0 ${grade.color === 'white' ? 'border border-gray-300' : ''}`}>
                  <Star className={`w-6 h-6 ${grade.color === 'white' || grade.color === 'yellow-400' ? 'text-gray-800' : 'text-white'}`} strokeWidth={1.5} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-oswald text-lg text-white uppercase">{grade.level}</h3>
                    <span className="font-mono text-accent text-sm">{grade.dan}</span>
                  </div>
                  <p className="text-text-muted font-manrope text-sm">{grade.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission des Grades Section */}
      <section className="py-20 px-6 bg-paper">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
                La Commission des <span className="text-accent">Grades</span>
              </h2>
              <p className="text-text-secondary font-manrope text-lg leading-relaxed mb-6">
                Instance officielle de validation des grades au sein de l'Académie Jacques Levinet. 
                Elle garantit la cohérence et la valeur des certifications délivrées.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">Évaluation technique rigoureuse</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">Validation par des experts internationaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">Reconnaissance mondiale des diplômes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-text-secondary font-manrope">Qualifications professionnelles (ROS)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-8 text-center">
              <Award className="w-16 h-16 text-accent mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-oswald text-2xl text-white uppercase mb-4">Valeur Professionnelle</h3>
              <p className="text-text-secondary font-manrope mb-6">
                Les Dan de Self-Pro Krav constituent de véritables qualifications professionnelles, 
                reconnues par les instances internationales et les employeurs du secteur de la sécurité.
              </p>
              <p className="font-mono text-accent text-sm">
                Certifié AJL · WKMO · IPC
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* E-Learning Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Formation <span className="text-accent">E-Learning</span>
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8 max-w-2xl mx-auto">
            Accédez à notre bibliothèque complète de supports pédagogiques, vidéos et PDF téléchargeables 
            où que vous soyez, à votre rythme.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <p className="font-oswald text-4xl text-accent font-bold">50+</p>
              <p className="text-text-muted font-manrope text-sm">Ressources</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <p className="font-oswald text-4xl text-accent font-bold">HD</p>
              <p className="text-text-muted font-manrope text-sm">Qualité Vidéo</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <p className="font-oswald text-4xl text-accent font-bold">24/7</p>
              <p className="text-text-muted font-manrope text-sm">Accès Illimité</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <p className="font-oswald text-4xl text-accent font-bold">3</p>
              <p className="text-text-muted font-manrope text-sm">Langues</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-oswald text-4xl font-bold text-text-primary uppercase mb-6 tracking-tight">
            Commencez Votre Parcours
          </h2>
          <p className="text-text-secondary font-manrope text-lg mb-8">
            Du premier cours à la ceinture noire, nous vous accompagnons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-accent hover:bg-accent/80 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              S'inscrire
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
            <Link
              to="/disciplines/spk"
              className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-oswald uppercase leading-none tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Découvrir le SPK
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PedagogyPage;