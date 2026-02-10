import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageLoader } from './components/common/LoadingSpinner';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';

// ─── Public Pages ────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/public/LandingPage'));

// ─── Auth Pages ──────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const TwoFactorAuthPage = lazy(() => import('./pages/auth/TwoFactorAuthPage'));
const PasswordResetSuccessPage = lazy(() => import('./pages/auth/PasswordResetSuccessPage'));
const LogoutPage = lazy(() => import('./pages/auth/LogoutPage'));

// ─── Organizer Pages ────────────────────────────────────
const AnalyticsDashboard = lazy(() => import('./pages/organizer/AnalyticsDashboard'));
const CreateEvent = lazy(() => import('./pages/organizer/CreateEvent'));
const SessionScheduler = lazy(() => import('./pages/organizer/SessionScheduler'));
const BadgeDesigner = lazy(() => import('./pages/organizer/BadgeDesigner'));
const BillingInvoices = lazy(() => import('./pages/organizer/BillingInvoices'));

// ─── Attendee Pages ─────────────────────────────────────
const PersonalHub = lazy(() => import('./pages/attendee/PersonalHub'));
const PWADashboard = lazy(() => import('./pages/attendee/PWADashboard'));
const PersonalizedAgenda = lazy(() => import('./pages/attendee/PersonalizedAgenda'));
const RegistrationTicketing = lazy(() => import('./pages/attendee/RegistrationTicketing'));

// ─── Staff Pages ────────────────────────────────────────
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));

// ─── Admin Pages ────────────────────────────────────────
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const DeploymentStatus = lazy(() => import('./pages/admin/DeploymentStatus'));

// ─── AI Pages ───────────────────────────────────────────
const ChatbotAssistant = lazy(() => import('./pages/ai/ChatbotAssistant'));
const NetworkingMatching = lazy(() => import('./pages/ai/NetworkingMatching'));
const SearchDiscovery = lazy(() => import('./pages/ai/SearchDiscovery'));

// ─── Engagement Pages ───────────────────────────────────
const LivePollsQA = lazy(() => import('./pages/engagement/LivePollsQA'));

// ─── Venue Pages ────────────────────────────────────────
const FloorPlanEditor = lazy(() => import('./pages/venue/FloorPlanEditor'));

// ─── Settings Pages ─────────────────────────────────────
const UserProfile = lazy(() => import('./pages/settings/UserProfile'));
const AccessibilitySettings = lazy(() => import('./pages/settings/AccessibilitySettings'));

// ─── Dashboard redirect based on role ───────────────────
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'organizer':
      return <Navigate to="/organizer/dashboard" replace />;
    case 'attendee':
      return <Navigate to="/attendee/hub" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'super_admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/organizer/dashboard" replace />;
  }
}

// ─── 404 Page ───────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-icons-outlined text-primary text-4xl">search_off</span>
        </div>
        <h1 className="text-4xl font-bold text-charcoal">404</h1>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Go Home
        </a>
      </div>
    </div>
  );
}

// ─── Unauthorized Page ──────────────────────────────────
function Unauthorized() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="material-icons-outlined text-red-500 text-4xl">lock</span>
        </div>
        <h1 className="text-3xl font-bold text-charcoal">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to access this page.</p>
        <a href="/dashboard" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes ────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/registration" element={<RegistrationTicketing />} />

        {/* ── Auth Routes ──────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/2fa" element={<TwoFactorAuthPage />} />
        <Route path="/auth/reset-success" element={<PasswordResetSuccessPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        {/* ── Dashboard Redirect ───────────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* ── Organizer Routes ─────────────────────────── */}
        <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/organizer/events/create" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><CreateEvent /></ProtectedRoute>} />
        <Route path="/organizer/sessions/scheduler" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><SessionScheduler /></ProtectedRoute>} />
        <Route path="/organizer/badges/designer" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><BadgeDesigner /></ProtectedRoute>} />
        <Route path="/organizer/billing" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><BillingInvoices /></ProtectedRoute>} />

        {/* ── Attendee Routes ──────────────────────────── */}
        <Route path="/attendee/hub" element={<ProtectedRoute allowedRoles={['attendee', 'super_admin']}><PersonalHub /></ProtectedRoute>} />
        <Route path="/attendee/pwa" element={<ProtectedRoute allowedRoles={['attendee', 'super_admin']}><PWADashboard /></ProtectedRoute>} />
        <Route path="/attendee/agenda" element={<ProtectedRoute allowedRoles={['attendee', 'super_admin']}><PersonalizedAgenda /></ProtectedRoute>} />

        {/* ── Staff Routes ─────────────────────────────── */}
        <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff', 'super_admin']}><StaffDashboard /></ProtectedRoute>} />

        {/* ── Admin Routes ─────────────────────────────── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/deployment" element={<ProtectedRoute allowedRoles={['super_admin']}><DeploymentStatus /></ProtectedRoute>} />

        {/* ── AI Routes ────────────────────────────────── */}
        <Route path="/ai/chat" element={<ProtectedRoute><ChatbotAssistant /></ProtectedRoute>} />
        <Route path="/ai/networking" element={<ProtectedRoute><NetworkingMatching /></ProtectedRoute>} />
        <Route path="/ai/search" element={<ProtectedRoute><SearchDiscovery /></ProtectedRoute>} />

        {/* ── Engagement Routes ────────────────────────── */}
        <Route path="/polls" element={<ProtectedRoute><LivePollsQA /></ProtectedRoute>} />

        {/* ── Venue Routes ─────────────────────────────── */}
        <Route path="/venue/editor" element={<ProtectedRoute allowedRoles={['organizer', 'super_admin']}><FloorPlanEditor /></ProtectedRoute>} />

        {/* ── Settings Routes ──────────────────────────── */}
        <Route path="/settings/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/settings/accessibility" element={<ProtectedRoute><AccessibilitySettings /></ProtectedRoute>} />

        {/* ── Error Routes ─────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
