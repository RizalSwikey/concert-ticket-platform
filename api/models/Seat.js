const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema(
  {
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concert',
      required: true,
      index: true
    },
    seatNumber: { type: String, required: true },
    section: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    tier: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOCKED', 'BOOKED'],
      default: 'AVAILABLE',
      index: true
    },
    lockedBy: { type: String, default: null },
    lockedUntil: { type: Date, default: null, index: true },
    bookedBy: { type: String, default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
  },
  { timestamps: true }
);

SeatSchema.index({ concertId: 1, seatNumber: 1 }, { unique: true });
SeatSchema.index({ concertId: 1, status: 1, lockedUntil: 1 });

module.exports = mongoose.models.Seat || mongoose.model('Seat', SeatSchema);
