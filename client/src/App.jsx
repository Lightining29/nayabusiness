import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import TelecomServices from './pages/TelecomServices';
import SoftwareServices from './pages/SoftwareServices';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Register from './pages/Register';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        {/* Main page wrapper to center-align contents */}
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
            
            {/* Catch-all route redirecting to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
