import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import TechnicalDirectorsPage from './pages/TechnicalDirectorsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import LeadsPage from './pages/LeadsPage';
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
// Shop pages
import ShopPage from './pages/ShopPage';
import AdminProductsPage from './pages/AdminProductsPage';
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boutique" element={<ShopPage />} />
          
          {/* Protected admin routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/:memberId"
            element={
              <ProtectedRoute>
                <MemberDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technical-directors"
            element={
              <ProtectedRoute>
                <TechnicalDirectorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <NewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Member Area routes */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/profile"
            element={
              <ProtectedRoute>
                <MemberProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/messages"
            element={
              <ProtectedRoute>
                <MemberMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/programs"
            element={
              <ProtectedRoute>
                <MemberPrograms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/courses"
            element={
              <ProtectedRoute>
                <MemberCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/community"
            element={
              <ProtectedRoute>
                <MemberCommunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/grades"
            element={
              <ProtectedRoute>
                <MemberGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/boutique"
            element={
              <ProtectedRoute>
                <MemberShopPage />
              </ProtectedRoute>
            }
          />
          
          {/* Payment pages */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;