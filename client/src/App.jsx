import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import About from './pages/About';
import TelecomServices from './pages/TelecomServices';
import SoftwareServices from './pages/SoftwareServices';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hide standard header/footer on admin pages */}
      {!isAdminRoute && <Header />}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          
          {/* Telecom routes */}
          <Route path="/telecom" element={<Navigate to="/telecom/los" replace />} />
          <Route path="/telecom/:serviceId" element={<TelecomServices />} />
          
          {/* Software routes */}
          <Route path="/services" element={<Navigate to="/services/development" replace />} />
          <Route path="/services/:serviceId" element={<SoftwareServices />} />
          
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Catch-all route redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      <Chatbot />
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
