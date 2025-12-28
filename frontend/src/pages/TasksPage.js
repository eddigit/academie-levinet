import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle2, Circle, Trash2, Clock, User, Filter, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'todo', 'done'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Bug', 'Amélioration', 'Intégration'

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const data = response.data || response;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/toggle`);
      const updatedTask = response.data || response;
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Erreur toggle tâche:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (filter === 'todo') {
      filtered = filtered.filter(task => task.status === 'À faire');
    } else if (filter === 'done') {
      filtered = filtered.filter(task => task.status === 'Terminé');
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.task_type === typeFilter);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const todoCount = tasks.filter(t => t.status === 'À faire').length;
  const doneCount = tasks.filter(t => t.status === 'Terminé').length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Bug': return '🐛';
      case 'Amélioration': return '✨';
      case 'Intégration': return '🔧';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Bug': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Amélioration': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'Intégration': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">
            Gestion des Tâches
          </h1>
          <p className="text-text-secondary font-manrope mt-1 text-sm">
            {todoCount} tâche(s) à faire • {doneCount} terminée(s) • {tasks.length} au total
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-paper border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">À faire</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{todoCount}</p>
              </div>
              <Circle className="w-10 h-10 text-yellow-400 opacity-30" />
            </div>
          </div>

          <div className="bg-paper border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Terminées</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{doneCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400 opacity-30" />
            </div>
          </div>

          <div className="bg-paper border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{tasks.length}</p>
              </div>
              <Filter className="w-10 h-10 text-primary opacity-30" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'todo'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              À faire
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'done'
                  ? 'bg-green-500 text-black'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Terminées
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Tous types
            </button>
            <button
              onClick={() => setTypeFilter('Bug')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'Bug'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              🐛 Bugs
            </button>
            <button
              onClick={() => setTypeFilter('Amélioration')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'Amélioration'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              ✨ Améliorations
            </button>
            <button
              onClick={() => setTypeFilter('Intégration')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'Intégration'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              🔧 Intégrations
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-paper border border-white/10 rounded-xl p-12 text-center">
              <Circle className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted font-manrope">Aucune tâche trouvée</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`bg-paper border rounded-xl p-5 transition-all hover:border-primary/30 ${
                  task.status === 'Terminé' ? 'border-green-500/20 opacity-60' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-1 text-text-muted hover:text-primary transition-colors"
                  >
                    {task.status === 'Terminé' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(task.task_type)}`}>
                            {getTypeIcon(task.task_type)} {task.task_type}
                          </span>
                          {task.status === 'Terminé' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 border border-green-500/30 text-green-400">
                              ✓ Terminé
                            </span>
                          )}
                        </div>
                        
                        <h3 className={`text-lg font-semibold mb-2 ${
                          task.status === 'Terminé' ? 'line-through text-text-muted' : 'text-text-primary'
                        }`}>
                          {task.title}
                        </h3>
                        
                        <p className="text-text-secondary text-sm mb-3 whitespace-pre-wrap">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Par: {task.created_by_name}</span>
                          </div>
                          {task.assigned_to_name && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
                              {task.assigned_to_photo ? (
                                <img
                                  src={task.assigned_to_photo}
                                  alt={task.assigned_to_name}
                                  className="w-6 h-6 rounded-full object-cover border border-primary/30"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                  <span className="text-primary text-xs font-bold">
                                    {task.assigned_to_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                              )}
                              <span className="text-primary font-medium">
                                Assigné à: {task.assigned_to_name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(task.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
