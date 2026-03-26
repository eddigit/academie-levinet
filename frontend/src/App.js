import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import ChatWidget from './components/ChatWidget';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteContentProvider } from './context/SiteContentContext';
import CartDrawer from './components/CartDrawer';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const MemberDetailPage = lazy(() => import('./pages/MemberDetailPage'));
const TechnicalDirectorsPage = lazy(() => import('./pages/TechnicalDirectorsPage'));
const InstructorsPage = lazy(() => import('./pages/InstructorsPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const FounderPage = lazy(() => import('./pages/FounderPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DisciplineSPKPage = lazy(() => import('./pages/DisciplineSPKPage'));
const DisciplineWKMOPage = lazy(() => import('./pages/DisciplineWKMOPage'));
const DisciplineSFJLPage = lazy(() => import('./pages/DisciplineSFJLPage'));
const DisciplineIPCPage = lazy(() => import('./pages/DisciplineIPCPage'));
const DisciplineCannePage = lazy(() => import('./pages/DisciplineCannePage'));
const DisciplineEnfantPage = lazy(() => import('./pages/DisciplineEnfantPage'));
const DisciplineBatonPage = lazy(() => import('./pages/DisciplineBatonPage'));
const PedagogyPage = lazy(() => import('./pages/PedagogyPage'));
const InternationalPage = lazy(() => import('./pages/InternationalPage'));
const KravMagAJLPage = lazy(() => import('./pages/KravMagAJLPage'));
const EditionsAJLPage = lazy(() => import('./pages/EditionsAJLPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const FindClubPage = lazy(() => import('./pages/FindClubPage'));
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const MemberProfile = lazy(() => import('./pages/member/MemberProfile'));
const MemberMessages = lazy(() => import('./pages/member/MemberMessages'));
const MemberPrograms = lazy(() => import('./pages/member/MemberPrograms'));
const MemberCourses = lazy(() => import('./pages/member/MemberCourses'));
const MemberCommunity = lazy(() => import('./pages/member/MemberCommunity'));
const MemberGrades = lazy(() => import('./pages/member/MemberGrades'));
const MemberSettingsPage = lazy(() => import('./pages/member/MemberSettingsPage'));
const MemberShopPage = lazy(() => import('./pages/member/MemberShopPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const PublicEventsPage = lazy(() => import('./pages/PublicEventsPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const DashboardShopPage = lazy(() => import('./pages/DashboardShopPage'));
const PendingMembersPage = lazy(() => import('./pages/PendingMembersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AIConfigPage = lazy(() => import('./pages/AIConfigPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage'));
const SiteContentPage = lazy(() => import('./pages/SiteContentPage'));
const ClubsPage = lazy(() => import('./pages/ClubsPage'));
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'));
const AdminPartnersPage = lazy(() => import('./pages/admin/AdminPartnersPage'));
const AdminForumsPage = lazy(() => import('./pages/admin/AdminForumsPage'));
const AdminSponsorsPage = lazy(() => import('./pages/admin/AdminSponsorsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OnlineStudentsPage = lazy(() => import('./pages/OnlineStudentsPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-text-primary font-oswald text-xl">Chargement...</div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/founder" element={<FounderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/disciplines/spk" element={<DisciplineSPKPage />} />
          <Route path="/disciplines/wkmo" element={<DisciplineWKMOPage />} />
          <Route path="/disciplines/sfjl" element={<DisciplineSFJLPage />} />
          <Route path="/disciplines/ipc" element={<DisciplineIPCPage />} />
          <Route path="/disciplines/canne" element={<DisciplineCannePage />} />
          <Route path="/disciplines/enfant" element={<DisciplineEnfantPage />} />
          <Route path="/disciplines/baton" element={<DisciplineBatonPage />} />
          <Route path="/pedagogy" element={<PedagogyPage />} />
          <Route path="/international" element={<InternationalPage />} />
          <Route path="/kravmag" element={<KravMagAJLPage />} />
          <Route path="/editions" element={<EditionsAJLPage />} />
          <Route path="/evenements" element={<PublicEventsPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/trouver-club" element={<FindClubPage />} />
          <Route path="/club/:clubId" element={<ClubDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boutique" element={<ShopPage />} />
          
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
          
          <Route path="/member/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member/profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
          <Route path="/member/messages" element={<ProtectedRoute><MemberMessages /></ProtectedRoute>} />
          <Route path="/member/programs" element={<ProtectedRoute><MemberPrograms /></ProtectedRoute>} />
          <Route path="/member/courses" element={<ProtectedRoute><MemberCourses /></ProtectedRoute>} />
          <Route path="/member/community" element={<ProtectedRoute><MemberCommunity /></ProtectedRoute>} />
          <Route path="/member/grades" element={<ProtectedRoute><MemberGrades /></ProtectedRoute>} />
          <Route path="/member/settings" element={<ProtectedRoute><MemberSettingsPage /></ProtectedRoute>} />
          <Route path="/member/boutique" element={<ProtectedRoute><MemberShopPage /></ProtectedRoute>} />
          <Route path="/member/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        </Routes>
      </Suspense>
      <ChatWidgetWrapper />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteContentProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SiteContentProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
