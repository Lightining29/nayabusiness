import React from 'react';
import { Cpu, CheckCircle2, Award, Zap, Users } from 'lucide-react';

export default function About() {
  const serviceHighlights = [
    {
      title: "Web Development",
      description: "Custom programming services that enable high-performance website functionality based on your exact business workflow requirements."
    },
    {
      title: "Web Designing",
      description: "Structured, aesthetic visual design with a premium layout that visitors can interact with fluidly on desktop and mobile browsers."
    },
    {
      title: "Web Hosting",
      description: "High-uptime hosting options ensuring fast servers, domain registration, secure SSL certificates, and 24/7 web assistance."
    },
    {
      title: "SEO Optimization",
      description: "Targeted methodologies that help search engines index and rank your web assets to yield consistent organic traffic gains."
    },
    {
      title: "Responsive Layouts",
      description: "Dynamic fluid-grid design that automatically detects and shapes content to fit smartphone, tablet, or desktop displays."
    },
    {
      title: "Logo Designing",
      description: "Creative graphical symbols, emblems, and typography that convey a cohesive brand identity and build long-term value."
    }
  ];

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      {/* Intro section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 820px) {
            .about-split {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}} />

        <div className="about-split" style={{ display: 'contents' }}>
          <div>
            <span className="hero-subtitle" style={{ color: 'var(--primary)' }}>ABOUT RANCOM TECHNOLOGIES</span>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>
              Leading Telecom & Software Experts
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Rancom Technologies is a premier Telecom engineering, database architecture, and Software Development agency. We deliver end-to-end setups including network audits, BTS node configurations, full-stack website programming, corporate domain registration, custom branding, and search engine optimization.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
              Our fundamental vision is to serve our international client base with affordable, top-tier innovations. By ensuring a robust technical advantage, we enable businesses to achieve persistent growth and maximize long-term asset value in a highly competitive digital landscape.
            </p>
          </div>

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-glow)' }}>
            <img 
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" 
              alt="Rancom server backend data center"
              style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '5rem' }}>
        <h2 className="text-center" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '3rem' }}>Why Choose Our Engineers?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', display: 'inline-block', marginBottom: '1rem' }}><Zap size={36} /></div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Speed & Efficiency</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We deliver highly optimized sites and quick network implementations to keep your operations moving forward.</p>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--secondary)', display: 'inline-block', marginBottom: '1rem' }}><Award size={36} /></div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>High Quality</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We follow strict testing protocols and build setups utilizing the industry's best-practice standards.</p>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent)', display: 'inline-block', marginBottom: '1rem' }}><Users size={36} /></div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Expert Team</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Our engineers are fully certified in RF operations, hardware rigging, and modern full-stack languages.</p>
          </div>
        </div>
      </div>

      {/* Services summary */}
      <div style={{ marginBottom: '5rem' }}>
        <div className="text-center">
          <h2 className="section-title">Software Services Portfolio</h2>
          <p className="section-subtitle">
            Providing modern software development and graphics design to create beautiful digital products.
          </p>
        </div>

        <div className="cards-grid">
          {serviceHighlights.map((serv, i) => (
            <div key={i} className="premium-card">
              <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{serv.title}</h3>
              </div>
              <p className="card-description">{serv.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
