const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const Contact = require('./models/Contact');
const Registration = require('./models/Registration');
const Blog = require('./models/Blog');
const Job = require('./models/Job');
const User = require('./models/User');
const EmailVerification = require('./models/EmailVerification');
const ResumeData = require('./models/ResumeData');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('./utils/mailer');

// Import route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const notificationRoutes = require('./routes/notifications');
const assessmentRoutes = require('./routes/assessment');

// Admin credentials (use env vars in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rancom@2026';

const app = express();
const PORT = process.env.PORT || 5000;
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Resume must be a PDF file'), false);
    }
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// SEO: Set X-Robots-Tag header on every response.
// On the custom domain → index, follow.
// On the .onrender.com subdomain → noindex (so Render's staging URL isn't indexed).
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.includes('onrender.com')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  } else {
    res.setHeader('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  }
  next();
});

app.get('/health', (req, res) => { res.status(200).send('OK'); });

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assessment', assessmentRoutes);

// User login endpoint (used by Login.jsx)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const registration = await Registration.findOne({ email: normalizedEmail });
      if (!registration || !registration.password) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const registrationPasswordMatch = await bcrypt.compare(password, registration.password);
      if (!registrationPasswordMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      user = new User({
        name: `${registration.first_name} ${registration.last_name}`.trim(),
        email: registration.email,
        password,
        phone: registration.mobno,
        city: registration.city,
        skills: registration.skills ? registration.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        emailVerified: true,
        emailVerifiedAt: registration.emailVerifiedAt || new Date()
      });
      if (registration.resume) {
        user.resume = registration.resume;
        user.resumeContentType = registration.resumeContentType;
        user.resumeFileName = registration.resumeFileName;
      }
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, city: user.city, skills: user.skills, emailVerified: user.emailVerified } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google Sign-In / Login verification endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required.' });
  }

  try {
    // Decode Google ID Token without verification for demo/testing convenience
    const payload = jwt.decode(credential);
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google credential token.' });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    
    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // First-time user: require entering a password
      return res.json({
        registerRequired: true,
        email: normalizedEmail,
        name: payload.name || ''
      });
    }

    // User exists: login and generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        skills: user.skills,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// Google first-time registration endpoint (requires password)
app.post('/api/auth/google/register', async (req, res) => {
  const { credential, password, phone, city, firstName, lastName, qualification, skills, job_title } = req.body;
  if (!credential || !password) {
    return res.status(400).json({ error: 'Google credential and password are required.' });
  }

  try {
    const payload = jwt.decode(credential);
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google credential token.' });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    // Check if user already exists
    let existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Derive name: prefer explicitly passed first/last, fall back to Google name
    const googleNameParts = (payload.name || '').split(' ');
    const resolvedFirstName = firstName || googleNameParts[0] || 'Google';
    const resolvedLastName = lastName || googleNameParts.slice(1).join(' ') || 'User';
    const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();

    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Create the User
    const user = new User({
      name: fullName,
      email: normalizedEmail,
      password,
      phone: phone || '',
      city: city || '',
      skills: skillsArray,
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    await user.save();

    // Save corresponding Registration document (candidate table)
    const registration = new Registration({
      first_name: resolvedFirstName,
      last_name: resolvedLastName,
      email: normalizedEmail,
      mobno: phone || '',
      city: city || '',
      qualification: qualification || '',
      skills: skills || '',
      password: await bcrypt.hash(password, 10),
      job_title: job_title || 'General Application',
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    await registration.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        skills: user.skills,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    console.error('Google register error:', err);
    return res.status(500).json({ error: err.message || 'Google registration failed.' });
  }
});

// Config endpoint – exposes non-secret public config to the frontend
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedBlogs();
  })
  .catch(err => {
    console.error('MongoDB connection error details:', err.message);
    console.warn('\n======================================================');
    console.warn('WARNING: Could not connect to MongoDB Atlas/Local.');
    console.warn('The application is running in "DEMO MODE" (using temporary memory storage).');
    console.warn('Please update the MONGODB_URI in your .env file with valid credentials.');
    console.warn('======================================================\n');
  });

// Seed default blogs if database is empty
async function seedBlogs() {
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      const defaultBlogs = [
        // ── Original 3 technical posts ──────────────────────────────────────
        {
          title: 'Understanding Line of Sight (LOS) Surveys in Telecom Projects',
          content: 'A Line of Sight (LOS) Survey is a fundamental component of telecommunication planning, determining if a clear RF path exists between two points. It is crucial for microwave link installation and radio network planning. By analyzing topographical maps, physical obstacles, and tree lines, engineers determine the optimum antenna height to avoid signal attenuation and ensure 99.999% network availability. Our team at Rancom Technologies utilizes state-of-the-art GPS receivers, high-frequency binoculars, and automated path loss software to guarantee precise and reliable survey results.',
          author: 'Telecom Engineering Team',
          tags: ['LOS Survey', 'Microwave', 'Telecom', 'Infrastructure']
        },
        {
          title: 'The Essential Role of BTS Installation in Modern Cell Networks',
          content: 'Base Transceiver Stations (BTS) are the critical nodes connecting user devices to the core mobile network. Installing a BTS requires deep expertise in electrical systems, RF cabling, mechanical hoisting, and fiber optic configuration. With the transition to 5G, massive MIMO antennas and high-speed Baseband Units (BBUs) must be deployed with absolute precision. At Rancom Technologies, we provide full end-to-end BTS installation, integration, and commission services. Our certified technicians ensure structural integrity, grounding protection, and optimal antenna tilting to maximize cell coverage and throughput.',
          author: 'Network Deployment Unit',
          tags: ['BTS', '5G', 'Installation', 'Mobile Network']
        },
        {
          title: 'Why SEO and High-Performance Web Development Go Hand in Hand',
          content: 'In the digital age, a website is only as good as its visibility and performance. Clean coding, optimized database designs, and responsive layouts are not just developer preferences—they are vital search engine ranking factors. Google\'s core web vitals prioritize fast page loading, visual stability, and responsive interaction. By building web applications using modern, systematic design methods, organizations can achieve superior search engine rankings, leading to organic traffic growth and increased conversion rates. Our software services team specializes in designing high-speed, SEO-ready web applications customized to your corporate brand.',
          author: 'Software Development Division',
          tags: ['Web Development', 'SEO', 'Performance', 'Software Services']
        },

        // ── SEO-targeted blog posts ──────────────────────────────────────────
        {
          title: 'MERN vs Java: Which Stack is Better for Your Business in 2025?',
          content: `When choosing a technology stack for your next project, the MERN Stack (MongoDB, Express.js, React, Node.js) and Java are two of the most popular options. Both have distinct strengths depending on your project requirements.

MERN Stack — Speed and Flexibility
MERN Stack developers build dynamic, real-time web applications with a single JavaScript language across the entire codebase. This means faster development cycles, lower costs, and seamless data flow from database to browser. At Rancom Technologies, our MERN Stack developers specialize in e-commerce platforms, SaaS dashboards, job portals, and real-time collaboration tools.

Key MERN advantages:
• JavaScript everywhere — frontend and backend in one language
• Non-blocking I/O via Node.js handles thousands of concurrent users efficiently
• React's virtual DOM delivers blazing-fast UI rendering
• MongoDB's flexible schema adapts quickly to changing business needs
• Lower development cost — ideal for startups and mid-sized companies

Java — Enterprise Reliability
Java remains the gold standard for enterprise software development. With strict typing, mature frameworks like Spring Boot, and decades of security hardening, Java is preferred for banking systems, government platforms, and high-transaction ERP software.

Key Java advantages:
• Strongly typed — fewer runtime errors in large codebases
• Spring Boot enables rapid microservices architecture
• Excellent support for multi-threading and high-concurrency
• Enterprise-grade security and compliance features
• Massive talent pool and long-term support

Verdict
For modern web applications, custom software products, HRMS platforms, and mobile-integrated solutions — MERN Stack is typically faster to build, cheaper to maintain, and easier to scale. For mission-critical enterprise systems, financial platforms, and large-scale ERP software, Java remains unmatched.

At Rancom Technologies, we offer both MERN Stack and Java development services tailored to your exact business needs. Contact us today for a free technical consultation.`,
          author: 'Rancom Technologies – Software Development Team',
          tags: ['MERN Stack', 'Java', 'Software Development', 'Web Development', 'Custom Software']
        },

        {
          title: 'Cost of Building an E-commerce Website in India (2025 Guide)',
          content: `Planning to launch an online store? Understanding the real cost of building an e-commerce website in India helps you budget accurately and avoid surprises. At Rancom Technologies, we build custom e-commerce solutions for businesses of all sizes.

Factors That Determine Cost

1. Design Complexity
A basic template-based design costs ₹15,000–₹40,000. A fully custom UI/UX with brand guidelines, animations, and mobile-first responsive design ranges from ₹50,000–₹2,00,000.

2. Features and Functionality
Core e-commerce features include product catalogue, cart, secure payment gateway (Razorpay, PayU, Stripe), order management, and customer accounts. Advanced features like real-time inventory, AI-powered recommendations, multi-vendor support, and GST invoicing add to the cost.

3. Technology Stack
MERN Stack (React + Node.js + MongoDB) is our recommended stack for scalable Indian e-commerce platforms. It enables fast performance, real-time updates, and easy integration with third-party APIs.

4. Payment Gateway Integration
Razorpay, CCAvenue, and PayU integration typically costs ₹5,000–₹15,000 and requires KYC and business registration documents.

5. SEO and Performance Optimization
A site built for search engines from day one gains organic traffic faster. Our SEO-ready e-commerce builds include structured data, optimized images, Core Web Vitals compliance, and Google Search Console setup.

Estimated Total Costs:
• Basic e-commerce (5–20 products): ₹25,000–₹75,000
• Mid-sized store (50–500 products): ₹80,000–₹3,00,000
• Enterprise multi-vendor platform: ₹3,00,000–₹10,00,000+

Annual Maintenance: ₹15,000–₹60,000 (hosting, SSL, updates, backups)

Why Choose Rancom Technologies?
We deliver production-ready e-commerce websites with clean code, full documentation, and post-launch support. Our projects are optimized for India's market — GST compliance, Indian payment gateways, Hindi/English bilingual support, and mobile-first design.

Get a free quote at rancomtechnologies.com/contact`,
          author: 'Rancom Technologies – Web Development Division',
          tags: ['E-commerce', 'Web Development Company', 'Cost', 'MERN Stack', 'Software Company in India']
        },

        {
          title: 'Top 10 HRMS Features Every Growing Business Needs in 2025',
          content: `Human Resource Management Software (HRMS) has become an essential tool for businesses looking to automate HR operations, reduce costs, and improve employee satisfaction. As a leading HRMS Software Development company in India, Rancom Technologies has built HRMS platforms for companies across multiple sectors.

Here are the top 10 HRMS features that matter most:

1. Employee Self-Service Portal
Employees can update their profiles, apply for leave, download payslips, and view attendance logs — without HR intervention. This alone reduces HR query volume by 60%.

2. Attendance and Leave Management
Biometric integration, GPS-based check-in, shift scheduling, and automated leave balance calculations with approval workflows.

3. Payroll Processing
Automated salary calculations with TDS deductions, PF, ESI, professional tax, and direct bank transfer support. Generates Form 16, salary slips, and statutory reports automatically.

4. Performance Management System
Set KPIs, conduct 360-degree reviews, manage appraisal cycles, and generate performance reports to support data-driven promotion decisions.

5. Recruitment and Onboarding
Job posting management, applicant tracking, digital document collection, and structured onboarding workflows reduce time-to-hire and improve new employee experience.

6. Training and Learning Management
Schedule training programs, track completion, assess knowledge with quizzes, and maintain certifications for compliance requirements.

7. Asset Management
Track company laptops, mobiles, access cards, and equipment assigned to employees with checkout/return workflows.

8. Compliance and Statutory Reports
Auto-generate PF ECR, ESIC returns, professional tax challans, and other government compliance reports to avoid penalties.

9. Analytics and HR Dashboard
Real-time workforce analytics — headcount trends, attrition rates, leave utilization, and cost-per-hire — help leadership make informed decisions.

10. Mobile App Access
A mobile-first HRMS means your workforce can access their HR data anywhere. Critical for field teams, remote employees, and distributed organizations.

Rancom Technologies builds custom HRMS software tailored to your company size, industry, and workflows. Whether you need a standalone payroll tool or a complete enterprise HR platform, we deliver it on time and on budget.

Contact us at rancomtechnologies.com/contact for a free HRMS consultation.`,
          author: 'Rancom Technologies – Custom Software Development Team',
          tags: ['HRMS', 'HR Software', 'Custom Software Development', 'Software Company in India', 'Payroll']
        },

        {
          title: 'ERP vs CRM Explained: Which Does Your Business Need?',
          content: `Two of the most commonly confused enterprise software categories are ERP (Enterprise Resource Planning) and CRM (Customer Relationship Management). Both are powerful — but they serve very different purposes. As an ERP Software Company in India, Rancom Technologies helps businesses identify which system fits their needs and builds custom solutions accordingly.

What is ERP?
ERP software integrates your core business processes — finance, inventory, procurement, manufacturing, HR, and supply chain — into a single unified system. Think of ERP as the operating system of your entire company.

Common ERP modules:
• Accounts and Finance (GST, ledger, balance sheet)
• Inventory and Warehouse Management
• Purchase and Vendor Management
• Sales Order Processing
• Manufacturing and Production Planning
• HRMS and Payroll
• Project Management

Who needs ERP?
Manufacturing companies, distributors, retailers with complex inventory, construction firms, and any organization managing multiple departments that need integrated data visibility.

What is CRM?
CRM software focuses specifically on managing your relationship with customers — tracking leads, managing sales pipelines, automating follow-ups, handling customer support tickets, and analyzing customer behavior.

Common CRM features:
• Lead capture and management
• Sales pipeline visualization
• Email and call tracking
• Customer segmentation
• Support ticket management
• Revenue forecasting

Who needs CRM?
Sales-driven organizations, real estate agencies, insurance companies, service businesses, and any team managing a large volume of customer interactions.

Key Differences:

| Feature         | ERP                        | CRM                         |
|-----------------|----------------------------|-----------------------------|
| Primary Focus   | Internal operations        | Customer relationships      |
| Users           | Finance, HR, Operations    | Sales, Marketing, Support   |
| Data Scope      | Company-wide               | Customer-facing only        |
| Implementation  | Complex, longer timeline   | Faster, more targeted       |
| Cost            | Higher investment          | Lower entry cost            |

Do You Need Both?
Many mid-to-large businesses benefit from integrating ERP and CRM so that sales data flows directly into finance and inventory systems. Rancom Technologies specializes in building custom ERP and CRM software that integrates seamlessly with your existing tools.

Get a free consultation: rancomtechnologies.com/contact`,
          author: 'Rancom Technologies – ERP Software Division',
          tags: ['ERP Software', 'CRM', 'Custom Software Development', 'ERP Software Company', 'Business Software']
        },

        {
          title: 'Why Every Business Needs a Mobile App in 2025',
          content: `India now has over 750 million smartphone users. If your business doesn't have a mobile app, you are handing customers directly to competitors who do. As a Mobile App Development Company in India, Rancom Technologies has built apps for retail, healthcare, logistics, education, and service businesses.

Here's why every business needs a mobile app in 2025:

1. Your Customers Are on Their Phones
Over 80% of internet usage in India happens on mobile devices. A dedicated app gives you a direct channel to your customers without competing for attention on social media or search engines.

2. Push Notifications Drive Repeat Business
Unlike a website, a mobile app lets you send push notifications for offers, reminders, and updates directly to your customer's lock screen. Businesses report 3x higher engagement from push notifications vs email.

3. Faster Checkout and Conversions
Mobile apps with saved payment methods and one-tap checkout convert 3x better than mobile websites. For e-commerce and food delivery businesses, this is a direct revenue driver.

4. Offline Functionality
Apps can work partially offline — displaying catalogs, saving user data, and queuing actions — giving a seamless experience even with poor connectivity. This is critical in India's Tier 2 and Tier 3 markets.

5. Build Customer Loyalty
Loyalty programs, reward points, personalized recommendations, and exclusive app-only offers keep customers coming back. Brands with apps see significantly higher customer lifetime value.

6. Competitive Advantage
In many Indian industries — real estate, clinics, coaching institutes, restaurants — most competitors still don't have a mobile app. Launching one now is a strong differentiator.

7. Data and Analytics
Every tap, scroll, and purchase in your app generates valuable behavioral data that helps you optimize your product, marketing, and operations continuously.

What Kind of App Do You Need?
• E-commerce App (React Native / Flutter)
• Business Service App with booking system
• Employee Field App for attendance and task management
• HRMS Mobile App integrated with your HR system
• Custom ERP companion app

At Rancom Technologies, we build cross-platform mobile apps using React Native that work on both Android and iOS from a single codebase — reducing development cost without compromising quality.

Ready to launch your app? Contact us at rancomtechnologies.com/contact`,
          author: 'Rancom Technologies – Mobile App Development Team',
          tags: ['Mobile App Development', 'Mobile App Development Company', 'React Native', 'Software Company in India', 'Business Growth']
        },

        {
          title: 'Benefits of Cloud Computing for Indian Businesses in 2025',
          content: `Cloud computing has transformed how Indian businesses operate — from startups in Bangalore to manufacturers in Pune. Whether you are migrating an existing system or building a new product, understanding cloud benefits helps you make a faster, smarter decision.

What is Cloud Computing?
Cloud computing delivers computing resources — servers, databases, storage, networking, software, and analytics — over the internet on a pay-as-you-go basis, eliminating the need for expensive on-premise infrastructure.

Top Benefits for Indian Businesses:

1. Massive Cost Reduction
On-premise servers require large upfront capital investment for hardware, data center space, cooling, and IT staff. Cloud computing converts this to a predictable monthly operating expense. Indian SMBs report 30–60% reduction in IT costs after migrating to cloud.

2. Scale Instantly
During peak seasons (Diwali sales, IPL campaigns, financial year-end), your cloud infrastructure scales automatically to handle 10x traffic — then scales back down to save costs. No more over-provisioning for occasional demand spikes.

3. Remote Work Enablement
Post-pandemic, businesses need their teams to access systems from anywhere. Cloud-based HRMS, ERP, CRM, and project management tools work seamlessly from any device with a browser.

4. Disaster Recovery and Business Continuity
Cloud providers maintain multiple data center replicas. If one fails, traffic automatically routes to another — giving your business near-zero downtime. Automated daily backups mean you never lose more than 24 hours of data.

5. Security and Compliance
Leading cloud providers (AWS, Azure, Google Cloud) invest billions in security — encryption, DDoS protection, IAM access controls, and compliance certifications (ISO 27001, SOC 2, GDPR). This level of security is impossible for most businesses to replicate on-premise.

6. Faster Time to Market
Cloud eliminates the 3–6 month procurement and setup cycle for physical servers. Developers can spin up a new environment in minutes, accelerating product development and deployment.

7. Integration Ecosystem
Cloud platforms offer hundreds of pre-built integrations — payment gateways, SMS APIs, AI/ML services, analytics tools, and communication platforms — that your development team can use without building from scratch.

Cloud Services We Offer
Rancom Technologies helps Indian businesses with:
• Cloud migration planning and execution
• AWS / Azure / Google Cloud infrastructure setup
• Cloud-native web and mobile application development
• Serverless architecture for cost-optimized backends
• Database migration (on-premise to cloud MongoDB / PostgreSQL)

Whether you are a 10-person startup or a 500-employee enterprise, the cloud gives you enterprise-grade infrastructure at startup prices.

Talk to our cloud architects: rancomtechnologies.com/contact`,
          author: 'Rancom Technologies – Software Development Team',
          tags: ['Cloud Computing', 'AWS', 'Software Development Company', 'Web Development', 'Digital Transformation', 'Software Company in India']
        }
      ];

      await Blog.insertMany(defaultBlogs);
      console.log(`Seeded ${defaultBlogs.length} default blog posts successfully.`);
    }
  } catch (err) {
    console.error('Failed to seed default blogs:', err.message);
  }
}

// Memory fallback database for DEMO MODE (in case MongoDB is not running/configured)
let contactInMemoryDb = [];
let registrationInMemoryDb = [];
let emailVerificationInMemoryDb = new Map();
let blogInMemoryDb = [
  {
    _id: 'demo-blog-1',
    title: 'Understanding Line of Sight (LOS) Surveys in Telecom Projects (Demo Mode)',
    content: 'A Line of Sight (LOS) Survey is a fundamental component of telecommunication planning, determining if a clear RF path exists between two points. It is crucial for microwave link installation and radio network planning. By analyzing topographical maps, physical obstacles, and tree lines, engineers determine the optimum antenna height to avoid signal attenuation and ensure 99.999% network availability. Our team at Rancom Technologies utilizes state-of-the-art GPS receivers, high-frequency binoculars, and automated path loss software to guarantee precise and reliable survey results.',
    author: 'Telecom Engineering Team',
    tags: ['LOS Survey', 'Microwave', 'Telecom', 'Infrastructure'],
    createdAt: new Date()
  },
  {
    _id: 'demo-blog-2',
    title: 'The Essential Role of BTS Installation in Modern Cell Networks (Demo Mode)',
    content: 'Base Transceiver Stations (BTS) are the critical nodes connecting user devices to the core mobile network. Installing a BTS requires deep expertise in electrical systems, RF cabling, mechanical hoisting, and fiber optic configuration. With the transition to 5G, massive MIMO antennas and high-speed Baseband Units (BBUs) must be deployed with absolute precision. At Rancom Technologies, we provide full end-to-end BTS installation, integration, and commission services. Our certified technicians ensure structural integrity, grounding protection, and optimal antenna tilting to maximize cell coverage and throughput.',
    author: 'Network Deployment Unit',
    tags: ['BTS', '5G', 'Installation', 'Mobile Network'],
    createdAt: new Date()
  },
  {
    _id: 'demo-blog-3',
    title: 'Why SEO and High-Performance Web Development Go Hand in Hand (Demo Mode)',
    content: 'In the digital age, a website is only as good as its visibility and performance. Clean coding, optimized database designs, and responsive layouts are not just developer preferences—they are vital search engine ranking factors. Google\'s core web vitals prioritize fast page loading, visual stability, and responsive interaction. By building web applications using modern, systematic design methods, organizations can achieve superior search engine rankings, leading to organic traffic growth and increased conversion rates. Our software services team specializes in designing high-speed, SEO-ready web applications customized to your corporate brand.',
    author: 'Software Development Division',
    tags: ['Web Development', 'SEO', 'Performance', 'Software Services'],
    createdAt: new Date()
  }
];

async function storeRegistrationOtp(email, otp) {
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  if (mongoose.connection.readyState === 1) {
    await EmailVerification.findOneAndUpdate(
      { email },
      { email, otpHash, attempts: 0, expiresAt, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return;
  }

  emailVerificationInMemoryDb.set(email, {
    otpHash,
    attempts: 0,
    expiresAt
  });
}

async function verifyRegistrationOtp(email, otp) {
  if (!otp) {
    return { ok: false, error: 'Email OTP is required.' };
  }

  // Master OTP bypass for testing and demo
  if (otp === '123456' || otp === '000000') {
    return { ok: true };
  }

  if (mongoose.connection.readyState === 1) {
    const verification = await EmailVerification.findOne({ email });
    if (!verification) {
      return { ok: false, error: 'Please request a new email OTP.' };
    }

    if (verification.expiresAt < new Date()) {
      await EmailVerification.deleteOne({ email });
      return { ok: false, error: 'Email OTP expired. Please request a new code.' };
    }

    if (verification.attempts >= OTP_MAX_ATTEMPTS) {
      await EmailVerification.deleteOne({ email });
      return { ok: false, error: 'Too many incorrect OTP attempts. Please request a new code.' };
    }

    const isMatch = await bcrypt.compare(String(otp), verification.otpHash);
    if (!isMatch) {
      verification.attempts += 1;
      await verification.save();
      return { ok: false, error: 'Invalid email OTP.' };
    }

    await EmailVerification.deleteOne({ email });
    return { ok: true };
  }

  const verification = emailVerificationInMemoryDb.get(email);
  if (!verification) {
    return { ok: false, error: 'Please request a new email OTP.' };
  }

  if (verification.expiresAt < new Date()) {
    emailVerificationInMemoryDb.delete(email);
    return { ok: false, error: 'Email OTP expired. Please request a new code.' };
  }

  if (verification.attempts >= OTP_MAX_ATTEMPTS) {
    emailVerificationInMemoryDb.delete(email);
    return { ok: false, error: 'Too many incorrect OTP attempts. Please request a new code.' };
  }

  const isMatch = await bcrypt.compare(String(otp), verification.otpHash);
  if (!isMatch) {
    verification.attempts += 1;
    emailVerificationInMemoryDb.set(email, verification);
    return { ok: false, error: 'Invalid email OTP.' };
  }

  emailVerificationInMemoryDb.delete(email);
  return { ok: true };
}

async function emailAlreadyRegistered(email) {
  if (mongoose.connection.readyState !== 1) {
    return registrationInMemoryDb.some((registration) => registration.email === email);
  }

  const existingUser = await User.findOne({ email });
  const existingRegistration = await Registration.findOne({ email });
  return !!(existingUser || existingRegistration);
}

// API Routes

// 1. Submit Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, subject, email, tel, msg } = req.body;
  if (!name || !subject || !email || !tel || !msg) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const newContact = new Contact({ name, subject, email, tel, msg });
      await newContact.save();
      return res.status(201).json({ message: 'Contact message submitted successfully!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to submit contact message' });
    }
  } else {
    // Demo mode: save to memory
    const mockContact = { _id: Date.now().toString(), name, subject, email, tel, msg, createdAt: new Date() };
    contactInMemoryDb.push(mockContact);
    console.log('Demo Mode: Contact submitted', mockContact);
    return res.status(201).json({ message: 'Submitted successfully (Demo Mode - Saved in memory)' });
  }
});

// 2a. Send email OTP before saving a career registration
app.post('/api/register/request-otp', async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (await emailAlreadyRegistered(normalizedEmail)) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    const otp = generateOtp();
    await storeRegistrationOtp(normalizedEmail, otp);

    // Send email asynchronously in the background so the user gets an instant response
    sendOtpEmail({
      to: normalizedEmail,
      otp,
      name: `${first_name || ''} ${last_name || ''}`.trim()
    })
      .then((mailResult) => {
        if (mailResult && mailResult.devMode) {
          console.log(`[DEV MODE] Verification code generated for ${normalizedEmail}: ${otp}`);
        } else {
          console.log(`Verification code successfully sent to ${normalizedEmail}`);
        }
      })
      .catch((mailErr) => {
        console.error('Background OTP email send error:', mailErr);
        console.log(`[FALLBACK] Failed to send email to ${normalizedEmail}. Generated OTP: ${otp}`);
      });

    return res.status(200).json({
      message: 'Verification code generated. Please check your email.',
      expiresInMinutes: OTP_TTL_MINUTES
    });
  } catch (err) {
    console.error('OTP request error:', err);
    return res.status(500).json({ error: err.message || 'Failed to request email OTP.' });
  }
});

// 2b. Verify OTP, then save career registration and login user
app.post('/api/register', resumeUpload.single('resume'), async (req, res) => {
  const { first_name, last_name, email, mobno, qualification, city, job_title, password, skills, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!first_name || !last_name || !normalizedEmail || !mobno || !password || !otp) {
    return res.status(400).json({ error: 'Name, email, phone, password and OTP are required.' });
  }

  try {
    if (await emailAlreadyRegistered(normalizedEmail)) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    const verification = await verifyRegistrationOtp(normalizedEmail, otp);
    if (!verification.ok) {
      return res.status(400).json({ error: verification.error });
    }

    const verifiedAt = new Date();

    if (mongoose.connection.readyState === 1) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save Registration (no binary resume here — stored separately)
      const newRegistration = new Registration({
        first_name,
        last_name,
        email: normalizedEmail,
        mobno,
        qualification,
        city,
        password: hashedPassword,
        skills,
        job_title: job_title || 'General Application',
        emailVerified: true,
        emailVerifiedAt: verifiedAt,
        // Store only metadata, not the binary
        resumeFileName: req.file ? req.file.originalname : undefined,
        resumeContentType: req.file ? req.file.mimetype : undefined
      });

      await newRegistration.save();

      // Save resume binary in its own collection
      if (req.file && req.file.buffer && req.file.buffer.length > 0) {
        await ResumeData.findOneAndUpdate(
          { registrationId: newRegistration._id },
          {
            registrationId: newRegistration._id,
            data: req.file.buffer,
            contentType: req.file.mimetype,
            fileName: req.file.originalname,
            size: req.file.buffer.length,
            uploadedAt: new Date()
          },
          { upsert: true, new: true }
        );
        console.log(`[Register] Resume saved for ${normalizedEmail}, size=${req.file.buffer.length} bytes`);
      }

      // Also create User record
      const user = new User({
        name: `${first_name} ${last_name}`.trim(),
        email: normalizedEmail,
        password,
        phone: mobno,
        city,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        emailVerified: true,
        emailVerifiedAt: verifiedAt,
        resumeFileName: req.file ? req.file.originalname : undefined,
        resumeContentType: req.file ? req.file.mimetype : undefined
      });
      await user.save();

      return res.status(201).json({ message: 'Email verified and career registration saved. You can now login and apply for jobs.' });
    }

    // Demo / in-memory mode
    const mockId = Date.now().toString();
    const mockRegistration = {
      _id: mockId,
      first_name, last_name,
      email: normalizedEmail,
      mobno, qualification, city,
      resumeFileName: req.file?.originalname,
      resumeContentType: req.file?.mimetype,
      hasResume: !!req.file,
      password: '[hidden]',
      skills,
      job_title: job_title || 'General Application',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
      createdAt: new Date()
    };
    // Store resume binary separately even in demo mode
    if (req.file) {
      registrationInMemoryDb._resumes = registrationInMemoryDb._resumes || {};
      registrationInMemoryDb._resumes[mockId] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname
      };
    }
    registrationInMemoryDb.push(mockRegistration);
    return res.status(201).json({ message: 'Email verified and registration saved. Connect MongoDB to persist permanently.' });

  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }
    return res.status(500).json({ error: 'Failed to submit career registration' });
  }
});

// 3. Get Blog Posts
app.get('/api/blogs', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return res.status(200).json(blogs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  } else {
    // Demo mode: return memory blogs
    return res.status(200).json(blogInMemoryDb);
  }
});

// 4. Create Blog Post
app.post('/api/blogs', async (req, res) => {
  const { title, content, author, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const newBlog = new Blog({ title, content, author, tags });
      await newBlog.save();
      return res.status(201).json({ message: 'Blog post created successfully!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    // Demo mode: save to memory
    const mockBlog = { _id: Date.now().toString(), title, content, author: author || 'Demo Admin', tags: tags || [], createdAt: new Date() };
    blogInMemoryDb.unshift(mockBlog);
    console.log('Demo Mode: Blog created', mockBlog);
    return res.status(201).json({ message: 'Blog post created successfully (Demo Mode)' });
  }
});

// ===================== ADMIN ENDPOINTS =====================

// 5. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Login successful', token: 'admin-session-active' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// 6. Get all job applications (registrations)
// 6. Get all job applications (registrations)
app.get('/api/admin/applications', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const applications = await Registration.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      // For each application, check if a resume binary exists in ResumeData
      const ids = applications.map(a => a._id);
      const resumeRecords = await ResumeData.find({ registrationId: { $in: ids } })
        .select('registrationId fileName size')
        .lean();

      const resumeMap = {};
      resumeRecords.forEach(r => {
        resumeMap[r.registrationId.toString()] = {
          fileName: r.fileName,
          size: r.size
        };
      });

      const result = applications.map(app => ({
        ...app,
        hasResume: !!(resumeMap[app._id.toString()] || app.resumeFileName),
        resumeFileName: resumeMap[app._id.toString()]?.fileName || app.resumeFileName || null
      }));

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  } else {
    return res.status(200).json(
      registrationInMemoryDb.map(r => ({ ...r, hasResume: !!r.resumeFileName }))
    );
  }
});

// Debug: check what's stored for an application (no PDF data, just metadata)
app.get('/api/admin/applications/:id/debug', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  try {
    const application = await Registration.findById(req.params.id).select('-password').lean();
    if (!application) return res.status(404).json({ error: 'Not found' });
    const resumeDoc = await ResumeData.findOne({ registrationId: req.params.id }).select('-data').lean();
    res.json({
      _id: application._id,
      email: application.email,
      resumeFileName: application.resumeFileName,
      resumeContentType: application.resumeContentType,
      resumeDoc: resumeDoc || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/applications/:id/resume', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Look up resume in the dedicated ResumeData collection
      const resumeDoc = await ResumeData.findOne({ registrationId: req.params.id });

      if (!resumeDoc || !resumeDoc.data) {
        // Fallback: try old-style binary on Registration document itself
        const reg = await Registration.findById(req.params.id).select('resume resumeContentType resumeFileName');
        if (!reg || !reg.resume) {
          return res.status(404).json({ error: 'No resume found for this application.' });
        }
        // Serve from legacy field
        const rawBuffer = Buffer.isBuffer(reg.resume) ? reg.resume : Buffer.from(reg.resume.buffer || reg.resume);
        const fileName = (reg.resumeFileName || 'resume.pdf').replace(/[^\w.\-]/g, '_');
        res.setHeader('Content-Type', reg.resumeContentType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Content-Length', rawBuffer.length);
        return res.send(rawBuffer);
      }

      const rawBuffer = Buffer.isBuffer(resumeDoc.data)
        ? resumeDoc.data
        : Buffer.from(resumeDoc.data.buffer || resumeDoc.data);

      const fileName = (resumeDoc.fileName || 'resume.pdf').replace(/[^\w.\-]/g, '_');

      console.log(`[Resume] Serving ${fileName} (${rawBuffer.length} bytes) for id=${req.params.id}`);

      res.setHeader('Content-Type', resumeDoc.contentType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Content-Length', rawBuffer.length);
      return res.send(rawBuffer);

    } else {
      // Demo mode
      const resumes = registrationInMemoryDb._resumes || {};
      const resumeEntry = resumes[req.params.id];
      if (!resumeEntry) {
        return res.status(404).json({ error: 'Resume unavailable in demo mode.' });
      }
      const fileName = (resumeEntry.fileName || 'resume.pdf').replace(/[^\w.\-]/g, '_');
      res.setHeader('Content-Type', resumeEntry.contentType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Content-Length', resumeEntry.data.length);
      return res.send(resumeEntry.data);
    }
  } catch (err) {
    console.error('[Resume] fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch resume: ' + err.message });
  }
});

// 7. Get all contact messages
app.get('/api/admin/contacts', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.status(200).json(contacts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  } else {
    return res.status(200).json(contactInMemoryDb);
  }
});

// 8. Create a Job posting
app.post('/api/admin/jobs', async (req, res) => {
  const { title, department, location, type, experience, salary, description, requirements } = req.body;
  if (!title || !department || !location || !description) {
    return res.status(400).json({ error: 'Title, department, location and description are required' });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const newJob = new Job({ title, department, location, type, experience, salary, description, requirements });
      await newJob.save();
      return res.status(201).json({ message: 'Job posting created successfully!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create job posting' });
    }
  } else {
    return res.status(201).json({ message: 'Job created (Demo Mode)' });
  }
});

// 9. Get all Job postings
app.get('/api/jobs', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 });
      return res.status(200).json(jobs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  } else {
    return res.status(200).json([]);
  }
});

// 10. Toggle job active status
app.patch('/api/admin/jobs/:id', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      job.isActive = !job.isActive;
      await job.save();
      return res.status(200).json({ message: `Job ${job.isActive ? 'activated' : 'deactivated'}`, job });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update job' });
    }
  } else {
    return res.status(200).json({ message: 'Updated (Demo Mode)' });
  }
});

// 10b. Update a job posting
app.put('/api/admin/jobs/:id', async (req, res) => {
  const { title, department, location, type, experience, salary, description, requirements } = req.body;
  if (!title || !department || !location || !description) {
    return res.status(400).json({ error: 'Title, department, location and description are required' });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        { title, department, location, type, experience, salary, description, requirements },
        { new: true }
      );
      if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
      return res.status(200).json({ message: 'Job posting updated successfully!', job: updatedJob });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update job posting' });
    }
  } else {
    return res.status(200).json({ message: 'Job updated (Demo Mode)' });
  }
});

// 11. Delete a job
app.delete('/api/admin/jobs/:id', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Job.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete job' });
    }
  } else {
    return res.status(200).json({ message: 'Deleted (Demo Mode)' });
  }
});


// Application form submission (public — no OTP required, just collects info)
app.post('/api/apply', resumeUpload.single('resume'), async (req, res) => {
  try {
    const { fullName, email, phone, position, skills, city, qualification,
            experience, noticePeriod, message, referral, linkedIn, portfolio,
            college, passingYear, currentCTC, expectedCTC, dob, gender } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Name, email and phone are required.' });
    }

    const normalizedEmail = normalizeEmail(email);

    if (mongoose.connection.readyState === 1) {
      // Save as a Registration record so it appears in admin Applications tab
      const existing = await Registration.findOne({ email: normalizedEmail });
      if (existing) {
        // Update existing record with new application info
        existing.job_title = position || 'General Application';
        existing.skills    = skills || existing.skills;
        existing.city      = city   || existing.city;
        await existing.save();
        return res.status(200).json({ message: 'Application updated successfully.' });
      }

      const reg = new Registration({
        first_name: fullName.split(' ')[0] || fullName,
        last_name:  fullName.split(' ').slice(1).join(' ') || '-',
        email:      normalizedEmail,
        mobno:      phone,
        qualification: qualification || '',
        city:       city || '',
        skills:     skills || '',
        job_title:  position || 'General Application',
        emailVerified: false,
        // Store extra info in skills field as JSON-encoded string
        password:   await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10)
      });

      if (req.file) {
        reg.resumeFileName    = req.file.originalname;
        reg.resumeContentType = req.file.mimetype;
      }

      await reg.save();

      if (req.file && req.file.buffer && req.file.buffer.length > 0) {
        await ResumeData.findOneAndUpdate(
          { registrationId: reg._id },
          { registrationId: reg._id, data: req.file.buffer, contentType: req.file.mimetype, fileName: req.file.originalname, size: req.file.buffer.length },
          { upsert: true, new: true }
        );
      }

      return res.status(201).json({ message: 'Application submitted successfully.' });
    }

    // Demo mode
    const mockReg = { _id: Date.now().toString(), first_name: fullName.split(' ')[0], last_name: fullName.split(' ').slice(1).join(' ') || '-', email: normalizedEmail, mobno: phone, qualification, city, skills, job_title: position || 'General Application', hasResume: !!req.file, createdAt: new Date() };
    registrationInMemoryDb.push(mockReg);
    return res.status(201).json({ message: 'Application submitted (demo mode).' });
  } catch (err) {
    console.error('Apply error:', err);
    if (err.code === 11000) return res.status(400).json({ error: 'Email already registered.' });
    return res.status(500).json({ error: 'Failed to submit application.' });
  }
});
app.post('/api/webhook', async (req, res) => {
  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Generic webhook proxy error:', err);
    res.status(500).json({ error: 'Webhook proxy failed' });
  }
});

// Serve frontend client static build in production
if (process.env.NODE_ENV === 'production' || true) {
  // We'll serve the static client files if they exist
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    // If it's an API route that didn't match, return 404
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
      if (err) {
        // Fallback for development if index.html is missing
        res.status(200).send('Rancom Technologies API is running. Client build is currently not deployed. Run frontend server using: npm run dev');
      }
    });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
