import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ShieldAlert, Cpu, BarChart3, Palette, Code, Server, HeartHandshake } from 'lucide-react';

export default function Home() {
  const coreFeatures = [
    {
      icon: <Code size={24} />,
      title: "Cost-Effective Development",
      description: "We provide high-quality web pages, databases, and custom systems matching your brand at competitive pricing, ensuring maximum return on investment."
    },
    {
      icon: <Palette size={24} />,
      title: "Responsive & Dynamic Design",
      description: "Our websites adjust fluidly to any screen width, offering responsive, interactive layouts (for e-commerce, portfolios, real estate, cabs, and more)."
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Industry Leading SEO",
      description: "Boost organic search engine rankings. We optimize structure and page speeds to make your website easily discoverable to target customers."
    },
    {
      icon: <Cpu size={24} />,
      title: "Corporate Logo Design",
      description: "Establish a powerful corporate identity. We design distinct, memorable brand logo designs that represent your organization's vision."
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Systematic Development",
      description: "We treat clients with innovative, transparent methodologies. We prioritize long-term relationships and high quality in everything we build."
    },
    {
      icon: <Radio size={24} />,
      title: "Telecom Solutions",
      description: "Rancom is a pioneer in telecom surveys (LOS, RF, EMF), BTS installations, microwave configurations, SCFT testing, and network audits."
    },
    {
      icon: <ShieldAlert size={24} />,
      title: "Clean Coding & Quality",
      description: "Our structured, documented source code allows effortless modifications, upgrades, and extensions in the future."
    },
    {
      icon: <Server size={24} />,
      title: "Premium Web Hosting",
      description: "Reliable, high-performance web servers to keep your site online 24/7. Includes domain setup, custom emails, and database systems."
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Background Glow Elements */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-width">
          <span className="hero-subtitle">WELCOME TO RANCOM TECHNOLOGIES</span>
          <h1 className="hero-title">
            Next-Gen <span className="gradient-text">Telecom Solutions</span> <br />& Software Engineering
          </h1>
          <p className="hero-description">
            Providing expert Line of Sight (LOS) surveys, BTS installation, network testing, and robust full-stack software development tailored to accelerate your organization's growth.
          </p>
          <div className="hero-buttons">
            <Link to="/contact" className="btn btn-primary">Get In Touch</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>

          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=1200&q=80" 
              alt="Telecommunication tower under blue sky" 
              className="hero-image"
            />
            <div className="hero-image-overlay"></div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="section-spacing">
        <div className="container-width">
          <div className="text-center">
            <h2 className="section-title">Our Expert Services</h2>
            <p className="section-subtitle">
              We leverage cutting-edge systems and specialized teams to design, deploy, and maintain your telecom and software architecture.
            </p>
          </div>

          <div className="cards-grid">
            {coreFeatures.map((feat, idx) => (
              <div key={idx} className="premium-card">
                <div className="card-icon">
                  {feat.icon}
                </div>
                <h3 className="card-title">{feat.title}</h3>
                <p className="card-description">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us call-out */}
      <section className="section-spacing" style={{ background: 'rgba(11, 17, 32, 0.4)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-width" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          
          {/* Mobile responsive column stack */}
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 820px) {
              .split-container {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}} />

          <div className="split-container" style={{ display: 'contents' }}>
            <div>
              <span className="hero-subtitle" style={{ color: 'var(--primary)' }}>OUR MISSION</span>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Designed for everyone, built to scale.</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
                We believe in providing dynamic and responsive telecom and software frameworks in a systematic way. Our focus is to deliver best-in-class configurations with clean documentation and complete security, giving our clients a distinct edge in competitive markets.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div>
                  <h4 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>10+</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Years Experience</p>
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>500+</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Completed Audits</p>
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>99.9%</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Network Reliability</p>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" 
                alt="Telecom testing equipment"
                style={{ width: '100%', display: 'block', height: '350px', objectFit: 'cover' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Quick links block */}
      <section className="section-spacing text-center">
        <div className="container-width">
          <h2 className="section-title">Ready to launch your project?</h2>
          <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
            Connect with our engineering specialists today. Get a customized quote for surveys, telecom deployments, or software architectures.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <Link to="/contact" className="btn btn-primary">Contact Us Now</Link>
            <Link to="/register" className="btn btn-secondary">Apply for Career</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
