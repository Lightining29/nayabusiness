const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Multer config – store file in memory (buffer) to save in DB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

// Register – expects multipart/form-data (resume PDF)
router.post('/register', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, password, phone, city, skills } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const user = new User({
      name,
      email,
      password, // pre-save hook will hash
      phone,
      city,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
    });

    if (req.file) {
      user.resume = req.file.buffer;
      user.resumeContentType = req.file.mimetype;
      user.resumeFileName = req.file.originalname;
    }

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, phone, city, hasResume: !!user.resume, resumeFileName: user.resumeFileName, skills: user.skills } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login – returns JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, hasResume: !!user.resume, resumeFileName: user.resumeFileName, skills: user.skills } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  const { _id, name, email, phone, city, resumeContentType, resumeFileName, skills } = req.user;
  res.json({ id: _id, name, email, phone, city, hasResume: !!resumeContentType, resumeFileName, skills });
});

// Update current user profile (protected)
router.put('/me', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, city, skills, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.city = city;
    user.skills = Array.isArray(skills) ? skills : String(skills || '').split(',').map(s => s.trim()).filter(Boolean);

    if (password) {
      user.password = password;
    }

    if (req.file) {
      user.resume = req.file.buffer;
      user.resumeContentType = req.file.mimetype;
      user.resumeFileName = req.file.originalname;
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        hasResume: !!user.resume,
        resumeFileName: user.resumeFileName,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/me/resume', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.setHeader('Content-Type', user.resumeContentType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${user.resumeFileName || 'resume.pdf'}"`);
    return res.send(user.resume);
  } catch (err) {
    console.error('Resume fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

module.exports = router;
