const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '' },
    role: {
      type: String,
      enum: ['CUSTOMER', 'RECRUITER', 'ADMIN'],
      default: 'CUSTOMER'
    },
    mockWalletBalance: { type: Number, default: 50000000 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
