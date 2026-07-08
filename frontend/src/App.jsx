import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import TelecomServices from './pages/TelecomServices';
import SoftwareServices from './pages/SoftwareServices';
import LocationPage from './pages/LocationPage';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AssessmentAdmin from './pages/AssessmentAdmin';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ApplyForm from './pages/ApplyForm';
import TakeTest from './pages/TakeTest';
import ProtectedRoute from './components/ProtectedRoute';

// ... existing imports remain

// Add new routes inside <Routes>


function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/assessment-admin');
  const isTestRoute  = location.pathname.startsWith('/test/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hide standard header/footer on admin, assessment-admin, and test pages */}
      {!isAdminRoute && !isTestRoute && <Header />}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          
          {/* Telecom routes */}
          <Route path="/telecom" element={<Navigate to="/telecom/los" replace />} />
          <Route path="/telecom/:serviceId" element={<TelecomServices />} />
          
          {/* Software routes */}
          <Route path="/services" element={<Navigate to="/services/software-company" replace />} />
          <Route path="/services/:serviceId" element={<SoftwareServices />} />

          {/* Location SEO pages */}
          <Route path="/location" element={<Navigate to="/location/noida" replace />} />
          <Route path="/location/:city" element={<LocationPage />} />
          
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Recruitment & Assessment */}
          <Route path="/apply" element={<ApplyForm />} />
          <Route path="/test/:id" element={<TakeTest />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/assessments" element={<AssessmentAdmin />} />
          
          {/* Catch-all route redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && !isTestRoute && <Footer />}
      
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
