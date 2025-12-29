import React from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { Award, CheckCircle, Lock, ChevronRight, Star, Target, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';

const MemberGrades = () => {
  const currentGrade = {
    name: 'Ceinture Orange',
    since: '2024-06-15',
    nextGrade: 'Ceinture Verte',
    progress: 65
  };

  const grades = [
    { name: 'Ceinture Blanche', color: '#E5E7EB', achieved: true, date: '2024-01-15' },
    { name: 'Ceinture Jaune', color: '#FBBF24', achieved: true, date: '2024-03-20' },
    { name: 'Ceinture Orange', color: '#F97316', achieved: true, date: '2024-06-15', current: true },
    { name: 'Ceinture Verte', color: '#22C55E', achieved: false },
    { name: 'Ceinture Bleue', color: '#3B82F6', achieved: false },
    { name: 'Ceinture Marron', color: '#B45309', achieved: false },
    { name: 'Ceinture Noire 1er Dan', color: '#1F2937', achieved: false },
  ];

  const requirements = [
    { name: 'Cours suivis (min. 20)', current: 12, required: 20, completed: false },
    { name: 'Techniques de base', current: 5, required: 5, completed: true },
    { name: 'Défense mains nues', current: 4, required: 5, completed: false },
    { name: 'Stage obligatoire', current: 1, required: 1, completed: true },
    { name: 'Examen théorique', current: 0, required: 1, completed: false },
  ];

  const achievements = [
    { name: 'Premier Cours', icon: Star, unlocked: true },
    { name: '10 Cours', icon: Target, unlocked: true },
    { name: '50 Cours', icon: TrendingUp, unlocked: false },
    { name: 'Premier Stage', icon: Award, unlocked: true },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Mes Grades
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Suivez votre progression et préparez votre prochain passage de grade
          </p>
        </div>

        {/* Current Grade Card */}
        <div className="bg-paper rounded-xl border border-white/5 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F9731620' }}
              >
                <div 
                  className="w-14 h-14 rounded-lg"
                  style={{ backgroundColor: '#F97316' }}
                ></div>
              </div>
              <div>
                <p className="text-text-muted text-sm">Grade Actuel</p>
                <h2 className="font-oswald text-3xl text-text-primary uppercase">{currentGrade.name}</h2>
                <p className="text-text-muted text-sm mt-1">Obtenu le {new Date(currentGrade.since).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-sm">Prochain grade</p>
              <p className="font-oswald text-xl text-green-500">{currentGrade.nextGrade}</p>
              <p className="text-text-muted text-sm">{currentGrade.progress}% complété</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all"
                style={{ width: `${currentGrade.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-xl text-text-primary uppercase mb-6">Parcours</h3>
              
              <div className="space-y-4">
                {grades.map((grade, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      grade.current 
                        ? 'bg-primary/10 border-primary/30' 
                        : grade.achieved 
                          ? 'bg-white/5 border-white/10' 
                          : 'bg-transparent border-white/5 opacity-50'
                    }`}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${grade.color}30` }}
                    >
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: grade.color }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-oswald text-text-primary">{grade.name}</h4>
                        {grade.current && (
                          <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">Actuel</span>
                        )}
                      </div>
                      {grade.achieved && grade.date && (
                        <p className="text-text-muted text-sm">Obtenu le {new Date(grade.date).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                    {grade.achieved ? (
                      <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                    ) : (
                      <Lock className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements & Achievements */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Prérequis Ceinture Verte</h3>
              <div className="space-y-3">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {req.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-white/20"></div>
                      )}
                      <span className={`text-sm ${req.completed ? 'text-text-primary' : 'text-text-muted'}`}>
                        {req.name}
                      </span>
                    </div>
                    <span className={`text-sm font-oswald ${req.completed ? 'text-green-500' : 'text-primary'}`}>
                      {req.current}/{req.required}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-primary hover:bg-primary-dark">
                Demander un passage de grade
              </Button>
            </div>

            {/* Achievements */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg text-center ${
                      badge.unlocked ? 'bg-primary/10' : 'bg-white/5 opacity-50'
                    }`}
                  >
                    <badge.icon 
                      className={`w-8 h-8 mx-auto mb-2 ${
                        badge.unlocked ? 'text-primary' : 'text-text-muted'
                      }`} 
                      strokeWidth={1.5} 
                    />
                    <p className="text-xs text-text-primary">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGrades;
