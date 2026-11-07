const Order = require('../models/Order');
const Seat = require('../models/Seat');
const Concert = require('../models/Concert');

async function checkout(req, res, next) {
  try {
    const { concertId, seatIds, paymentMethod = 'MOCK_QRIS' } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for checkout.'
      });
    }

    if (!concertId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'concertId and seatIds array are required.'
      });
    }

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ success: false, message: 'Concert not found' });
    }

    const now = new Date();

    // Verify all requested seats are currently locked by this user and not expired
    const seats = await Seat.find({
      _id: { $in: seatIds },
      concertId
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats do not exist in this concert.'
      });
    }

    for (const seat of seats) {
      if (
        seat.status !== 'LOCKED' ||
        seat.lockedBy !== user.id ||
        !seat.lockedUntil ||
        seat.lockedUntil <= now
      ) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatNumber} lock has expired or is not reserved by you. Please reselect.`
        });
      }
    }

    const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const seatNumbersStr = seats.map((s) => s.seatNumber.replace(/[^A-Za-z0-9]/g, '')).join('');
    const qrTicketCode = `TICKET-GBK-${orderNumber}-${seatNumbersStr}`;

    const orderItems = seats.map((s) => ({
      seatId: s._id,
      seatNumber: s.seatNumber,
      tier: s.tier,
      price: s.price
    }));

    const order = await Order.create({
      orderNumber,
      userId: user.id,
      userEmail: user.email || 'customer@concert.local',
      userName: user.name || 'Concert Attendee',
      concertId: concert._id,
      seats: orderItems,
      totalAmount,
      status: 'PAID',
      qrTicketCode,
      paymentDetails: {
        method: paymentMethod,
        transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        paidAt: new Date()
      }
    });

    // Mark seats permanently as BOOKED
    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        lockedBy: user.id
      },
      {
        $set: {
          status: 'BOOKED',
          bookedBy: user.id,
          lockedBy: null,
          lockedUntil: null,
          orderId: order._id
        }
      }
    );

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        concertTitle: concert.title,
        concertArtist: concert.artist,
        concertVenue: concert.venue,
        concertDate: concert.date,
        seats: seats.map((s) => s.seatNumber),
        totalAmount: order.totalAmount,
        status: order.status,
        paidAt: order.paymentDetails.paidAt,
        qrTicketCode: order.qrTicketCode,
        userName: order.userName,
        userEmail: order.userEmail
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('concertId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required' });
    }
    const orders = await Order.find({ userId })
      .populate('concertId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout, getOrderById, getUserOrders };
