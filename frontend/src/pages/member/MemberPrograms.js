import React, { useState } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { BookOpen, Play, CheckCircle, Lock, ChevronRight, Clock, Award } from 'lucide-react';
import { Button } from '../../components/ui/button';

const MemberPrograms = () => {
  const [selectedModule, setSelectedModule] = useState(null);

  const programs = [
    {
      id: 1,
      title: 'Module 1 - Fondamentaux SPK',
      description: 'Les bases de la self-défense : postures, déplacements, et principes fondamentaux.',
      progress: 100,
      lessons: 8,
      completedLessons: 8,
      duration: '2h30',
      unlocked: true,
      videos: [
        { title: 'Introduction au SPK', duration: '15min', completed: true },
        { title: 'Les postures de base', duration: '20min', completed: true },
        { title: 'Déplacements et équilibre', duration: '18min', completed: true },
        { title: 'La garde SPK', duration: '22min', completed: true },
      ]
    },
    {
      id: 2,
      title: 'Module 2 - Défense mains nues',
      description: 'Techniques de défense contre les attaques à mains nues : saisies, frappes, étranglements.',
      progress: 75,
      lessons: 12,
      completedLessons: 9,
      duration: '3h45',
      unlocked: true,
      videos: [
        { title: 'Défense contre saisie au poignet', duration: '20min', completed: true },
        { title: 'Défense contre saisie au col', duration: '22min', completed: true },
        { title: 'Libération d\'étranglement', duration: '25min', completed: true },
        { title: 'Contre les frappes directes', duration: '18min', completed: false },
      ]
    },
    {
      id: 3,
      title: 'Module 3 - Défense armes blanches',
      description: 'Principes et techniques de défense contre les armes blanches : couteau, bâton.',
      progress: 30,
      lessons: 10,
      completedLessons: 3,
      duration: '3h15',
      unlocked: true,
      videos: [
        { title: 'Introduction défense arme blanche', duration: '15min', completed: true },
        { title: 'Distance et timing', duration: '20min', completed: true },
        { title: 'Défense couteau - bases', duration: '25min', completed: true },
        { title: 'Défense couteau - avancé', duration: '28min', completed: false },
      ]
    },
    {
      id: 4,
      title: 'Module 4 - Situations multiples',
      description: 'Gestion des situations avec plusieurs agresseurs et en environnement contraint.',
      progress: 0,
      lessons: 8,
      completedLessons: 0,
      duration: '2h50',
      unlocked: false,
      videos: []
    },
    {
      id: 5,
      title: 'Module 5 - Self-défense au sol',
      description: 'Techniques de combat au sol et relevés en situation de self-défense.',
      progress: 0,
      lessons: 10,
      completedLessons: 0,
      duration: '3h20',
      unlocked: false,
      videos: []
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Programmes Techniques
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Accédez aux vidéos et ressources pédagogiques de l'Académie
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-paper rounded-xl border border-white/5 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-oswald text-xl text-text-primary uppercase">Progression Globale</h3>
              <p className="text-text-muted text-sm">Niveau: Ceinture Orange</p>
            </div>
            <div className="text-right">
              <p className="font-oswald text-3xl text-primary">41%</p>
              <p className="text-text-muted text-sm">20/49 leçons</p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: '41%' }}></div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div 
              key={program.id}
              className={`bg-paper rounded-xl border overflow-hidden transition-all ${
                program.unlocked 
                  ? 'border-white/5 hover:border-primary/30 cursor-pointer' 
                  : 'border-white/5 opacity-60'
              }`}
              onClick={() => program.unlocked && setSelectedModule(selectedModule === program.id ? null : program.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {program.progress === 100 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                      ) : program.unlocked ? (
                        <Play className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      ) : (
                        <Lock className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                      )}
                      <h3 className="font-oswald text-lg text-text-primary">{program.title}</h3>
                    </div>
                    <p className="text-text-muted text-sm font-manrope">{program.description}</p>
                  </div>
                  {program.unlocked && (
                    <ChevronRight className={`w-5 h-5 text-text-muted transition-transform ${selectedModule === program.id ? 'rotate-90' : ''}`} />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-text-muted">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                    {program.completedLessons}/{program.lessons} leçons
                  </span>
                  <span className="flex items-center gap-1 text-text-muted">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    {program.duration}
                  </span>
                </div>
                
                {program.unlocked && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-muted">Progression</span>
                      <span className="text-primary">{program.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${program.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${program.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Expanded Videos */}
              {selectedModule === program.id && program.videos.length > 0 && (
                <div className="border-t border-white/5 bg-background/50 p-4">
                  <div className="space-y-2">
                    {program.videos.map((video, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-paper rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {video.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                          ) : (
                            <Play className="w-5 h-5 text-primary" strokeWidth={1.5} />
                          )}
                          <span className="text-text-primary font-manrope text-sm">{video.title}</span>
                        </div>
                        <span className="text-text-muted text-xs">{video.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Unlock Notice */}
        <div className="mt-8 bg-primary/10 border border-primary/30 rounded-xl p-6 flex items-start gap-4">
          <Award className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
          <div>
            <h4 className="font-oswald text-primary uppercase">Débloquez plus de contenu</h4>
            <p className="text-text-secondary font-manrope text-sm mt-1">
              Passez au grade supérieur pour accéder aux modules avancés. 
              Complétez vos cours et validez votre passage de grade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPrograms;
