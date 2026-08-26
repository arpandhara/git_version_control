import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import AuthLayout from './components/AuthLayout';
import MainLayout from './components/MainLayout';
import { Lottie } from 'lottie-react';
import loadingAnimation from './assets/Loading V2/loadingV2.json';

// Lazy-loaded pages — each is a separate JS chunk, loaded only when visited
const SignIn         = lazy(() => import('./pages/SignIn'));
const SignUp         = lazy(() => import('./pages/SignUp'));
const VerifyOTP      = lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const OnboardingFlow = lazy(() => import('./pages/Onboarding/OnboardingFlow'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Profile        = lazy(() => import('./pages/Profile'));

const PageFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Lottie 
      animationData={loadingAnimation} 
      loop={true} 
      autoplay={true} 
      className="w-20 h-20 opacity-80" 
    />
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/profile" element={
            <MainLayout>
              <Profile />
            </MainLayout>
          } />
          <Route path="*" element={
            <AuthLayout>
              <AnimatedRoutes />
            </AuthLayout>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
