const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const auth = require('../middleware/auth');

// Authenticated user: apply to job
router.post('/jobs/:id/apply', auth, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const application = new Application({
      job: req.params.id,
      applicant: req.user.id,
      coverLetter,
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

module.exports = router;
