const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
    default: 'Full-Time'
  },
  experience: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
