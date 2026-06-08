const express = require('express');
const toast = require('react-hot-toast');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

// Public: list active jobs
router.get('/admin/jobs', auth.verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Admin: create new job
router.post('/admin/jobs', auth.verifyAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Admin: update job
router.put('/admin/jobs/:id', auth.verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Job updated', job });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Admin: delete job
router.delete('/admin/jobs/:id', auth.verifyAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Authenticated user: apply to job
router.post('/jobs/:id/apply', auth.verifyUser, async (req, res) => {
  try {
    const { coverLetter } = req.body; // optional text
    const application = new Application({
      job: req.params.id,
      user: req.user.id,
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
