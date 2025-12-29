import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import ChatWidget from './components/ChatWidget';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import TechnicalDirectorsPage from './pages/TechnicalDirectorsPage';
import InstructorsPage from './pages/InstructorsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import LeadsPage from './pages/LeadsPage';
import TasksPage from './pages/TasksPage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
// New public pages
import FounderPage from './pages/FounderPage';
import AboutPage from './pages/AboutPage';
import DisciplineSPKPage from './pages/DisciplineSPKPage';
import DisciplineWKMOPage from './pages/DisciplineWKMOPage';
import DisciplineSFJLPage from './pages/DisciplineSFJLPage';
import DisciplineIPCPage from './pages/DisciplineIPCPage';
import PedagogyPage from './pages/PedagogyPage';
import InternationalPage from './pages/InternationalPage';
import JoinPage from './pages/JoinPage';
import FindClubPage from './pages/FindClubPage';
import ClubDetailPage from './pages/ClubDetailPage';
import MessagingPage from './pages/MessagingPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
// Member Area pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberMessages from './pages/member/MemberMessages';
import MemberPrograms from './pages/member/MemberPrograms';
import MemberCourses from './pages/member/MemberCourses';
import MemberCommunity from './pages/member/MemberCommunity';
import MemberGrades from './pages/member/MemberGrades';
import MemberShopPage from './pages/member/MemberShopPage';
import WalletPage from './pages/WalletPage';
// Shop pages
import ShopPage from './pages/ShopPage';
import AdminProductsPage from './pages/AdminProductsPage';
import DashboardShopPage from './pages/DashboardShopPage';
// Admin pages
import PendingMembersPage from './pages/PendingMembersPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AIConfigPage from './pages/AIConfigPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import SiteContentPage from './pages/SiteContentPage';
import ClubsPage from './pages/ClubsPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminPartnersPage from './pages/admin/AdminPartnersPage';
import AdminForumsPage from './pages/admin/AdminForumsPage';
import AdminSponsorsPage from './pages/admin/AdminSponsorsPage';
import ProfilePage from './pages/ProfilePage';
import OnlineStudentsPage from './pages/OnlineStudentsPage';
// Payment pages
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
// Components
import CartDrawer from './components/CartDrawer';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-primary font-oswald text-xl">Chargement...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Component to render chat widget based on location
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Pages where we don't show any chat
  const noChat = ['/login', '/onboarding', '/payment/success', '/payment/cancel'];
  if (noChat.some(path => location.pathname.startsWith(path))) {
    return null;
  }
  
  // Member pages - show member assistant
  if (location.pathname.startsWith('/member')) {
    return <ChatWidget type="member" />;
  }
  
  // Admin pages - no chat widget for admins (they have full access)
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard') || 
      location.pathname.startsWith('/members') || location.pathname.startsWith('/technical-directors') ||
      location.pathname.startsWith('/subscriptions') || location.pathname.startsWith('/leads') ||
      location.pathname.startsWith('/news') || location.pathname.startsWith('/events') ||
      location.pathname.startsWith('/messages')) {
    return null;
  }
  
  // Public pages - show visitor assistant
  return <ChatWidget type="visitor" />;
};

// Main App Content with Routes
const AppContent = () => {
  return (
    <>
      <CartDrawer />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/founder" element={<FounderPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/disciplines/spk" element={<DisciplineSPKPage />} />
        <Route path="/disciplines/wkmo" element={<DisciplineWKMOPage />} />
        <Route path="/disciplines/sfjl" element={<DisciplineSFJLPage />} />
        <Route path="/disciplines/ipc" element={<DisciplineIPCPage />} />
        <Route path="/pedagogy" element={<PedagogyPage />} />
        <Route path="/international" element={<InternationalPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/trouver-club" element={<FindClubPage />} />
        <Route path="/club/:clubId" element={<ClubDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/boutique" element={<ShopPage />} />
        
        {/* Protected admin routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
        <Route path="/members/:memberId" element={<ProtectedRoute><MemberDetailPage /></ProtectedRoute>} />
        <Route path="/technical-directors" element={<ProtectedRoute><TechnicalDirectorsPage /></ProtectedRoute>} />
        <Route path="/instructors" element={<ProtectedRoute><InstructorsPage /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute><ClubsPage /></ProtectedRoute>} />
        <Route path="/online-students" element={<ProtectedRoute><OnlineStudentsPage /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><DashboardShopPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/stats" element={<ProtectedRoute><AdminStatsPage /></ProtectedRoute>} />
        <Route path="/admin/partners" element={<ProtectedRoute><AdminPartnersPage /></ProtectedRoute>} />
        <Route path="/admin/forums" element={<ProtectedRoute><AdminForumsPage /></ProtectedRoute>} />
        <Route path="/admin/sponsors" element={<ProtectedRoute><AdminSponsorsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessagesPage /></ProtectedRoute>} />
        <Route path="/admin/pending-members" element={<ProtectedRoute><PendingMembersPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/ai-config" element={<ProtectedRoute><AIConfigPage /></ProtectedRoute>} />
        <Route path="/admin/subscriptions" element={<ProtectedRoute><SubscriptionManagementPage /></ProtectedRoute>} />
        <Route path="/admin/site-content" element={<ProtectedRoute><SiteContentPage /></ProtectedRoute>} />
        
        {/* Member Area routes */}
        <Route path="/member/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
        <Route path="/member/profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
        <Route path="/member/messages" element={<ProtectedRoute><MemberMessages /></ProtectedRoute>} />
        <Route path="/member/programs" element={<ProtectedRoute><MemberPrograms /></ProtectedRoute>} />
        <Route path="/member/courses" element={<ProtectedRoute><MemberCourses /></ProtectedRoute>} />
        <Route path="/member/community" element={<ProtectedRoute><MemberCommunity /></ProtectedRoute>} />
        <Route path="/member/grades" element={<ProtectedRoute><MemberGrades /></ProtectedRoute>} />
        <Route path="/member/boutique" element={<ProtectedRoute><MemberShopPage /></ProtectedRoute>} />
        <Route path="/member/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        
        {/* Payment pages */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      </Routes>
      <ChatWidgetWrapper />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
