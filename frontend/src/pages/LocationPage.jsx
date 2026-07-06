import { useParams, Link } from 'react-router-dom';

const locations = {
  delhi: {
    city: 'Delhi',
    state: 'Delhi NCR',
    slug: 'delhi',
    headline: 'Software Development Company in Delhi',
    meta: 'Rancom Technologies – Top Software Development Company in Delhi offering Custom Software, MERN Stack, Java, HRMS, ERP, Mobile App & Web Development services.',
    about: `Delhi is India's capital and one of the largest technology hubs in the country. Rancom Technologies serves businesses across Delhi — from Connaught Place startups to Okhla industrial units — with enterprise-grade software solutions built for growth.`,
    clients: 'Retail chains, government contractors, educational institutions, real estate developers, and healthcare clinics across Delhi.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['Delhi & NCR','Local Presence'],['24/7','Support']],
    areas: ['Connaught Place','Okhla Industrial Area','Nehru Place IT Hub','Saket','Dwarka','Rohini','Janakpuri','Lajpat Nagar'],
  },
  noida: {
    city: 'Noida',
    state: 'Uttar Pradesh',
    slug: 'noida',
    headline: 'Software Development Company in Noida',
    meta: 'Rancom Technologies – Leading Software Development Company in Noida, Sector 62 & 63 IT Hub. Custom Software, MERN Stack, Java, HRMS, ERP, Mobile App Development.',
    about: `Noida is the heart of India's IT industry, home to hundreds of software companies in Sectors 62, 63, and 125. Rancom Technologies is based in Noida and delivers world-class custom software, web applications, and enterprise platforms to businesses of all sizes.`,
    clients: 'IT companies, BPOs, manufacturing units, e-commerce businesses, and educational institutions across Noida and Greater Noida.',
    stats: [['HQ','Based in Noida'],['500+','Projects Delivered'],['10+','Years Experience'],['24/7','Support']],
    areas: ['Sector 62','Sector 63','Sector 125','Greater Noida','Noida Expressway','Sector 18','Sector 135','Knowledge Park'],
  },
  gurugram: {
    city: 'Gurugram',
    state: 'Haryana',
    slug: 'gurugram',
    headline: 'Software Development Company in Gurugram',
    meta: 'Rancom Technologies – Software Development Company in Gurugram (Gurgaon). Custom Software, MERN Stack, Java, CRM, ERP, Mobile App & SaaS Development.',
    about: `Gurugram (Gurgaon) is India's corporate capital, home to Fortune 500 companies, fintech startups, and MNCs. Rancom Technologies delivers scalable software solutions to Gurugram enterprises — from CRM and ERP systems to HRMS platforms and mobile applications.`,
    clients: 'MNCs, fintech companies, logistics firms, real estate developers, and corporate HR departments across Gurugram.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['NCR Coverage','Delhi + Gurugram'],['24/7','Support']],
    areas: ['Cyber City','DLF Phase 1-5','Sohna Road','Golf Course Road','MG Road','Udyog Vihar','Sector 44','IMT Manesar'],
  },
  ghaziabad: {
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    slug: 'ghaziabad',
    headline: 'Software Development Company in Ghaziabad',
    meta: 'Rancom Technologies – Software Development Company in Ghaziabad. Custom ERP, HRMS, Web Development, Mobile Apps & Inventory Software for manufacturing & retail businesses.',
    about: `Ghaziabad is a rapidly growing industrial and commercial hub in NCR. Rancom Technologies serves manufacturers, traders, and retail businesses in Ghaziabad with customized ERP, inventory management, POS, and HRMS software solutions.`,
    clients: 'Manufacturing companies, trading firms, retail shops, educational institutes, and real estate businesses across Ghaziabad.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['NCR Region','Ghaziabad & NCR'],['24/7','Support']],
    areas: ['Indirapuram','Vaishali','Raj Nagar Extension','Crossings Republik','NH-58 Industrial Belt','Sahibabad','Modinagar','Loni'],
  },
  bengaluru: {
    city: 'Bengaluru',
    state: 'Karnataka',
    slug: 'bengaluru',
    headline: 'Software Development Company in Bengaluru',
    meta: 'Rancom Technologies – Software Development Company in Bengaluru (Bangalore). MERN Stack, Java, React Native, SaaS, Cloud, DevOps & Enterprise Software Development.',
    about: `Bengaluru is India's Silicon Valley — home to the highest density of tech startups, MNCs, and product companies. Rancom Technologies partners with Bengaluru-based startups and enterprises to build MERN Stack applications, SaaS platforms, cloud-native products, and mobile apps.`,
    clients: 'Tech startups, product companies, e-commerce businesses, healthcare tech firms, and enterprise software teams across Bengaluru.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['Pan India','Bengaluru & Beyond'],['24/7','Support']],
    areas: ['Electronic City','Whitefield','Koramangala','HSR Layout','Indiranagar','Marathahalli','Bellandur','Hebbal'],
  },
  mumbai: {
    city: 'Mumbai',
    state: 'Maharashtra',
    slug: 'mumbai',
    headline: 'Software Development Company in Mumbai',
    meta: 'Rancom Technologies – Software Development Company in Mumbai. Custom Fintech Software, E-commerce, HRMS, ERP, Mobile Apps & Web Development for Mumbai businesses.',
    about: `Mumbai is India's financial capital and a major hub for fintech, e-commerce, media, and enterprise businesses. Rancom Technologies delivers high-performance software solutions to Mumbai businesses — from fintech dashboards and e-commerce platforms to HRMS and ERP systems.`,
    clients: 'Financial services firms, e-commerce companies, media houses, logistics providers, and retail chains across Mumbai and Thane.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['Maharashtra','Mumbai Coverage'],['24/7','Support']],
    areas: ['Bandra Kurla Complex','Lower Parel','Andheri','Powai','Navi Mumbai','Thane','Goregaon','Vikhroli'],
  },
  pune: {
    city: 'Pune',
    state: 'Maharashtra',
    slug: 'pune',
    headline: 'Software Development Company in Pune',
    meta: 'Rancom Technologies – Software Development Company in Pune. MERN Stack, Java, Spring Boot, ERP, HRMS, Mobile App & SaaS Development for Pune IT companies.',
    about: `Pune is one of India's top IT cities, with major tech parks and a thriving startup ecosystem. Rancom Technologies serves Pune-based software companies, manufacturing firms, and educational institutions with custom software, enterprise applications, and cloud solutions.`,
    clients: 'IT companies, automotive manufacturers, educational institutes, fintech startups, and healthcare firms across Pune.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['Maharashtra','Pune & Nearby'],['24/7','Support']],
    areas: ['Hinjewadi IT Park','Magarpatta City','Kharadi','Viman Nagar','Baner','Wakad','Hadapsar','Pimpri-Chinchwad'],
  },
  hyderabad: {
    city: 'Hyderabad',
    state: 'Telangana',
    slug: 'hyderabad',
    headline: 'Software Development Company in Hyderabad',
    meta: 'Rancom Technologies – Software Development Company in Hyderabad (HITEC City). Custom Software, MERN Stack, Java, Cloud, ERP, HRMS & Mobile App Development.',
    about: `Hyderabad is home to HITEC City — one of India's premier IT destinations with global tech giants and a booming startup scene. Rancom Technologies delivers scalable software products, cloud-native applications, and enterprise solutions to Hyderabad-based businesses.`,
    clients: 'IT services companies, pharma firms, BFSI businesses, e-commerce startups, and government projects across Hyderabad.',
    stats: [['500+','Projects Delivered'],['10+','Years Experience'],['South India','Hyderabad Hub'],['24/7','Support']],
    areas: ['HITEC City','Gachibowli','Madhapur','Kondapur','Banjara Hills','Jubilee Hills','Shamshabad','Secunderabad'],
  },
};

const services = [
  { name: 'Custom Software Development', path: '/services/custom-software' },
  { name: 'Web Development',             path: '/services/web-development' },
  { name: 'MERN Stack Development',      path: '/services/mern-stack' },
  { name: 'Java Development',            path: '/services/java-development' },
  { name: 'Mobile App Development',      path: '/services/mobile-app' },
  { name: 'ERP Software',                path: '/services/erp-software' },
  { name: 'HRMS Software',               path: '/services/hrms-software' },
  { name: 'CRM Software',                path: '/services/crm-software' },
  { name: 'E-commerce Development',      path: '/services/ecommerce' },
  { name: 'SaaS Development',            path: '/services/saas-development' },
  { name: 'Cloud Solutions',             path: '/services/cloud-solutions' },
  { name: 'UI/UX Design',                path: '/services/ui-ux-design' },
];

export default function LocationPage() {
  const { city } = useParams();
  const data = locations[city] || locations['noida'];

  if (typeof document !== 'undefined') {
    document.title = `${data.headline} | Rancom Technologies`;
  }

  return (
    <div className="animate-fade-in">
      <style dangerouslySetInnerHTML={{__html:`
        .loc-hero{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0369a1 100%);
          padding:4rem 0 3.5rem;text-align:center;color:white;}
        .loc-hero h1{font-size:2.4rem;font-weight:800;color:white;line-height:1.2;margin-bottom:1rem;}
        .loc-hero p{font-size:1.05rem;color:rgba(255,255,255,0.82);max-width:680px;margin:0 auto 2rem;line-height:1.75;}
        .loc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.12);
          max-width:700px;margin:0 auto;border-radius:12px;overflow:hidden;}
        .loc-stat{background:rgba(255,255,255,0.08);padding:1rem;text-align:center;}
        .loc-stat-val{font-size:1.4rem;font-weight:800;color:#38bdf8;}
        .loc-stat-lbl{font-size:0.72rem;color:rgba(255,255,255,0.65);font-weight:600;margin-top:0.2rem;}
        .loc-body{max-width:1100px;margin:0 auto;padding:3rem 2rem 5rem;display:grid;
          grid-template-columns:1fr 340px;gap:3rem;align-items:start;}
        .loc-main{}
        .loc-section{margin-bottom:2.5rem;}
        .loc-section h2{font-size:1.4rem;font-weight:800;color:#0f172a;margin-bottom:1rem;
          display:flex;align-items:center;gap:0.5rem;}
        .loc-section h2::before{content:'';display:inline-block;width:4px;height:1.3em;
          background:var(--primary);border-radius:2px;flex-shrink:0;}
        .loc-section p{color:#334155;line-height:1.8;font-size:0.97rem;}
        .loc-areas{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem;}
        .loc-area-tag{background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.2);
          color:#0284c7;border-radius:6px;padding:0.35rem 0.75rem;font-size:0.82rem;font-weight:600;}
        .loc-services-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-top:0.75rem;}
        .loc-svc-link{display:flex;align-items:center;gap:0.4rem;padding:0.6rem 0.85rem;
          background:white;border:1px solid rgba(14,165,233,0.2);border-radius:8px;
          font-size:0.85rem;font-weight:600;color:#0f172a;transition:all 0.18s;}
        .loc-svc-link:hover{border-color:var(--primary);color:var(--primary);transform:translateX(3px);}
        .loc-svc-link::before{content:'✓';color:var(--secondary);font-weight:800;flex-shrink:0;}
        .loc-sidebar{}
        .loc-cta-card{background:linear-gradient(135deg,#0ea5e9,#0369a1);border-radius:16px;
          padding:2rem;color:white;text-align:center;margin-bottom:1.5rem;
          box-shadow:0 8px 30px rgba(14,165,233,0.35);}
        .loc-cta-card h3{color:white;font-size:1.2rem;font-weight:800;margin-bottom:0.75rem;}
        .loc-cta-card p{font-size:0.88rem;opacity:0.88;margin-bottom:1.25rem;line-height:1.6;}
        .loc-cities{background:white;border:1px solid rgba(14,165,233,0.2);border-radius:14px;padding:1.5rem;}
        .loc-cities h4{font-size:1rem;font-weight:800;color:#0f172a;margin-bottom:1rem;}
        .loc-city-link{display:block;padding:0.55rem 0.75rem;border-radius:7px;font-size:0.85rem;
          font-weight:600;color:#475569;transition:all 0.18s;}
        .loc-city-link:hover,.loc-city-link.active{background:rgba(14,165,233,0.1);color:#0284c7;padding-left:1rem;}
        .loc-why{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);
          border:1px solid rgba(14,165,233,0.15);border-radius:14px;padding:1.75rem;margin-bottom:2.5rem;}
        .loc-why h2{font-size:1.3rem;font-weight:800;color:#0f172a;margin-bottom:1.25rem;}
        .loc-why-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .loc-why-item{background:white;border-radius:10px;padding:1rem;border:1px solid rgba(14,165,233,0.15);}
        .loc-why-item h4{font-size:0.9rem;font-weight:700;color:#0f172a;margin-bottom:0.3rem;}
        .loc-why-item p{font-size:0.8rem;color:#64748b;line-height:1.5;}
        .loc-bottom-cities{max-width:1100px;margin:0 auto 4rem;padding:0 2rem;}
        .loc-bottom-cities h2{font-size:1.35rem;font-weight:800;color:#0f172a;margin-bottom:1rem;}
        .loc-bottom-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.75rem;}
        .loc-bottom-card{display:block;padding:1rem 1.25rem;background:white;
          border:1px solid rgba(14,165,233,0.2);border-radius:12px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#0f172a;transition:all 0.2s;}
        .loc-bottom-card:hover{border-color:var(--primary);color:var(--primary);transform:translateY(-3px);
          box-shadow:0 8px 20px rgba(14,165,233,0.15);}
        .loc-bottom-card span{display:block;font-size:0.75rem;font-weight:500;color:#64748b;margin-top:0.2rem;}
        @media(max-width:900px){
          .loc-body{grid-template-columns:1fr;gap:2rem;}
          .loc-sidebar{order:-1;}
          .loc-stats{grid-template-columns:repeat(2,1fr);}
          .loc-services-grid{grid-template-columns:1fr;}
          .loc-why-grid{grid-template-columns:1fr;}
        }
        @media(max-width:640px){
          .loc-hero h1{font-size:1.75rem;}
          .loc-body{padding:2rem 1rem 3rem;}
          .loc-bottom-cities{padding:0 1rem;}
        }
      `}} />

      {/* Hero */}
      <div className="loc-hero">
        <div className="container-width">
          <div style={{fontSize:'0.8rem',fontWeight:700,letterSpacing:'0.15em',color:'#38bdf8',
            textTransform:'uppercase',marginBottom:'0.75rem'}}>
            RANCOM TECHNOLOGIES · {data.state.toUpperCase()}
          </div>
          <h1>{data.headline}</h1>
          <p>{data.meta}</p>
          <div className="loc-stats">
            {data.stats.map(([v,l]) => (
              <div key={l} className="loc-stat">
                <div className="loc-stat-val">{v}</div>
                <div className="loc-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'1rem',marginTop:'2rem',flexWrap:'wrap'}}>
            <Link to="/contact" className="btn btn-primary">Get Free Consultation</Link>
            <Link to="/services/software-company" className="btn btn-secondary"
              style={{borderColor:'rgba(255,255,255,0.4)',color:'white',background:'rgba(255,255,255,0.1)'}}>
              View All Services
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="loc-body">
        <div className="loc-main">

          {/* About */}
          <div className="loc-section">
            <h2>Software Development Company in {data.city}</h2>
            <p>{data.about}</p>
            <p style={{marginTop:'1rem'}}>
              Whether you need a custom web application, mobile app, HRMS system, ERP platform, or cloud-native SaaS product —
              our {data.city} team delivers end-to-end development with transparent milestones, clean code, and full post-launch support.
            </p>
          </div>

          {/* Why Rancom */}
          <div className="loc-why">
            <h2>Why {data.city} Businesses Choose Rancom Technologies</h2>
            <div className="loc-why-grid">
              {[
                ['Local Understanding','We understand the {city} market — local business needs, compliance requirements, and growth challenges.'],
                ['Full-Stack Expertise','MERN Stack, Java, Spring Boot, React Native — we cover the full technology spectrum.'],
                ['On-Time Delivery','Agile sprints with weekly updates ensure your project stays on schedule and within budget.'],
                ['Industry Experience','10+ years serving retail, manufacturing, healthcare, logistics, education, and fintech.'],
                ['Cost-Effective','Competitive pricing tailored for Indian businesses — startup to enterprise.'],
                ['AMC & Support','Annual maintenance contracts keep your software updated, secure, and running 24/7.'],
              ].map(([title, desc]) => (
                <div key={title} className="loc-why-item">
                  <h4>{title}</h4>
                  <p>{desc.replace('{city}', data.city)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="loc-section">
            <h2>Our Services in {data.city}</h2>
            <p>We offer the complete spectrum of software development services to {data.city}-based businesses:</p>
            <div className="loc-services-grid">
              {services.map(s => (
                <Link key={s.path} to={s.path} className="loc-svc-link">{s.name}</Link>
              ))}
            </div>
          </div>

          {/* Clients */}
          <div className="loc-section">
            <h2>Who We Serve in {data.city}</h2>
            <p>{data.clients}</p>
          </div>

          {/* Areas */}
          <div className="loc-section">
            <h2>Areas We Cover in {data.city}</h2>
            <p>Our services are available across all major business areas in {data.city}:</p>
            <div className="loc-areas">
              {data.areas.map(a => <span key={a} className="loc-area-tag">{a}</span>)}
            </div>
          </div>

          {/* Process */}
          <div className="loc-section">
            <h2>Our Development Process</h2>
            <div style={{display:'grid',gap:'1rem',marginTop:'0.5rem'}}>
              {[
                ['01','Discovery & Requirement Analysis','We study your business goals, current processes, and technical requirements before writing a single line of code.'],
                ['02','System Architecture & UI/UX Design','Our architects and designers create a scalable system blueprint and pixel-perfect UI prototypes for your approval.'],
                ['03','Agile Development & Testing','We build in 2-week sprints with continuous testing — unit, integration, and UAT — ensuring quality at every step.'],
                ['04','Deployment & Training','We deploy to your preferred cloud (AWS/Azure/GCP), train your team, and provide complete documentation.'],
                ['05','Support & Maintenance','Post-launch, we offer AMC packages for bug fixes, security patches, performance monitoring, and feature upgrades.'],
              ].map(([num, title, desc]) => (
                <div key={num} style={{display:'flex',gap:'1rem',alignItems:'flex-start',
                  padding:'1rem 1.25rem',background:'white',border:'1px solid rgba(14,165,233,0.15)',
                  borderRadius:'10px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'rgba(14,165,233,0.1)',
                    color:'var(--primary)',fontWeight:800,fontSize:'0.85rem',display:'flex',
                    alignItems:'center',justifyContent:'center',flexShrink:0}}>{num}</div>
                  <div>
                    <div style={{fontWeight:700,color:'#0f172a',marginBottom:'0.2rem'}}>{title}</div>
                    <div style={{fontSize:'0.875rem',color:'#64748b',lineHeight:1.6}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <aside className="loc-sidebar">
          <div className="loc-cta-card">
            <h3>Get a Free Quote in {data.city}</h3>
            <p>Tell us about your project and get a detailed proposal within 24 hours — no obligation.</p>
            <Link to="/contact" className="btn" style={{background:'white',color:'#0369a1',
              width:'100%',fontWeight:800,padding:'0.75rem'}}>
              Contact Us Now →
            </Link>
            <div style={{marginTop:'1rem',fontSize:'0.8rem',opacity:0.75}}>
              📞 Available Mon–Sat, 9AM–7PM IST
            </div>
          </div>

          <div className="loc-cities">
            <h4>📍 Other Cities We Serve</h4>
            {Object.values(locations).map(l => (
              <Link key={l.slug} to={`/location/${l.slug}`}
                className={`loc-city-link${l.slug === data.slug ? ' active' : ''}`}>
                {l.slug === data.slug ? '▶ ' : ''}{l.headline.replace('Software Development Company in ','')}
              </Link>
            ))}
            <div style={{borderTop:'1px solid rgba(14,165,233,0.15)',marginTop:'1rem',paddingTop:'1rem'}}>
              <Link to="/services/software-company" style={{fontSize:'0.82rem',color:'var(--primary)',fontWeight:700}}>
                → All Software Services
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom city grid */}
      <div className="loc-bottom-cities">
        <h2>Software Development Company – All India</h2>
        <div className="loc-bottom-grid">
          {Object.values(locations).map(l => (
            <Link key={l.slug} to={`/location/${l.slug}`} className="loc-bottom-card">
              {l.city}
              <span>{l.state}</span>
            </Link>
          ))}
          <Link to="/contact" className="loc-bottom-card" style={{borderStyle:'dashed',color:'var(--primary)'}}>
            Your City?
            <span>Contact us →</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
