const mongoose = require('mongoose');

// Separate collection for resume binaries — keeps Registration documents small
// and avoids the 16MB BSON document limit
const resumeDataSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    default: 'application/pdf'
  },
  fileName: {
    type: String,
    trim: true
  },
  size: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResumeData', resumeDataSchema);
