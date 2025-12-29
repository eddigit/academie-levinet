import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Coins, Gift, TrendingUp, Trophy, Calendar, Flame, Award, History } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const WalletPage = () => {
  const { getToken } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [rewardsConfig, setRewardsConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [claimMessage, setClaimMessage] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchData();
    }
  }, [getToken]);

  const fetchData = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const [balanceRes, historyRes, leaderboardRes, badgesRes, myBadgesRes, rewardsRes] = await Promise.all([
        fetch(`${API_URL}/api/tokens/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/tokens/history?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/tokens/leaderboard?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/badges/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/tokens/rewards-config`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (balanceRes.ok) setBalance(await balanceRes.json());
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setTransactions(historyData.transactions || historyData || []);
      }
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      }
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);
      }
      if (myBadgesRes.ok) {
        const myBadgesData = await myBadgesRes.json();
        setMyBadges(myBadgesData.badges || []);
      }
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        setRewardsConfig(rewardsData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDaily = async () => {
    setClaiming(true);
    setClaimMessage(null);
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/tokens/claim-daily`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClaimMessage({ type: 'success', text: `+${data.amount} AJL ! Streak: ${data.streak_days} jours` });
        fetchData();
      } else {
        setClaimMessage({ type: 'error', text: data.detail || 'Erreur lors de la réclamation' });
      }
    } catch (error) {
      setClaimMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setClaiming(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      signup_bonus: <Gift className="h-4 w-4" />,
      daily_login: <Calendar className="h-4 w-4" />,
      post_created: <TrendingUp className="h-4 w-4" />,
      comment_added: <TrendingUp className="h-4 w-4" />,
      reaction_received: <Award className="h-4 w-4" />,
      event_participation: <Trophy className="h-4 w-4" />,
      grade_passed: <Trophy className="h-4 w-4" />,
      redeem: <Coins className="h-4 w-4" />
    };
    return icons[actionType] || <Coins className="h-4 w-4" />;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MemberSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header avec solde */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-500" />
            Mon Portefeuille Token AJL
          </h1>
          <p className="text-text-secondary">
            Gagnez des tokens en participant à la communauté
          </p>
        </div>

        {/* Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Solde */}
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Solde Total</p>
                <p className="text-4xl font-bold">{balance?.balance || 0}</p>
                <p className="text-sm opacity-90">Token AJL</p>
              </div>
              <Coins className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Streak Actuel</p>
                <p className="text-3xl font-bold text-orange-500">{balance?.streak_days || 0}</p>
                <p className="text-sm text-gray-500">jours consécutifs</p>
              </div>
              <Flame className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total gagné */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gagné</p>
                <p className="text-3xl font-bold text-green-500">{balance?.total_earned || 0}</p>
                <p className="text-sm text-gray-500">AJL</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Niveau */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Niveau</p>
                <p className="text-3xl font-bold text-purple-500">{balance?.level || 1}</p>
                <p className="text-sm text-gray-500">{balance?.xp || 0} XP</p>
              </div>
              <Trophy className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton Claim Daily */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Bonus Quotidien</h3>
              <p className="text-gray-500">
                Réclamez vos tokens chaque jour pour augmenter votre streak !
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={claimDaily}
                disabled={claiming}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8"
              >
                {claiming ? (
                  <span className="animate-pulse">Réclamation...</span>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Réclamer mon bonus
                  </>
                )}
              </Button>
              {claimMessage && (
                <p className={`text-sm ${claimMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {claimMessage.text}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          <History className="h-4 w-4 inline mr-2" />
          Historique
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 font-medium ${activeTab === 'leaderboard' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          <Trophy className="h-4 w-4 inline mr-2" />
          Classement
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 font-medium ${activeTab === 'badges' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          <Award className="h-4 w-4 inline mr-2" />
          Badges
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-medium ${activeTab === 'rewards' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          <Coins className="h-4 w-4 inline mr-2" />
          Barème
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune transaction pour le moment</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {getActionIcon(tx.action_type)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || tx.action_type}</p>
                        <p className="text-sm text-gray-500">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} AJL
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Classement Token AJL</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Pas encore de classement</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.user_photo ? (
                          <img src={user.user_photo} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.user_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="font-medium">{user.user_name || 'Anonyme'}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      {user.balance} AJL
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Badges ({myBadges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {myBadges.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Pas encore de badges gagnés</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {myBadges.map((userBadge, index) => {
                    const badge = userBadge.badge || userBadge;
                    return (
                      <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-center">
                        <span className="text-4xl mb-2 block">{badge.icon}</span>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-gray-500">Obtenu le {formatDate(userBadge.earned_at)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge, index) => {
                  const owned = myBadges.some(mb => {
                    const mbBadge = mb.badge || mb;
                    return mbBadge.badge_type === badge.badge_type;
                  });
                  return (
                    <div key={index} className={`p-4 rounded-lg text-center ${owned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800 opacity-60'}`}>
                      <span className={`text-4xl mb-2 block ${!owned && 'grayscale'}`}>{badge.icon}</span>
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                      {owned && <span className="text-xs text-green-500">✓ Obtenu</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglet Barème */}
      {activeTab === 'rewards' && rewardsConfig && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                Barème des récompenses Token AJL
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">{rewardsConfig.description}</p>
            </CardHeader>
            <CardContent>
              {/* Récompenses uniques */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-500" />
                  Récompenses uniques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardsConfig.rewards
                    .filter(r => r.category === 'unique')
                    .map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{reward.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{reward.name}</p>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-600">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">AJL</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Récompenses récurrentes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Récompenses récurrentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardsConfig.rewards
                    .filter(r => r.category === 'récurrent')
                    .map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{reward.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{reward.name}</p>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-600">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">AJL</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Actions quotidiennes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Actions quotidiennes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardsConfig.rewards
                    .filter(r => r.category === 'quotidien')
                    .map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{reward.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{reward.name}</p>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                            {reward.daily_limit && (
                              <p className="text-xs text-orange-500 mt-1">Max {reward.daily_limit} AJL/jour</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-600">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">AJL</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Progression */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  Progression & Événements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardsConfig.rewards
                    .filter(r => ['progression', 'activité', 'annuel'].includes(r.category))
                    .map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{reward.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{reward.name}</p>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-600">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">AJL</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Note admin */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">💡 Note :</span> Les récompenses sont configurées par l'administration pour encourager la participation active à la communauté. Le barème peut évoluer avec le temps.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Token rapide */}
      {rewardsConfig && (
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              Actions rapides pour gagner des {rewardsConfig.currency_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Consultez l'onglet "Barème" pour voir toutes les récompenses disponibles</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {rewardsConfig.rewards
                .filter(r => ['quotidien', 'récurrent'].includes(r.category))
                .slice(0, 4)
                .map((reward, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">{reward.name}</p>
                      <p className="font-bold text-yellow-600">+{reward.amount} AJL</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      </main>
    </div>
  );
};

export default WalletPage;
