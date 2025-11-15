const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Import crypto module

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, default: false }, // New field for email verification
  verificationToken: String, // New field for verification token
  verificationTokenExpires: Date, // New field for token expiration
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Handle users without local password
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 86400000; // 24 hours from now
  return token;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
