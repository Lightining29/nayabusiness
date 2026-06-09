const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MAX_RESUME_SIZE = 2 * 1024 * 1024; // 2 MB

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phone: { type: String },
  city: { type: String },
  resumeUrl: { type: String },
  skills: [{ type: String }],
  resume: { type: Buffer }, // PDF binary
  resumeContentType: { type: String }, // should be 'application/pdf'
  resumeFileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Validate resume size and type when set
UserSchema.methods.setResume = function(buffer, contentType) {
  if (contentType !== 'application/pdf') {
    throw new Error('Resume must be a PDF');
  }
  if (buffer.length > MAX_RESUME_SIZE) {
    throw new Error('Resume exceeds 2 MB size limit');
  }
  this.resume = buffer;
  this.resumeContentType = contentType;
};

module.exports = mongoose.model('User', UserSchema);
