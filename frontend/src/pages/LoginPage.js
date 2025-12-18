import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.password, formData.full_name);
      }

      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 17, 32, 0.7), rgba(11, 17, 32, 0.8)), url('https://images.unsplash.com/photo-1644594570589-ef85bd03169f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxrcmF2JTIwbWFnYSUyMHRyYWluaW5nJTIwY2xhc3N8ZW58MHx8fHwxNzY1NzM2Njg0fDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="font-oswald text-5xl font-bold text-text-primary uppercase mb-6 tracking-wide">
              Académie Jacques Levinet
            </h2>
            <p className="text-xl text-text-secondary font-manrope">
              L'excellence en Self-Pro Krav
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
              alt="Logo" 
              className="w-20 h-20 mx-auto mb-4"
              data-testid="login-logo"
            />
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide mb-2">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="text-text-secondary font-manrope">
              {isLogin ? 'Accédez à votre espace' : 'Créez votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            {!isLogin && (
              <div>
                <label className="block text-sm font-manrope font-medium text-text-secondary mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  data-testid="input-fullname"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-paper border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-manrope"
                  placeholder="Entrez votre nom complet"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-manrope font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                data-testid="input-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-paper border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-manrope"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-manrope font-medium text-text-secondary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-testid="input-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-paper border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-manrope"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  data-testid="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-secondary/10 border border-secondary/50 rounded-md" data-testid="error-message">
                <p className="text-secondary text-sm font-manrope">{error}</p>
              </div>
            )}

            <button
              type="submit"
              data-testid="submit-button"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider rounded-sm transition-smooth glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se Connecter' : 'S\'inscrire')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="toggle-mode-button"
              className="text-text-secondary hover:text-primary font-manrope text-sm transition-smooth"
            >
              {isLogin ? "Pas encore de compte? S'inscrire" : 'Déjà un compte? Se connecter'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" data-testid="back-home-link" className="text-text-secondary hover:text-primary font-manrope text-sm transition-smooth">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;