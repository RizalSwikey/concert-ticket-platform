const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    seatNumber: { type: String, required: true },
    tier: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concert',
      required: true
    },
    seats: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
      default: 'PAID',
      index: true
    },
    qrTicketCode: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    paymentDetails: {
      method: { type: String, default: 'MOCK_QRIS' },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
