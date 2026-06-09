import { useParams, Link } from 'react-router-dom';
import { Code, Layout, Server, Palette, Search } from 'lucide-react';

export default function SoftwareServices() {
  const { serviceId } = useParams();

  const servicesData = {
    development: {
      title: "Web Development Services",
      icon: <Code size={32} />,
      desc: "We deliver full-stack coding configurations utilizing secure web architectures. From custom content management systems and dynamic portals to complex database-driven websites, our clean coding practices ensure high speed, search compliance, and absolute maintainability.",
      points: [
        "Full-stack MERN (MongoDB, Express, React, Node) application design.",
        "Custom APIs, dashboard configurations, and secure user logins.",
        "Scalable database integration and optimization (MongoDB, SQL).",
        "Clean, documented code structure written for long-term scalability."
      ],
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
    },
    design: {
      title: "Web Designing & UX/UI",
      icon: <Layout size={32} />,
      desc: "We design gorgeous, responsive user interfaces that reflect your corporate identity. We optimize every pixel to ensure user interactions are fluid, visual structures are clear, and responsive animations load effortlessly on any browser.",
      points: [
        "Premium, modern graphic layouts utilizing responsive systems.",
        "Mobile-first, fluid grid styling (compatible with all screen sizes).",
        "Subtle micro-animations, glassmorphism, and dark/light palettes.",
        "Wireframing, UI prototyping, and detailed branding integration."
      ],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
    },
    hosting: {
      title: "Premium Web Hosting",
      icon: <Server size={32} />,
      desc: "Our web hosting structures provide absolute uptime, secure web servers, and automatic server failover systems. We manage corporate domain names, SSL certificate licensing, database files backup, and custom professional mail servers.",
      points: [
        "High-uptime servers featuring high SSD speeds.",
        "Free SSL encryption certificate setups.",
        "Corporate business emails integration.",
        "Periodic automated backups and instant databases deployment."
      ],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    },
    logo: {
      title: "Corporate Logo Design",
      icon: <Palette size={32} />,
      desc: "A corporate logo is the graphic embodyment of your brand identity. We design professional vector assets, emblems, and typographic brands that help customers identify your enterprise instantly.",
      points: [
        "Custom, high-resolution vector assets.",
        "Multiple design concepts and prompt review adjustments.",
        "Branding guidelines including color palettes and fonts.",
        "Export formats for digital platforms, signs, and paper prints."
      ],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
    },
    seo: {
      title: "Search Engine Optimization (SEO)",
      icon: <Search size={32} />,
      desc: "Our SEO services verify structure, page load speeds, meta indexing tags, and keyword densities. By aligning page coding with modern ranking guidelines, we push your site higher on organic search pages, increasing organic leads.",
      points: [
        "Comprehensive website structure audits and speed optimization.",
        "Keyword research and descriptive meta tags configuration.",
        "Search console indexing setups (Google, Bing, Yahoo).",
        "Ongoing performance monitoring, traffic reports, and rank tracking."
      ],
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
    }
  };

  const listServices = [
    { id: 'development', name: 'Web Development' },
    { id: 'design', name: 'Web Design' },
    { id: 'hosting', name: 'Web Hosting' },
    { id: 'logo', name: 'Logo Design' },
    { id: 'seo', name: 'SEO Services' }
  ];

  // Default to 'development' if parameter is missing or invalid
  const currentKey = servicesData[serviceId] ? serviceId : 'development';
  const service = servicesData[currentKey];

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      {/* Responsive layout styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .software-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          margin-bottom: 5rem;
        }
        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-item {
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          font-weight: 500;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .sidebar-item:hover, .sidebar-item.active {
          color: white;
          background: rgba(59, 130, 246, 0.12);
          border-color: var(--primary);
          padding-left: 1.5rem;
        }
        @media (max-width: 900px) {
          .software-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .sidebar-menu {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .sidebar-item {
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
          }
        }
      `}} />

      <div className="text-center">
        <h1 className="section-title">Software & Web Services</h1>
        <p className="section-subtitle">
          Modern web programming, responsive design layout, high-uptime servers hosting, and search ranking services.
        </p>
      </div>

      <div className="software-grid">
        {/* Sidebar Navigation */}
        <aside>
          <div className="sidebar-menu">
            {listServices.map((item) => (
              <Link 
                key={item.id} 
                to={`/services/${item.id}`} 
                className={`sidebar-item ${currentKey === item.id ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </aside>

        {/* Dynamic Detail Content */}
        <main className="glass" style={{ padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              {service.icon}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{service.title}</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            {service.desc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            
            {/* Inner responsive split */}
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 680px) {
                .inner-split {
                  grid-template-columns: 1fr !important;
                  gap: 1.5rem !important;
                }
              }
            `}} />

            <div className="inner-split" style={{ display: 'contents' }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>Service Deliverables</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {service.points.map((pt, index) => (
                    <li key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>

          <div className="glass" style={{ marginTop: '3rem', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Need premium software development?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Talk to our development leads to request a technical proposal.</p>
            </div>
            <Link to="/contact" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              Start Your Project
            </Link>
          </div>
        </main>
      </div>

    </div>
  );
}
