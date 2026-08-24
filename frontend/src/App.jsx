import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AuthLayout from './components/AuthLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import OnboardingFlow from './pages/Onboarding/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MainLayout from './components/MainLayout';

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
    </Router>
  );
}

export default App;
