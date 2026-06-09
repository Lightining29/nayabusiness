import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Activity, Award, Network, Compass, Signal, TowerControl, Database, HardDrive, Cpu, Radio } from 'lucide-react';

export default function TelecomServices() {
  const { serviceId } = useParams();

  const servicesData = {
    los: {
      title: "Line of Sight (LOS) Survey",
      icon: <Compass size={32} />,
      desc: "Line of Sight (LOS) survey determines if an unobstructed path exists between two antenna positions. We inspect the topographical terrain, structural profiles, and tree growth to compute exact antenna and tower heights required for high-frequency microwave transmission.",
      points: [
        "Topographical map inspection and path profiling.",
        "Physical verification using high-magnification optical equipment and GPS receiver systems.",
        "Obstacle mapping (tree growth forecasts, building clearances).",
        "Comprehensive report including azimuths, coordinates, tilt, and recommended tower heights."
      ],
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80"
    },
    rf: {
      title: "Radio Frequency (RF) Survey",
      icon: <Radio size={32} />,
      desc: "Radio Frequency (RF) survey evaluates coverage, interference, signal-to-noise ratios, and traffic capacity. This enables network planners to choose appropriate cell locations, specify azimuth settings, and maximize frequency reuse.",
      points: [
        "Candidate site search and viability selection.",
        "RF signal level and spectrum interference verification.",
        "Azimuth and antenna height selection.",
        "Coverage simulation data using industry-standard RF software."
      ],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
    },
    emf: {
      title: "Electromagnetic Field (EMF) Survey",
      icon: <Signal size={32} />,
      desc: "Electromagnetic Field (EMF) surveys measure radiation levels around transmission systems to guarantee compliance with public health rules and safety regulations.",
      points: [
        "Radiation power density measurements in public access areas.",
        "Compliance documentation in line with national and international limits.",
        "Interference checks on sensitive nearby scientific or medical machinery.",
        "Remedial design options if radiation exceeds standard safety levels."
      ],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    },
    bts: {
      title: "Base Transceiver Station (BTS) Installation",
      icon: <TowerControl size={32} />,
      desc: "Base Transceiver Station (BTS) deployment includes mechanical cabinet installation, antenna mounting, cable routing (RF jumpers, fiber lines), electrical grounding, and commissioning.",
      points: [
        "Cabinet positioning, anchoring, and electrical power setups.",
        "Antenna mounting, mechanical tilt adjustments, and alignment.",
        "Grounding line installations to prevent lightning damages.",
        "Configuration of baseband units and remote radio heads (RRH)."
      ],
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80"
    },
    router: {
      title: "Router & Switch Installation",
      icon: <HardDrive size={32} />,
      desc: "Professional enterprise router configuration, network switch mounting, port patching, and sub-interface config to link local cells to high-speed fiber backhauls.",
      points: [
        "VLAN design, routing tables, and interface IP mapping.",
        "Optic transceivers connection and structural patch bay cabling.",
        "Firewall integration, security rule configuration, and QoS setups.",
        "Comprehensive throughput load testing and routing failover checks."
      ],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    },
    network: {
      title: "Network Testing",
      icon: <Network size={32} />,
      desc: "End-to-end network benchmarking to detect bottleneck links, latency peaks, packet losses, and interface configuration issues.",
      points: [
        "Latency checks, packet loss monitoring, and ping audits.",
        "Data throughput capacity checks under peak load simulations.",
        "QoS alignment audits to ensure VoIP and data streaming prioritize correctly.",
        "Detailed performance graphs and interface config suggestions."
      ],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
    },
    microwave: {
      title: "Microwave Link Installation",
      icon: <Activity size={32} />,
      desc: "Installing high-capacity microwave dishes, structural brackets, outdoor transceivers, and fine-tuning link alignment to establish high-uptime point-to-point backhauls.",
      points: [
        "Brackets mounting on towers and alignment to correct azimuths.",
        "Fine-tuning antenna pitch and yaw to maximize signal voltage.",
        "Outdoor unit (ODU) and indoor unit (IDU) coaxial/fiber connection.",
        "Uptime validation under rainy or high-wind simulation metrics."
      ],
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80"
    },
    scft: {
      title: "Single Cell Functional Test (SCFT)",
      icon: <ShieldCheck size={32} />,
      desc: "Single Cell Functional Testing verifies individual cell nodes upon integration to ensure call Handover, data download speed, upload speed, and voice calling work correctly.",
      points: [
        "Stationary and drive test calling validations.",
        "Handover checks between adjacent sector antennas.",
        "Ping, FTP download/upload, and VoIP quality checks.",
        "Alarm verification and controller integration logs check."
      ],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
    },
    cluster: {
      title: "Cluster Testing",
      icon: <Database size={32} />,
      desc: "Cluster testing evaluates a group of network cells simultaneously during drive testing to optimize handovers, remove coverage holes, and optimize frequency patterns.",
      points: [
        "Drive test routing map execution in the target zone.",
        "Coverage hole detection and signal overlap calculations.",
        "Neighbor relations lists optimization.",
        "RF parameters fine-tuning (transmit power, antenna tilt)."
      ],
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80"
    },
    ubr: {
      title: "Unlicensed Band Radio (UBR) Installation",
      icon: <Cpu size={32} />,
      desc: "Unlicensed Band Radio (UBR) setups provide cost-effective wireless backhaul using open-access spectrum bands, configured for corporate links or low-traffic nodes.",
      points: [
        "Spectrum scan to find free frequencies (5.8 GHz, 24 GHz, etc.).",
        "Antenna mounting and link configuration.",
        "Interference shielding and mechanical storm protection.",
        "Secure wireless encryption and throughput configurations."
      ],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    },
    odse: {
      title: "Outdoor Distributed System Equipment (ODSE)",
      icon: <Award size={32} />,
      desc: "Deploying outdoor cabinets, localized cooling systems, power backup rectifiers, and specialized electrical switches for decentralized nodes.",
      points: [
        "Weatherproof cabinet placement and structural anchoring.",
        "Backup battery bank and rectifier power setup.",
        "Cooling fans and environmental alarm sensor checks.",
        "System integration and fiber optic distribution panel patching."
      ],
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80"
    }
  };

  const listServices = [
    { id: 'los', name: 'LOS Survey' },
    { id: 'rf', name: 'RF Survey' },
    { id: 'emf', name: 'EMF Survey' },
    { id: 'bts', name: 'BTS Installation' },
    { id: 'router', name: 'Router Installation' },
    { id: 'network', name: 'Network Testing' },
    { id: 'microwave', name: 'Microwave Link' },
    { id: 'scft', name: 'SCFT Testing' },
    { id: 'cluster', name: 'Cluster Testing' },
    { id: 'ubr', name: 'UBR Installation' },
    { id: 'odse', name: 'ODSE Installation' }
  ];

  // Default to 'los' if parameter is missing or invalid
  const currentKey = servicesData[serviceId] ? serviceId : 'los';
  const service = servicesData[currentKey];

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      {/* Responsive layout styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .telecom-grid {
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
          .telecom-grid {
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
        <h1 className="section-title">Telecom Infrastructure Services</h1>
        <p className="section-subtitle">
          Professional field engineering, radio surveys, node integrations, and safety audits.
        </p>
      </div>

      <div className="telecom-grid">
        {/* Sidebar Navigation */}
        <aside>
          <div className="sidebar-menu">
            {listServices.map((item) => (
              <Link 
                key={item.id} 
                to={`/telecom/${item.id}`} 
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
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>Scope of Operations</h3>
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
              <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Need this infrastructure service?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get in touch with our certified engineers to plan your site configuration.</p>
            </div>
            <Link to="/contact" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              Request A Quote
            </Link>
          </div>
        </main>
      </div>

    </div>
  );
}
