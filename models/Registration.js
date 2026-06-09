const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobno: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  resume: {
    type: String,
    trim: true
  },
  password: {
    type: String
  },
  skills: {
    type: String,
    trim: true
  },
  job_title: {
    type: String,
    default: 'General Application',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
