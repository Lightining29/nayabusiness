import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, BarChart3, Palette, Code, Server, HeartHandshake, Cpu, Radio, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is Rancom Technologies?',
    a: 'Rancom Technologies Pvt Ltd is a Software Development Company in Noida, India, and is a group company of Appletree Infotech. We build Custom Software, MERN Stack applications, Java enterprise systems, HRMS, ERP, Mobile Apps, and provide Telecom Infrastructure services to businesses across India and globally.'
  },
  {
    q: 'Where is Rancom Technologies located?',
    a: 'Our headquarters is in Noida, Uttar Pradesh, India (Sector 62 IT Hub). We serve clients across Delhi, Gurugram, Ghaziabad, Mumbai, Bengaluru, Pune, Hyderabad, and internationally in the UAE, UK, and USA.'
  },
  {
    q: 'Is Rancom Technologies related to Appletree Infotech?',
    a: 'Yes. Rancom Technologies Pvt Ltd is a group company of Appletree Infotech. Both brands operate under the same leadership team and together deliver end-to-end technology solutions across software development and telecom infrastructure.'
  },
  {
    q: 'What services does Rancom Technologies offer?',
    a: 'We offer Custom Software Development, MERN Stack Development, Java & Spring Boot, HRMS Software, ERP Software, CRM, Mobile App Development (Android & iOS), E-commerce, SaaS platforms, Cloud Solutions, DevOps, UI/UX Design, QA Testing, Software Maintenance, and Telecom services (LOS Survey, BTS Installation, RF Testing).'
  },
  {
    q: 'How much does custom software development cost?',
    a: 'Pricing depends on project complexity and features. A basic web application starts from ₹25,000. Enterprise ERP or HRMS systems range from ₹1,00,000 to ₹10,00,000+. Contact us for a free detailed estimate tailored to your requirements.'
  },
  {
    q: 'Which technology stack does Rancom Technologies use?',
    a: 'Our core stack includes MERN (MongoDB, Express.js, React.js, Node.js), Java & Spring Boot, React Native for mobile apps, AWS / Azure / GCP for cloud, Docker & Kubernetes for DevOps, and PostgreSQL / MySQL / MongoDB for databases.'
  },
  {
    q: 'Do you provide post-launch support and maintenance?',
    a: 'Yes. We offer Annual Maintenance Contracts (AMC) covering bug fixes, security patches, performance monitoring, dependency updates, and feature enhancements. Our support team is available Mon–Sat, 9AM–7PM IST.'
  },
  {
    q: 'How long does it take to build a custom software project?',
    a: 'A basic web application takes 4–8 weeks. A mid-sized SaaS or HRMS platform typically takes 3–5 months. Enterprise ERP systems may take 6–12 months depending on scope. We follow Agile sprints with weekly progress updates.'
  },
  {
    q: 'Can Rancom Technologies work with startups?',
    a: 'Absolutely. We work with startups, SMBs, and large enterprises. For startups, we offer MVP development packages that help you launch fast with a lean budget, then scale as your business grows.'
  },
  {
    q: 'Does Rancom Technologies develop mobile apps?',
    a: 'Yes. We build cross-platform mobile apps using React Native that work on both Android and iOS from a single codebase. We also develop native Android (Kotlin/Java) and iOS (Swift) apps for performance-critical projects.'
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section
      itemScope
      itemType="https://schema.org/FAQPage"
      style={{ background: 'rgba(14,165,233,0.03)', borderTop: '1px solid var(--border-color)', padding: '5rem 0' }}
    >
      <div className="container-width">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="hero-subtitle">GOT QUESTIONS?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about Rancom Technologies Pvt Ltd — Group of Appletree Infotech.
          </p>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              style={{
                background: 'white',
                border: `1px solid ${open === i ? 'rgba(14,165,233,0.4)' : 'rgba(14,165,233,0.15)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                boxShadow: open === i ? '0 4px 20px rgba(14,165,233,0.12)' : 'none'
              }}
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={open === i}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit'
                }}
              >
                <span
                  itemProp="name"
                  style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.4 }}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  style={{
                    color: 'var(--primary)', flexShrink: 0,
                    transition: 'transform 0.25s',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {open === i && (
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid rgba(14,165,233,0.1)' }}
                >
                  <p
                    itemProp="text"
                    style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.75, paddingTop: '1rem', margin: 0 }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            Still have questions? Our team is happy to help.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const coreFeatures = [
    {
      icon: <Code size={24} />,
      title: "Custom Software Development",
      description: "We build scalable custom software solutions — MERN Stack apps, Java enterprise systems, HRMS platforms, ERP software, and SaaS products tailored to your exact business workflow."
    },
    {
      icon: <Palette size={24} />,
      title: "Web Development Company",
      description: "Full-stack web development using React, Node.js, MongoDB, and Java. From e-commerce stores to enterprise portals — responsive, fast, and SEO-optimized from day one."
    },
    {
      icon: <BarChart3 size={24} />,
      title: "MERN Stack Developers",
      description: "Expert MERN Stack developers building real-time dashboards, job portals, SaaS products, and API-driven applications with clean architecture and rapid delivery."
    },
    {
      icon: <Cpu size={24} />,
      title: "HRMS & ERP Software",
      description: "Custom HRMS Software for payroll, attendance, leave management, and recruitment. ERP solutions for inventory, finance, and supply chain — built for Indian businesses."
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Mobile App Development",
      description: "Cross-platform Mobile App Development using React Native for Android and iOS. E-commerce apps, service booking apps, HRMS companion apps, and field workforce apps."
    },
    {
      icon: <Radio size={24} />,
      title: "Telecom Infrastructure",
      description: "Expert telecom services — LOS Surveys, BTS Installation, RF Testing, EMF Surveys, microwave configurations, SCFT testing, and network audits across India."
    },
    {
      icon: <ShieldAlert size={24} />,
      title: "Java Developers",
      description: "Enterprise Java development with Spring Boot microservices, REST APIs, and high-transaction backend systems for banking, government, and large enterprise clients."
    },
    {
      icon: <Server size={24} />,
      title: "Cloud & Web Hosting",
      description: "AWS, Azure, and Google Cloud deployment, serverless architecture, and premium web hosting with SSL, custom domains, business emails, and automated backups."
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
            <span className="gradient-text">Software Development Company</span> <br />& Telecom Infrastructure Experts
          </h1>
          <p className="hero-description">
            Rancom Technologies is a leading Software Development Company in India delivering Custom Software, MERN Stack Applications, Java Development, HRMS, ERP, Mobile Apps, and Telecom Infrastructure services. Trusted by businesses across India.
          </p>
          <div className="hero-buttons">
            <Link to="/contact" className="btn btn-primary">Get Free Quote</Link>
            <Link to="/services/development" className="btn btn-secondary">Our Services</Link>
          </div>

          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=1200&q=80" 
              alt="Rancom Technologies – Software Development Company in Noida India, telecom tower infrastructure"
              className="hero-image"
              loading="eager"
              width="1200"
              height="675"
            />
            <div className="hero-image-overlay"></div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="section-spacing">
        <div className="container-width">
          <div className="text-center">
            <h2 className="section-title">Software Development & Telecom Services</h2>
            <p className="section-subtitle">
              India's trusted Software Development Company for Custom Software, MERN Stack, Java, HRMS, ERP, Mobile Apps, and Telecom Infrastructure.
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
      <section className="section-spacing" style={{ background: 'rgba(14, 165, 233, 0.05)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
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
              <p style={{ color: '#333333', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
                We believe in providing dynamic and responsive telecom and software frameworks in a systematic way. Our focus is to deliver best-in-class configurations with clean documentation and complete security, giving our clients a distinct edge in competitive markets.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '2rem', fontWeight: 800 }}>10+</h4>
                  <p style={{ color: '#666666', fontSize: '0.85rem' }}>Years Experience</p>
                </div>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '2rem', fontWeight: 800 }}>500+</h4>
                  <p style={{ color: '#666666', fontSize: '0.85rem' }}>Completed Audits</p>
                </div>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '2rem', fontWeight: 800 }}>99.9%</h4>
                  <p style={{ color: '#666666', fontSize: '0.85rem' }}>Network Reliability</p>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" 
                alt="Rancom Technologies software developers and engineers working on custom software project in Noida"
                style={{ width: '100%', display: 'block', height: '350px', objectFit: 'cover' }}
                loading="lazy"
                width="800"
                height="350"
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

      {/* SEO keyword service links */}
      <section className="section-spacing" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container-width">
          <h2 className="section-title text-center">What We Build</h2>
          <p className="section-subtitle text-center" style={{ marginBottom: '2.5rem' }}>
            Rancom Technologies is a full-service Software Development Company in India. Explore our specialized service areas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Custom Software Development', to: '/services/custom-software' },
              { label: 'Web Development Company',     to: '/services/web-development' },
              { label: 'MERN Stack Developers',       to: '/services/mern-stack' },
              { label: 'Java Developers',             to: '/services/java-development' },
              { label: 'HRMS Software Development',   to: '/services/hrms-software' },
              { label: 'ERP Software Company',        to: '/services/erp-software' },
              { label: 'Mobile App Development',      to: '/services/mobile-app' },
              { label: 'Software Company in India',   to: '/services/software-company' },
              { label: 'Telecom Infrastructure',      to: '/telecom/los' },
              { label: 'SEO Services',                to: '/services/seo' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.to}
                style={{
                  display: 'block', padding: '0.85rem 1.25rem',
                  background: 'white', border: '1px solid rgba(14,165,233,0.2)',
                  borderRadius: '10px', color: '#0f172a', fontWeight: 600,
                  fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)'; e.currentTarget.style.color = '#0f172a'; }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <FAQ />

    </div>
  );
}
