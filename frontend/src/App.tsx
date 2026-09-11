import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import { connectSocket } from "./socket";
import {toast} from "react-toastify";
import { useNotificationStore } from "./store/notificationStore";
import { lazy, Suspense } from "react";
import GuestOnly from "./components/GuestOnly";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireRole from "./components/RequireRole";
import RequireAuth from "./components/RequireAuth";


const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreateJobPage = lazy(() => import("./pages/CreateJobPage"));
const SingleJobPage = lazy(() => import("./pages/SingleJobPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardAnalytics = lazy(() => import("./pages/DashboardAnalytics"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const RemindersPage = lazy(() => import("./pages/RemindersPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const VerifyEmailPage = lazy(
  () => import("./pages/VerifyEmailPage")
);
// Preload functions
const preloadDashboardPage = () => import("./pages/DashboardPage");
const preloadAnalyticsPage = () => import("./pages/DashboardAnalytics");
const preloadAdminDashboard = () => import("./pages/AdminDashboard");
const preloadRemindersPage = () => import("./pages/RemindersPage");

interface UserNotificationEvent {
  notification: {
    message: string;
  };
  unreadCount: number;
}

interface AdminAlertEvent {
  message: string;
}

 const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <span className="animate-pulse text-lg">Loading...</span>
  </div>
);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user=useAuthStore((state)=>state.user);
  const{setUnreadCount,fetchUnreadCount}=useNotificationStore();

  useEffect(() => {
    checkAuth(); // Check authentication on page load
  }, [checkAuth]);

  const theme = useThemeStore((s) => s.theme); // Get the theme from state

  useEffect(() => {
    document.body.className = theme; // Set the body class based on the theme
  }, [theme]);

  useEffect(() => {
  if (!user?._id) return;

  // Preload critical pages after login
  preloadDashboardPage();
  preloadAnalyticsPage();
  preloadRemindersPage();

  // Optionally preload admin page only for admins
  if (user.role === "admin") {
    preloadAdminDashboard();
  }
  // 1️⃣ Fetch unread count from backend
  fetchUnreadCount();

  // 2️⃣ Connect socket
  const socket = connectSocket(user._id, user.role);

  // 3️⃣ Handle normal user notifications
  const handleNotification = (data: UserNotificationEvent) => {
    console.log("Real-time notification:", data);

    toast.success(data.notification?.message);

    // Trust backend unread count
    if (data.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  };

  // 4️⃣ Handle admin alerts
  const handleAdminAlert = (data: AdminAlertEvent) => {
    console.log("Admin alert:", data);
    toast.info(`Admin Alert: ${data.message}`);
  };

  socket.on("notification", handleNotification);
  socket.on("admin-alert", handleAdminAlert);

  // 5️⃣ Cleanup on logout / role change
  return () => {
    socket.off("notification", handleNotification);
    socket.off("admin-alert", handleAdminAlert);
  };
}, [user?._id, user?.role,fetchUnreadCount,setUnreadCount]);
   
 

  if (isLoading) return <div>Loading...</div>; // Show loading while checking authentication
  
  return (
  <BrowserRouter>
    <Suspense fallback={<PageLoader/>}>
      <Routes>

        {/* AUTH ROUTES */}
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={
              <GuestOnly>
                <LandingPage />
              </GuestOnly>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/verify-email"
            element={<VerifyEmailPage />}
          />
        </Route>

        {/* APP ROUTES */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/jobs/new"
            element={
              <DashboardLayout>
                <CreateJobPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/jobs/:id"
            element={
              <DashboardLayout>
                <SingleJobPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <DashboardLayout>
                <DashboardAnalytics />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
        </Route>

        {/* REMINDERS & NOTIFICATIONS */}
        <Route
          path="/reminders"
          element={
            <DashboardLayout>
              <RemindersPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          }
        />

      </Routes>
    </Suspense>
  </BrowserRouter>
);
};
export default App;
