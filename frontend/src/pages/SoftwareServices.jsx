import { useParams, Link } from 'react-router-dom';
import { Code, Layout, Server, Palette, Search, Smartphone, ShoppingCart, Database,
  Cloud, Shield, Settings, Monitor, Cpu, BarChart3, Users, Package,
  Truck, UtensilsCrossed, Building2, GraduationCap, HeartPulse,
  Wrench, GitBranch, Globe, TestTube, LifeBuoy } from 'lucide-react';

const IMG = {
  code:    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  design:  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  mobile:  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
  cloud:   'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  server:  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  ecom:    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
  hrms:    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  erp:     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  school:  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  hospital:'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
  resto:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  logistics:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  pos:     'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  test:    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
};

const servicesData = {
  /* ── Core Development ── */
  'software-company': {
    title: 'Software Development Company in India',
    meta: 'Rancom Technologies – Top Software Development Company in India offering Custom Software, MERN Stack, Java, HRMS, ERP, and Mobile App solutions.',
    icon: <Cpu size={32} />, image: IMG.code,
    desc: 'Rancom Technologies is a leading Software Development Company in India, delivering enterprise-grade custom software solutions for startups, SMBs, and large enterprises. Our certified developers build scalable, secure, and high-performance software products tailored to your exact business workflows.',
    points: ['Custom web & mobile software from scratch','MERN Stack, Java, Spring Boot, React Native','HRMS, ERP, CRM, POS, and SaaS platforms','Agile delivery with transparent milestones','Post-launch support & annual maintenance contracts','Serving clients across India, UAE, UK, and USA'],
  },
  'custom-software': {
    title: 'Custom Software Development',
    meta: 'Custom Software Development services by Rancom Technologies – tailor-made business applications built with MERN Stack, Java, and cloud-native architectures.',
    icon: <Code size={32} />, image: IMG.code,
    desc: 'We build fully custom software solutions designed around your unique business logic. From internal operations tools to customer-facing SaaS platforms, our custom development eliminates the compromises of off-the-shelf software.',
    points: ['Requirement analysis & system architecture design','Full-stack custom web application development','Database design (MongoDB, PostgreSQL, MySQL)','REST API & microservices architecture','Role-based access control & secure authentication','Scalable cloud deployment on AWS / Azure / GCP'],
  },
  'web-development': {
    title: 'Web Development Company',
    meta: 'Professional Web Development Company – Rancom Technologies builds fast, SEO-ready, responsive web applications using React, Node.js, and MongoDB.',
    icon: <Globe size={32} />, image: IMG.code,
    desc: 'As a full-service Web Development Company, we build high-performance, SEO-optimized web applications for businesses across all industries. Every site we deliver is mobile-first, fast-loading, and built for long-term scalability.',
    points: ['MERN Stack & full-stack web application development','E-commerce websites with payment gateway integration','Corporate portals, dashboards & CMS development','Core Web Vitals optimization for Google rankings','Progressive Web App (PWA) development','Custom APIs and third-party integrations'],
  },
  'website-design': {
    title: 'Website Design Company',
    meta: 'Website Design Company – Rancom Technologies creates beautiful, conversion-optimized UI/UX designs for websites, apps, and digital products.',
    icon: <Layout size={32} />, image: IMG.design,
    desc: 'Our design team creates visually stunning, user-friendly websites that convert visitors into customers. We combine modern UI trends with strategic UX principles to deliver designs that are beautiful, accessible, and performance-optimized.',
    points: ['Custom UI/UX design with brand guidelines','Mobile-first responsive layouts','Figma/Adobe XD wireframing & prototyping','Landing page & conversion rate optimization','Accessibility (WCAG) compliant designs','Brand identity — logos, color palettes, typography'],
  },
  'mern-stack': {
    title: 'MERN Stack Development',
    meta: 'Expert MERN Stack Development – MongoDB, Express.js, React, Node.js – for web apps, SaaS, dashboards and portals by Rancom Technologies India.',
    icon: <Code size={32} />, image: IMG.code,
    desc: 'Our MERN Stack developers build real-time, scalable web applications using MongoDB, Express.js, React.js, and Node.js. A single JavaScript codebase across frontend and backend means faster development, lower costs, and seamless data flow.',
    points: ['Single-page applications (SPA) with React','RESTful & GraphQL API development with Node/Express','MongoDB Atlas schema design & optimization','JWT authentication & role-based access control','Real-time features with Socket.io','Deployment on AWS EC2, Vercel, Render, or Railway'],
  },
  'java-development': {
    title: 'Java Development Services',
    meta: 'Enterprise Java Development Services – Spring Boot, Hibernate, Microservices – by Rancom Technologies for banking, ERP, and government systems.',
    icon: <Cpu size={32} />, image: IMG.server,
    desc: 'Our Java development team builds robust, enterprise-grade backend systems with Spring Boot, Hibernate, and Java EE. Ideal for high-transaction banking systems, government platforms, ERP backends, and large-scale microservices architectures.',
    points: ['Spring Boot REST API & microservices development','Hibernate ORM & JPA database integration','Enterprise Java EE application development','High-concurrency, multi-threaded backend systems','JWT & OAuth2 security implementation','Containerized deployment with Docker & Kubernetes'],
  },
  'spring-boot': {
    title: 'Spring Boot Development',
    meta: 'Spring Boot Development Company – Rancom Technologies builds microservices, REST APIs, and enterprise backends with Spring Boot and Spring Cloud.',
    icon: <Settings size={32} />, image: IMG.server,
    desc: 'Spring Boot is the gold standard for building production-ready Java microservices. We design and deploy Spring Boot applications that are fast to develop, easy to maintain, and built for enterprise scale.',
    points: ['Spring Boot REST & GraphQL API development','Spring Security with JWT & OAuth2','Spring Data JPA with PostgreSQL/MySQL/MongoDB','Spring Cloud microservices with Eureka & API Gateway','Actuator health monitoring & metrics integration','Docker-based containerization & CI/CD pipeline setup'],
  },
  'reactjs-development': {
    title: 'React.js Development',
    meta: 'React.js Development Services – Expert React developers at Rancom Technologies build fast, interactive SPAs, dashboards, and enterprise frontends.',
    icon: <Monitor size={32} />, image: IMG.design,
    desc: 'React.js powers the fastest, most interactive web frontends in the industry. Our React developers build single-page applications, admin dashboards, e-commerce frontends, and complex data visualization tools with clean, maintainable code.',
    points: ['Single-Page Application (SPA) development','React + Redux / Zustand state management','Component library development & design systems','Next.js for SEO-optimized server-side rendering','Integration with REST APIs & GraphQL backends','Performance optimization — lazy loading, code splitting'],
  },
  'nodejs-development': {
    title: 'Node.js Development',
    meta: 'Node.js Development Services – Rancom Technologies builds scalable, non-blocking REST APIs, real-time apps, and microservices with Node.js and Express.',
    icon: <Server size={32} />, image: IMG.server,
    desc: 'Node.js enables high-throughput, non-blocking I/O servers ideal for real-time applications, APIs, and microservices. Our Node.js developers build production-grade backends for startups and enterprises.',
    points: ['Express.js & Fastify REST API development','Real-time applications with Socket.io & WebSockets','Node.js microservices architecture','MongoDB, PostgreSQL & Redis integration','JWT authentication & middleware pipelines','PM2 process management & load balancing'],
  },
  'mobile-app': {
    title: 'Mobile App Development',
    meta: 'Mobile App Development Company India – Rancom Technologies builds cross-platform Android & iOS apps with React Native for businesses of all sizes.',
    icon: <Smartphone size={32} />, image: IMG.mobile,
    desc: 'We are a leading Mobile App Development Company in India, building cross-platform mobile apps using React Native that run natively on both Android and iOS from a single codebase — reducing cost without compromising quality.',
    points: ['Cross-platform apps with React Native (Android + iOS)','E-commerce, booking, delivery & HRMS mobile apps','Offline-first architecture for low-connectivity markets','Push notifications (FCM / APNs) integration','Payment gateway (Razorpay, Stripe) integration','Google Play Store & App Store deployment'],
  },
  'android-app': {
    title: 'Android App Development',
    meta: 'Android App Development Company India – Native and React Native Android applications by Rancom Technologies for e-commerce, HRMS, logistics, and more.',
    icon: <Smartphone size={32} />, image: IMG.mobile,
    desc: 'Our Android developers build native and React Native Android applications optimized for performance, battery efficiency, and India\'s diverse device ecosystem. From Play Store listing to post-launch updates, we handle the complete lifecycle.',
    points: ['Native Android development with Kotlin/Java','React Native cross-platform Android apps','Material Design UI implementation','Firebase integration (Auth, Firestore, Notifications)','Google Maps & GPS integration','Play Store submission & ASO optimization'],
  },
  'ios-app': {
    title: 'iOS App Development',
    meta: 'iOS App Development Services – Rancom Technologies builds Swift and React Native iOS apps with premium UX for iPhone and iPad.',
    icon: <Smartphone size={32} />, image: IMG.mobile,
    desc: 'We build premium iOS applications using Swift and React Native that meet Apple\'s strict quality guidelines. Our apps are designed for exceptional UX, peak performance on all iPhone/iPad models, and successful App Store approval.',
    points: ['Native iOS development with Swift & SwiftUI','React Native cross-platform iOS apps','Apple Human Interface Guidelines (HIG) compliance','Apple Pay, Face ID & Touch ID integration','Core Data & CloudKit storage integration','TestFlight beta testing & App Store submission'],
  },
  'ecommerce': {
    title: 'E-commerce Development',
    meta: 'E-commerce Development Company India – Custom online store development with Razorpay, COD, inventory management, and GST compliance by Rancom Technologies.',
    icon: <ShoppingCart size={32} />, image: IMG.ecom,
    desc: 'We build custom e-commerce platforms built for India\'s market — GST compliance, Indian payment gateways (Razorpay, CCAvenue, PayU), Hindi/English bilingual support, and mobile-first design optimized for Tier 2/3 markets.',
    points: ['Custom product catalog with categories & variants','Razorpay / Stripe / PayU payment integration','Order management, tracking & invoice generation','GST-compliant billing & tax calculation','Multi-vendor marketplace development','Admin dashboard with sales analytics & inventory'],
  },
  'erp-software': {
    title: 'ERP Software Development',
    meta: 'ERP Software Development Company India – Custom ERP systems for manufacturing, retail, construction & distribution by Rancom Technologies.',
    icon: <BarChart3 size={32} />, image: IMG.erp,
    desc: 'Our custom ERP software integrates your entire business — finance, inventory, procurement, HR, sales, and manufacturing — into one unified platform. Built for Indian businesses with GST compliance, multi-branch support, and mobile access.',
    points: ['Finance & accounts with GST / TDS automation','Inventory & warehouse management system','Purchase order & vendor management','Sales order processing & CRM integration','Multi-branch / multi-company support','Role-based dashboards with real-time KPIs'],
  },
  'crm-software': {
    title: 'CRM Software Development',
    meta: 'Custom CRM Software Development – Lead management, sales pipeline, customer support & analytics CRM systems by Rancom Technologies India.',
    icon: <Users size={32} />, image: IMG.hrms,
    desc: 'Our custom CRM software helps your sales and support teams capture leads, manage pipelines, automate follow-ups, and deliver exceptional customer service. Built specifically for your industry and sales process.',
    points: ['Lead capture from web, email & social channels','Visual sales pipeline with drag-and-drop stages','Automated email & SMS follow-up campaigns','Customer support ticket management','Sales forecasting & revenue analytics','Mobile CRM app for field sales teams'],
  },
  'hrms-software': {
    title: 'HRMS Software Development',
    meta: 'HRMS Software Development Company India – Custom HR Management Systems with payroll, attendance, leave & recruitment by Rancom Technologies.',
    icon: <Users size={32} />, image: IMG.hrms,
    desc: 'We build comprehensive HRMS platforms that automate your entire HR lifecycle — from recruitment and onboarding to payroll processing and compliance reporting. Used by companies across manufacturing, IT, retail, and services sectors.',
    points: ['Employee self-service portal & digital HR','Biometric / GPS attendance & shift management','Automated payroll with PF, ESI, TDS, Form 16','Leave management with approval workflows','Performance management & KPI tracking','Statutory compliance reports — PF ECR, ESIC, PT'],
  },
  'pos-software': {
    title: 'POS Software Development',
    meta: 'Custom POS Software Development – Point of Sale systems for retail, restaurants, and supermarkets with inventory and GST billing by Rancom Technologies.',
    icon: <Package size={32} />, image: IMG.pos,
    desc: 'Our custom POS software provides fast, reliable billing with real-time inventory updates, customer loyalty programs, and GST-compliant invoicing. Works on touchscreen terminals, tablets, and Android devices.',
    points: ['Fast barcode scanning & touchscreen billing','Real-time inventory deduction on each sale','GST-compliant invoice & receipt generation','Customer loyalty points & discount management','Multi-outlet centralized sales reporting','Offline billing mode for internet outages'],
  },
  'inventory-software': {
    title: 'Inventory Management Software',
    meta: 'Custom Inventory Management Software – Real-time stock tracking, reorder alerts, multi-warehouse, and barcode integration by Rancom Technologies India.',
    icon: <Package size={32} />, image: IMG.erp,
    desc: 'Our inventory management software gives you real-time visibility into stock levels across all warehouses and outlets. Eliminate stockouts, reduce waste, and automate reordering with intelligent threshold alerts.',
    points: ['Real-time multi-warehouse stock tracking','Barcode & QR code scanning integration','Automated reorder alerts & purchase orders','Batch tracking, serial numbers & expiry management','Supplier management & cost price tracking','Integration with POS, ERP & e-commerce platforms'],
  },
  'payroll-software': {
    title: 'Payroll Management Software',
    meta: 'Payroll Management Software India – Automated payroll with PF, ESI, TDS, Form 16, and bank transfer by Rancom Technologies.',
    icon: <BarChart3 size={32} />, image: IMG.hrms,
    desc: 'Our payroll management software automates the entire salary cycle — from attendance import to bank transfer — with full compliance for Indian statutory requirements including PF, ESI, professional tax, and TDS.',
    points: ['Automated salary calculation with all deductions','PF, ESI, PT, TDS, and LWF compliance','Salary slip generation & emailing to employees','Form 16, Form 12BA & payroll register reports','Direct bank transfer integration','Leave encashment, arrear & bonus processing'],
  },
  'school-software': {
    title: 'School Management Software',
    meta: 'School Management Software Development – Student information, fee collection, attendance, timetable & parent app by Rancom Technologies India.',
    icon: <GraduationCap size={32} />, image: IMG.school,
    desc: 'Our school management software digitalizes every aspect of school administration — from student admissions and fee collection to attendance, exams, and parent communication. Built for CBSE, ICSE, and state board schools.',
    points: ['Student admission & profile management','Online fee collection with Razorpay integration','Biometric / RFID attendance with parent SMS alerts','Timetable & examination schedule management','Report card generation & grade management','Parent mobile app for real-time updates'],
  },
  'hospital-software': {
    title: 'Hospital Management Software',
    meta: 'Hospital Management Software Development – OPD, IPD, pharmacy, billing & EMR system by Rancom Technologies India.',
    icon: <HeartPulse size={32} />, image: IMG.hospital,
    desc: 'Our Hospital Management System (HMS) digitizes patient care workflows from OPD registration to discharge, pharmacy management, lab reports, and insurance billing — improving efficiency and patient experience.',
    points: ['OPD & IPD patient registration & management','Electronic Medical Records (EMR) with doctor notes','Pharmacy inventory & prescription management','Lab order management & digital report delivery','NABH-ready billing with insurance claim support','Appointment booking via web & mobile app'],
  },
  'restaurant-software': {
    title: 'Restaurant Management Software',
    meta: 'Restaurant Management Software – Table management, KOT, billing, online ordering & inventory for restaurants by Rancom Technologies India.',
    icon: <UtensilsCrossed size={32} />, image: IMG.resto,
    desc: 'Our restaurant management software streamlines table management, kitchen order tickets (KOT), billing, and inventory — helping restaurant owners reduce costs, speed up service, and grow with online ordering.',
    points: ['Table management with digital menu ordering','Kitchen Order Ticket (KOT) system for chefs','GST-compliant billing & daily sales reports','Online ordering integration (Swiggy/Zomato APIs)','Inventory & recipe cost management','Customer loyalty program & feedback system'],
  },
  'logistics-software': {
    title: 'Logistics Software Development',
    meta: 'Logistics Software Development – Fleet management, shipment tracking, route optimization & delivery management by Rancom Technologies India.',
    icon: <Truck size={32} />, image: IMG.logistics,
    desc: 'Our logistics software helps transportation and delivery companies manage fleets, track shipments in real-time, optimize routes, and automate dispatch operations — reducing costs and improving delivery accuracy.',
    points: ['Real-time GPS vehicle & shipment tracking','Route optimization with Google Maps API','Driver mobile app for delivery management','Automated dispatch & load planning','Customer tracking link & delivery notifications','Fuel, maintenance & trip cost reporting'],
  },
  'saas-development': {
    title: 'SaaS Application Development',
    meta: 'SaaS Application Development Company India – Multi-tenant SaaS platforms with subscription billing, REST APIs, and cloud deployment by Rancom Technologies.',
    icon: <Cloud size={32} />, image: IMG.cloud,
    desc: 'We build production-ready SaaS platforms with multi-tenant architecture, subscription billing (Stripe/Razorpay), and cloud-native deployment. From MVP to enterprise-scale, we deliver SaaS products that grow with your customers.',
    points: ['Multi-tenant SaaS architecture design','Subscription billing with Stripe / Razorpay','Role-based access — super admin, tenants, users','Onboarding flows, trial management & upgrades','API-first design for partner integrations','Auto-scaling deployment on AWS / GCP'],
  },
  'api-development': {
    title: 'API Development Services',
    meta: 'API Development Company – RESTful APIs, GraphQL, and microservices integration by Rancom Technologies for web, mobile, and enterprise systems.',
    icon: <GitBranch size={32} />, image: IMG.server,
    desc: 'We design and build robust, well-documented APIs that power your web apps, mobile apps, and third-party integrations. Our APIs are built for performance, security, and long-term maintainability.',
    points: ['RESTful API design following OpenAPI / Swagger spec','GraphQL API development for flexible data querying','JWT, OAuth2 & API key authentication','Rate limiting, throttling & DDoS protection','Webhook implementation for event-driven workflows','Comprehensive Postman documentation & sandbox'],
  },
  'cloud-solutions': {
    title: 'Cloud Solutions',
    meta: 'Cloud Solutions Company India – AWS, Azure, GCP migration, cloud architecture, and DevOps services by Rancom Technologies.',
    icon: <Cloud size={32} />, image: IMG.cloud,
    desc: 'We help Indian businesses migrate to the cloud, architect scalable cloud-native applications, and optimize infrastructure costs. Our cloud engineers are certified across AWS, Azure, and Google Cloud Platform.',
    points: ['Cloud migration planning & execution','AWS / Azure / GCP infrastructure setup','Serverless architecture with Lambda / Cloud Functions','Database migration to cloud-managed services','Cost optimization & reserved instance planning','24/7 cloud monitoring with CloudWatch / Datadog'],
  },
  'devops': {
    title: 'DevOps Services',
    meta: 'DevOps Services India – CI/CD pipelines, Docker, Kubernetes, and infrastructure automation by Rancom Technologies.',
    icon: <GitBranch size={32} />, image: IMG.cloud,
    desc: 'Our DevOps engineers automate your software delivery pipeline, containerize applications, and implement infrastructure-as-code — enabling faster releases, fewer bugs in production, and lower operational costs.',
    points: ['CI/CD pipeline setup with GitHub Actions / Jenkins','Docker containerization & Kubernetes orchestration','Infrastructure as Code with Terraform & Ansible','Automated testing integration in CI pipelines','Log aggregation with ELK Stack / Grafana','Zero-downtime blue-green & canary deployments'],
  },
  'aws-consulting': {
    title: 'AWS Consulting Services',
    meta: 'AWS Consulting Company India – EC2, RDS, S3, Lambda, and cloud architecture design by certified AWS consultants at Rancom Technologies.',
    icon: <Cloud size={32} />, image: IMG.cloud,
    desc: 'Our AWS consultants design, deploy, and optimize AWS infrastructure for startups and enterprises. From EC2 and RDS to Lambda serverless and EKS containerized workloads — we ensure your AWS environment is secure, scalable, and cost-efficient.',
    points: ['AWS Well-Architected Framework review','EC2, Auto Scaling & Load Balancer configuration','RDS, DynamoDB & ElastiCache database setup','S3, CloudFront CDN & Route 53 DNS management','Lambda serverless function development','AWS IAM security policies & compliance setup'],
  },
  'ui-ux-design': {
    title: 'UI/UX Design Services',
    meta: 'UI/UX Design Company India – User research, wireframing, Figma prototyping, and conversion-focused design by Rancom Technologies.',
    icon: <Palette size={32} />, image: IMG.design,
    desc: 'Our UI/UX designers create intuitive, beautiful interfaces backed by user research and data. We design for clarity, engagement, and conversion — whether for web apps, mobile apps, or SaaS dashboards.',
    points: ['User research, personas & journey mapping','Information architecture & wireframing','High-fidelity Figma / Adobe XD prototyping','Design system & component library creation','Usability testing & heatmap analysis','Handoff to developers with pixel-perfect specs'],
  },
  'qa-testing': {
    title: 'QA & Software Testing',
    meta: 'QA & Software Testing Services India – Manual, automation, performance, and security testing by Rancom Technologies.',
    icon: <TestTube size={32} />, image: IMG.test,
    desc: 'Our QA engineers ensure your software is bug-free, performant, and secure before it reaches your users. We offer manual, automated, performance, and security testing tailored to your technology stack.',
    points: ['Manual functional & regression testing','Selenium / Playwright automated UI testing','Jest / Mocha unit & integration testing','JMeter performance & load testing','OWASP-based security & penetration testing','Test report generation & defect lifecycle management'],
  },
  'software-maintenance': {
    title: 'Software Maintenance & Support',
    meta: 'Software Maintenance & Support – Annual maintenance contracts, bug fixes, upgrades, and 24/7 monitoring by Rancom Technologies India.',
    icon: <LifeBuoy size={32} />, image: IMG.server,
    desc: 'We provide comprehensive software maintenance and support services to keep your applications running smoothly. Our AMC packages include bug fixing, security patches, performance monitoring, and feature enhancements.',
    points: ['Annual Maintenance Contracts (AMC) for all platforms','24/7 application monitoring & incident alerting','Bug fixes, security patches & dependency updates','Performance optimization & database tuning','Feature enhancements & version upgrades','Dedicated support via email, phone & ticket system'],
  },
  /* ── Legacy routes (kept for backward compatibility) ── */
  development: {
    title: 'Web Development Services',
    meta: 'Full-stack web development company – MERN Stack, React, Node.js by Rancom Technologies India.',
    icon: <Code size={32} />, image: IMG.code,
    desc: 'We deliver full-stack coding configurations utilizing secure web architectures. From custom content management systems and dynamic portals to complex database-driven websites, our clean coding practices ensure high speed, search compliance, and absolute maintainability.',
    points: ['Full-stack MERN application design','Custom APIs, dashboards & secure user logins','Scalable database integration (MongoDB, SQL)','Clean, documented code for long-term scalability'],
  },
  design: {
    title: 'Web Designing & UX/UI',
    meta: 'Website design company India – UI/UX, responsive layouts, branding by Rancom Technologies.',
    icon: <Layout size={32} />, image: IMG.design,
    desc: 'We design gorgeous, responsive user interfaces that reflect your corporate identity. We optimize every pixel to ensure user interactions are fluid, visual structures are clear, and responsive animations load effortlessly on any browser.',
    points: ['Premium, modern graphic layouts with responsive systems','Mobile-first, fluid grid styling','Subtle micro-animations and glassmorphism palettes','Wireframing, UI prototyping & branding integration'],
  },
  hosting: {
    title: 'Premium Web Hosting',
    meta: 'Web hosting services India – SSL, SSD servers, domain, business email by Rancom Technologies.',
    icon: <Server size={32} />, image: IMG.server,
    desc: 'Our web hosting structures provide absolute uptime, secure web servers, and automatic server failover. We manage corporate domain names, SSL certificates, database backups, and custom professional mail servers.',
    points: ['High-uptime SSD servers','Free SSL encryption certificate setup','Corporate business email integration','Periodic automated backups & instant deployment'],
  },
  logo: {
    title: 'Corporate Logo Design',
    meta: 'Logo design company India – vector logos, brand identity, style guides by Rancom Technologies.',
    icon: <Palette size={32} />, image: IMG.design,
    desc: 'A corporate logo is the graphic embodiment of your brand identity. We design professional vector assets, emblems, and typographic brands that help customers identify your enterprise instantly.',
    points: ['Custom high-resolution vector assets','Multiple design concepts with review adjustments','Branding guidelines — color palettes & fonts','Export formats for digital platforms & print'],
  },
  seo: {
    title: 'Search Engine Optimization (SEO)',
    meta: 'SEO services India – keyword research, technical SEO, Google rankings by Rancom Technologies.',
    icon: <Search size={32} />, image: IMG.code,
    desc: 'Our SEO services verify structure, page load speeds, meta indexing tags, and keyword densities. By aligning page coding with modern ranking guidelines, we push your site higher on organic search pages.',
    points: ['Comprehensive website audits & speed optimization','Keyword research & meta tags configuration','Search console indexing (Google, Bing, Yahoo)','Ongoing performance monitoring & rank tracking'],
  },
};

export const allServiceLinks = [
  { id: 'software-company',     name: 'Software Development Company' },
  { id: 'custom-software',      name: 'Custom Software Development' },
  { id: 'web-development',      name: 'Web Development Company' },
  { id: 'website-design',       name: 'Website Design Company' },
  { id: 'mern-stack',           name: 'MERN Stack Development' },
  { id: 'java-development',     name: 'Java Development Services' },
  { id: 'spring-boot',          name: 'Spring Boot Development' },
  { id: 'reactjs-development',  name: 'React.js Development' },
  { id: 'nodejs-development',   name: 'Node.js Development' },
  { id: 'mobile-app',           name: 'Mobile App Development' },
  { id: 'android-app',          name: 'Android App Development' },
  { id: 'ios-app',              name: 'iOS App Development' },
  { id: 'ecommerce',            name: 'E-commerce Development' },
  { id: 'erp-software',         name: 'ERP Software Development' },
  { id: 'crm-software',         name: 'CRM Software Development' },
  { id: 'hrms-software',        name: 'HRMS Software Development' },
  { id: 'pos-software',         name: 'POS Software Development' },
  { id: 'inventory-software',   name: 'Inventory Management Software' },
  { id: 'payroll-software',     name: 'Payroll Management Software' },
  { id: 'school-software',      name: 'School Management Software' },
  { id: 'hospital-software',    name: 'Hospital Management Software' },
  { id: 'restaurant-software',  name: 'Restaurant Management Software' },
  { id: 'logistics-software',   name: 'Logistics Software' },
  { id: 'saas-development',     name: 'SaaS Application Development' },
  { id: 'api-development',      name: 'API Development' },
  { id: 'cloud-solutions',      name: 'Cloud Solutions' },
  { id: 'devops',               name: 'DevOps Services' },
  { id: 'aws-consulting',       name: 'AWS Consulting' },
  { id: 'ui-ux-design',         name: 'UI/UX Design' },
  { id: 'qa-testing',           name: 'QA & Software Testing' },
  { id: 'software-maintenance', name: 'Software Maintenance & Support' },
];

export default function SoftwareServices() {
  const { serviceId } = useParams();
  const currentKey = servicesData[serviceId] ? serviceId : 'software-company';
  const service = servicesData[currentKey];

  return (
    <div className="animate-fade-in" style={{ paddingTop: '2rem' }}>

      {/* Page-level SEO meta via document.title */}
      {typeof document !== 'undefined' && (document.title = `${service.title} | Rancom Technologies`)}

      <style dangerouslySetInnerHTML={{__html: `
        .svc-hero { background: linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);
          border-bottom: 1px solid rgba(14,165,233,0.15); padding: 3rem 0 2.5rem; text-align:center; }
        .svc-layout { display:grid; grid-template-columns:260px 1fr; gap:2.5rem;
          max-width:1280px; margin:2.5rem auto 4rem; padding:0 2rem; }
        .svc-sidebar { display:flex; flex-direction:column; gap:0.35rem; position:sticky; top:90px; align-self:start; max-height:85vh; overflow-y:auto; }
        .svc-sidebar-section { font-size:0.7rem; font-weight:800; color:#94a3b8; letter-spacing:0.1em;
          text-transform:uppercase; padding:0.9rem 0.5rem 0.35rem; }
        .svc-nav-item { display:block; padding:0.55rem 0.9rem; border-radius:7px; font-size:0.82rem;
          font-weight:500; color:#475569; transition:all 0.18s; border:1px solid transparent; }
        .svc-nav-item:hover { background:rgba(14,165,233,0.08); color:#0ea5e9; }
        .svc-nav-item.active { background:rgba(14,165,233,0.12); color:#0284c7;
          border-color:rgba(14,165,233,0.3); font-weight:700; padding-left:1.1rem; }
        .svc-main { background:white; border:1px solid rgba(14,165,233,0.18);
          border-radius:16px; padding:2.5rem; box-shadow:0 4px 24px rgba(0,0,0,0.07); }
        .svc-points { list-style:none; display:grid; grid-template-columns:1fr 1fr; gap:0.6rem 1.5rem; margin:1.5rem 0; }
        .svc-point { display:flex; gap:0.5rem; align-items:flex-start; font-size:0.92rem; color:#334155; }
        .svc-point-check { color:#06b6d4; font-weight:800; flex-shrink:0; margin-top:1px; }
        .svc-img { border-radius:12px; overflow:hidden; border:1px solid rgba(14,165,233,0.18); margin:1.75rem 0; }
        .svc-img img { width:100%; height:220px; object-fit:cover; display:block; }
        .svc-cta { background:linear-gradient(135deg,#f0f9ff,#e0f2fe);
          border:1px solid rgba(14,165,233,0.2); border-radius:12px;
          padding:1.75rem 2rem; display:flex; justify-content:space-between;
          align-items:center; flex-wrap:wrap; gap:1rem; margin-top:2rem; }
        .svc-related { max-width:1280px; margin:0 auto 4rem; padding:0 2rem; }
        .svc-related-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.75rem; margin-top:1.25rem; }
        .svc-related-card { display:block; padding:0.8rem 1rem; background:white;
          border:1px solid rgba(14,165,233,0.2); border-radius:10px; font-size:0.85rem;
          font-weight:600; color:#0f172a; transition:all 0.18s; text-align:center; }
        .svc-related-card:hover { border-color:var(--primary); color:var(--primary); transform:translateY(-2px); }
        @media(max-width:900px){
          .svc-layout{grid-template-columns:1fr;gap:1.5rem;}
          .svc-sidebar{position:static;flex-direction:row;flex-wrap:wrap;max-height:none;overflow:visible;}
          .svc-nav-item{font-size:0.78rem;padding:0.4rem 0.75rem;}
          .svc-sidebar-section{display:none;}
          .svc-points{grid-template-columns:1fr;}
        }
        @media(max-width:640px){.svc-main{padding:1.5rem;}.svc-cta{flex-direction:column;align-items:flex-start;}}
      `}} />

      {/* Hero */}
      <div className="svc-hero">
        <div className="container-width">
          <span className="hero-subtitle">RANCOM TECHNOLOGIES</span>
          <h1 style={{fontSize:'2.4rem',fontWeight:800,color:'#0f172a',margin:'0.5rem 0 1rem',lineHeight:1.2}}>
            {service.title}
          </h1>
          <p style={{color:'#475569',maxWidth:'700px',margin:'0 auto',fontSize:'1.05rem',lineHeight:1.7}}>
            {service.meta}
          </p>
        </div>
      </div>

      <div className="svc-layout">
        {/* Sidebar */}
        <aside>
          <div className="svc-sidebar">
            <span className="svc-sidebar-section">Services</span>
            {allServiceLinks.map(item => (
              <Link key={item.id} to={`/services/${item.id}`}
                className={`svc-nav-item${currentKey === item.id ? ' active' : ''}`}>
                {item.name}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="svc-main">
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.25rem'}}>
            <div style={{color:'var(--secondary)',background:'rgba(6,182,212,0.1)',padding:'0.75rem',borderRadius:'12px',flexShrink:0}}>
              {service.icon}
            </div>
            <h2 style={{fontSize:'1.8rem',fontWeight:800,color:'#0f172a',lineHeight:1.2}}>{service.title}</h2>
          </div>

          <p style={{color:'#334155',fontSize:'1.05rem',lineHeight:1.8,marginBottom:'1rem'}}>{service.desc}</p>

          <h3 style={{color:'#0f172a',fontWeight:700,fontSize:'1.1rem',marginBottom:'0.25rem'}}>What We Deliver</h3>
          <ul className="svc-points">
            {service.points.map((pt, i) => (
              <li key={i} className="svc-point">
                <span className="svc-point-check">✓</span><span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="svc-img">
            <img src={service.image} alt={service.title} loading="lazy" />
          </div>

          {/* Why Rancom block */}
          <div style={{background:'rgba(14,165,233,0.04)',border:'1px solid rgba(14,165,233,0.15)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
            <h3 style={{color:'#0f172a',fontWeight:700,fontSize:'1.05rem',marginBottom:'0.75rem'}}>Why Choose Rancom Technologies?</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.75rem'}}>
              {[['10+ Years','Industry Experience'],['500+','Projects Delivered'],['India & Global','Clients Served'],['Full Support','Post-Launch AMC']].map(([v,l])=>(
                <div key={l} style={{textAlign:'center',padding:'0.75rem',background:'white',borderRadius:'8px',border:'1px solid rgba(14,165,233,0.15)'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'var(--primary)'}}>{v}</div>
                  <div style={{fontSize:'0.78rem',color:'#64748b',fontWeight:600}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-cta">
            <div>
              <h4 style={{color:'#0f172a',fontWeight:800,fontSize:'1.1rem',marginBottom:'0.25rem'}}>
                Ready to build your {service.title.split(' ').slice(0,3).join(' ')}?
              </h4>
              <p style={{color:'#64748b',fontSize:'0.88rem'}}>
                Get a free consultation & project estimate from our experts.
              </p>
            </div>
            <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
              <Link to="/contact" className="btn btn-primary" style={{padding:'0.65rem 1.4rem',fontSize:'0.92rem'}}>
                Get Free Quote
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{padding:'0.65rem 1.4rem',fontSize:'0.92rem'}}>
                Join Our Team
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Related Services */}
      <div className="svc-related">
        <h2 style={{fontSize:'1.4rem',fontWeight:800,color:'#0f172a',marginBottom:'0.25rem'}}>Explore All Services</h2>
        <p style={{color:'#64748b',fontSize:'0.9rem',marginBottom:'1rem'}}>Rancom Technologies – Software Development Company in India</p>
        <div className="svc-related-grid">
          {allServiceLinks.filter(s => s.id !== currentKey).map(s => (
            <Link key={s.id} to={`/services/${s.id}`} className="svc-related-card">{s.name}</Link>
          ))}
        </div>
      </div>

    </div>
  );
}
