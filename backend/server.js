const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const Contact = require('./models/Contact');
const Registration = require('./models/Registration');
const Blog = require('./models/Blog');
const Job = require('./models/Job');
const User = require('./models/User');
const EmailVerification = require('./models/EmailVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('./utils/mailer');

// Import route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

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
app.get('/health', (req, res) => { res.status(200).send('OK'); });

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);

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
  const { credential, password, phone, city } = req.body;
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

    // Create the User (it will auto-hash password via Schema pre-save)
    const user = new User({
      name: payload.name || 'Google User',
      email: normalizedEmail,
      password: password, // will be auto-hashed by User model pre-save hook
      phone: phone || '',
      city: city || '',
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    await user.save();

    // Save corresponding Registration document
    const names = (payload.name || '').split(' ');
    const firstName = names[0] || 'Google';
    const lastName = names.slice(1).join(' ') || 'User';

    const registration = new Registration({
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      mobno: phone || '',
      city: city || '',
      password: await bcrypt.hash(password, 10), // hash for candidate table
      job_title: 'General Application',
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    await registration.save();

    // Log user in and return JWT token
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
        }
      ];
      await Blog.insertMany(defaultBlogs);
      console.log('Seeded default blog posts successfully.');
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

    try {
      const mailResult = await sendOtpEmail({
        to: normalizedEmail,
        otp,
        name: `${first_name || ''} ${last_name || ''}`.trim()
      });

      return res.status(200).json({
        message: mailResult.devMode
          ? 'Verification code generated. Check the backend console/logs for the OTP.'
          : 'Verification code sent to your email.',
        expiresInMinutes: OTP_TTL_MINUTES
      });
    } catch (mailErr) {
      console.error('OTP email send error:', mailErr);
      // Fail gracefully: log the OTP to the console/logs so it's visible on Render, and allow master OTP
      console.log(`[FALLBACK] Failed to send email to ${normalizedEmail}. Generated OTP: ${otp}`);
      return res.status(200).json({
        message: 'Verification code generated. (Email sending failed; please use master OTP 123456 to verify)',
        expiresInMinutes: OTP_TTL_MINUTES
      });
    }
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
        emailVerifiedAt: verifiedAt
      });

      if (req.file) {
        newRegistration.resume = req.file.buffer;
        newRegistration.resumeContentType = req.file.mimetype;
        newRegistration.resumeFileName = req.file.originalname;
      }

      const user = new User({
        name: `${first_name} ${last_name}`.trim(),
        email: normalizedEmail,
        password,
        phone: mobno,
        city,
        skills: skills ? skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        emailVerified: true,
        emailVerifiedAt: verifiedAt
      });

      if (req.file) {
        user.resume = req.file.buffer;
        user.resumeContentType = req.file.mimetype;
        user.resumeFileName = req.file.originalname;
      }

      await newRegistration.save();
      await user.save();

      return res.status(201).json({ message: 'Email verified and career registration saved. You can now login and apply for jobs.' });
    }

    const mockRegistration = {
      _id: Date.now().toString(),
      first_name,
      last_name,
      email: normalizedEmail,
      mobno,
      qualification,
      city,
      resumeFileName: req.file?.originalname,
      resumeContentType: req.file?.mimetype,
      password: '[hidden]',
      skills,
      job_title: job_title || 'General Application',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
      createdAt: new Date()
    };
    registrationInMemoryDb.push(mockRegistration);
    console.log('Demo Mode: Verified career registration submitted', mockRegistration);
    return res.status(201).json({ message: 'Email verified and registration saved in demo memory. Connect MongoDB to save it permanently.' });
  } catch (err) {
    console.error('Registration verification error:', err);
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
app.get('/api/admin/applications', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const applications = await Registration.find().select('-resume -password').sort({ createdAt: -1 });
      return res.status(200).json(applications);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  } else {
    return res.status(200).json(registrationInMemoryDb);
  }
});

app.get('/api/admin/applications/:id/resume', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(404).json({ error: 'Resume unavailable in demo mode' });
  }

  try {
    const application = await Registration.findById(req.params.id);
    if (!application || !application.resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.setHeader('Content-Type', application.resumeContentType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${application.resumeFileName || 'resume.pdf'}"`);
    return res.send(application.resume);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch resume' });
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


// Generic webhook proxy – forwards any POST body to the configured N8N webhook
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
