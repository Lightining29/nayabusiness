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
  // Resume binary is stored in the ResumeData collection (linked by _id)
  // Only metadata is kept here so the Registration document stays small
  resumeFileName: {
    type: String,
    trim: true
  },
  resumeContentType: {
    type: String
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
