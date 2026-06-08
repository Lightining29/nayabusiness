const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const Contact = require('./models/Contact');
const Registration = require('./models/Registration');
const Blog = require('./models/Blog');
const Job = require('./models/Job');

// Admin credentials (use env vars in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rancom@2026';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// 2. Submit Career Registration
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, mobno, qualification, city, job_title } = req.body;
  if (!first_name || !last_name || !email || !mobno || !qualification || !city) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const newRegistration = new Registration({ 
        first_name, 
        last_name, 
        email, 
        mobno, 
        qualification, 
        city,
        job_title: job_title || 'General Application'
      });
      await newRegistration.save();
      return res.status(201).json({ message: 'Career registration submitted successfully!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to submit career registration' });
    }
  } else {
    // Demo mode: save to memory
    const mockRegistration = { 
      _id: Date.now().toString(), 
      first_name, 
      last_name, 
      email, 
      mobno, 
      qualification, 
      city, 
      job_title: job_title || 'General Application',
      createdAt: new Date() 
    };
    registrationInMemoryDb.push(mockRegistration);
    console.log('Demo Mode: Career Registration submitted', mockRegistration);
    return res.status(201).json({ message: 'Registered successfully (Demo Mode - Saved in memory)' });
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
      const applications = await Registration.find().sort({ createdAt: -1 });
      return res.status(200).json(applications);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  } else {
    return res.status(200).json(registrationInMemoryDb);
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
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    // If it's an API route that didn't match, return 404
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, 'client/dist/index.html'), (err) => {
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
