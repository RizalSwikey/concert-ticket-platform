const mongoose = require('mongoose');

const TierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, default: '#8052ff' },
    totalSeats: { type: Number, required: true }
  },
  { _id: false }
);

const ConcertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    artist: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    bannerUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    tiers: [TierSchema],
    status: {
      type: String,
      enum: ['UPCOMING', 'ON_SALE', 'SOLD_OUT', 'CANCELLED'],
      default: 'ON_SALE'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Concert || mongoose.model('Concert', ConcertSchema);
