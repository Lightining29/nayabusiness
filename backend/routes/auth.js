const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Registration = require('../models/Registration');
const ResumeData = require('../models/ResumeData');
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

// Registration must go through the career OTP flow so accounts are only created
// after email verification.
router.post('/register', upload.single('resume'), async (req, res) => {
  return res.status(400).json({
    error: 'Email verification is required. Use /api/register/request-otp first, then submit /api/register with the OTP.'
  });
});

// Login – returns JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, hasResume: !!user.resume, resumeFileName: user.resumeFileName, skills: user.skills, emailVerified: user.emailVerified } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  const { _id, name, email, phone, city, resumeContentType, resumeFileName, skills, emailVerified, emailVerifiedAt } = req.user;
  res.json({ id: _id, name, email, phone, city, hasResume: !!resumeContentType, resumeFileName, skills, emailVerified, emailVerifiedAt });
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

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      return res.status(400).json({ error: 'Verified email cannot be changed from profile.' });
    }

    user.name = name;
    user.email = normalizedEmail;
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

      // Sync resume to ResumeData collection so admin panel can show it
      const registration = await Registration.findOne({ email: user.email });
      if (registration) {
        await ResumeData.findOneAndUpdate(
          { registrationId: registration._id },
          {
            registrationId: registration._id,
            data: req.file.buffer,
            contentType: req.file.mimetype,
            fileName: req.file.originalname,
            size: req.file.buffer.length,
            uploadedAt: new Date()
          },
          { upsert: true, new: true }
        );
        // Keep metadata on Registration in sync too
        await Registration.updateOne(
          { _id: registration._id },
          { resumeFileName: req.file.originalname, resumeContentType: req.file.mimetype }
        );
      }
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
        skills: user.skills,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt
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

    // Unwrap Mongoose Binary to a plain Buffer before sending
    let rawBuffer;
    if (Buffer.isBuffer(user.resume)) {
      rawBuffer = user.resume;
    } else if (user.resume.buffer) {
      rawBuffer = Buffer.from(user.resume.buffer);
    } else {
      rawBuffer = Buffer.from(user.resume);
    }

    const fileName = (user.resumeFileName || 'resume.pdf').replace(/[^\w.\-]/g, '_');

    res.setHeader('Content-Type', user.resumeContentType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Length', rawBuffer.length);
    return res.send(rawBuffer);
  } catch (err) {
    console.error('Resume fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

module.exports = router;
