import React, { useState } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { Calendar, Clock, MapPin, Users, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

const MemberCourses = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  const schedule = {
    1: [ // Monday
      { time: '19:00', title: 'SPK Débutants', instructor: 'M. Martin', location: 'Salle A', enrolled: true },
      { time: '20:30', title: 'SPK Intermédiaires', instructor: 'M. Martin', location: 'Salle A', enrolled: false },
    ],
    2: [ // Tuesday
      { time: '18:30', title: 'SFJL - Défense Féminine', instructor: 'Mme. Dubois', location: 'Salle B', enrolled: false },
      { time: '20:00', title: 'SPK Avancés', instructor: 'M. Levinet', location: 'Salle A', enrolled: false },
    ],
    3: [ // Wednesday
      { time: '14:00', title: 'Cours Enfants', instructor: 'M. Garcia', location: 'Salle C', enrolled: false },
      { time: '19:00', title: 'SPK Débutants', instructor: 'M. Martin', location: 'Salle A', enrolled: true },
    ],
    4: [ // Thursday
      { time: '19:00', title: 'Techniques Avancées', instructor: 'M. Levinet', location: 'Salle A', enrolled: true },
      { time: '20:30', title: 'Sparring', instructor: 'M. Martin', location: 'Salle A', enrolled: false },
    ],
    5: [ // Friday
      { time: '18:30', title: 'SPK Tous Niveaux', instructor: 'M. Martin', location: 'Salle A', enrolled: true },
      { time: '20:00', title: 'IPC Professionnels', instructor: 'M. Levinet', location: 'Salle B', enrolled: false },
    ],
    6: [ // Saturday
      { time: '10:00', title: 'Stage Mensuel', instructor: 'M. Levinet', location: 'Grande Salle', enrolled: true },
    ],
    0: [] // Sunday - no classes
  };

  const attendanceHistory = [
    { date: '15/12/2024', course: 'SPK Débutants', status: 'present' },
    { date: '14/12/2024', course: 'Stage Mensuel', status: 'present' },
    { date: '13/12/2024', course: 'Techniques Avancées', status: 'present' },
    { date: '11/12/2024', course: 'SPK Débutants', status: 'present' },
    { date: '10/12/2024', course: 'SPK Tous Niveaux', status: 'absent' },
    { date: '08/12/2024', course: 'SPK Débutants', status: 'present' },
  ];

  const getDateForDay = (dayIndex) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = dayIndex - currentDay + (currentWeek * 7);
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date.getDate();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Mes Cours
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Consultez votre planning et inscrivez-vous aux cours
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Week Navigation */}
            <div className="bg-paper rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-oswald text-lg text-text-primary uppercase">
                  {currentWeek === 0 ? 'Cette Semaine' : currentWeek > 0 ? `Semaine +${currentWeek}` : `Semaine ${currentWeek}`}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Days */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      selectedDay === idx 
                        ? 'bg-primary text-white' 
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-manrope">{day}</p>
                    <p className="font-oswald text-lg mt-1">{getDateForDay(idx)}</p>
                    {schedule[idx]?.some(c => c.enrolled) && (
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${selectedDay === idx ? 'bg-white' : 'bg-primary'}`}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Schedule */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-xl text-text-primary uppercase mb-4">
                {weekDays[selectedDay]} {getDateForDay(selectedDay)} Décembre
              </h3>
              
              {schedule[selectedDay]?.length > 0 ? (
                <div className="space-y-4">
                  {schedule[selectedDay].map((course, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        course.enrolled 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            <span className="font-oswald text-primary">{course.time}</span>
                            {course.enrolled && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Inscrit
                              </span>
                            )}
                          </div>
                          <h4 className="font-oswald text-lg text-text-primary">{course.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" strokeWidth={1.5} />
                              {course.instructor}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" strokeWidth={1.5} />
                              {course.location}
                            </span>
                          </div>
                        </div>
                        {!course.enrolled && (
                          <Button size="sm" className="bg-primary hover:bg-primary-dark">
                            S'inscrire
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" strokeWidth={1} />
                  <p className="text-text-muted font-manrope">Pas de cours ce jour</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Stats & History */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Ce Mois</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="font-oswald text-3xl text-primary">8</p>
                  <p className="text-xs text-text-muted">Cours suivis</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="font-oswald text-3xl text-accent">4</p>
                  <p className="text-xs text-text-muted">À venir</p>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4">Historique</h3>
              <div className="space-y-3">
                {attendanceHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-text-primary font-manrope text-sm">{item.course}</p>
                      <p className="text-xs text-text-muted">{item.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.status === 'present' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status === 'present' ? 'Présent' : 'Absent'}
                    </span>
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

export default MemberCourses;
