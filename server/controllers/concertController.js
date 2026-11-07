const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const inMemoryStore = require('../config/inMemoryStore');

async function getConcerts(req, res, next) {
  try {
    const { search } = req.query;

    if (global.__isFallbackMode) {
      const data = inMemoryStore.getConcerts(search);
      return res.json({ success: true, data });
    }

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const concerts = await Concert.find(filter).sort({ date: 1 });
    const concertIds = concerts.map((c) => c._id);
    const now = new Date();

    const seatStats = await Seat.aggregate([
      { $match: { concertId: { $in: concertIds } } },
      {
        $group: {
          _id: '$concertId',
          totalSeats: { $sum: 1 },
          bookedSeats: {
            $sum: { $cond: [{ $eq: ['$status', 'BOOKED'] }, 1, 0] }
          },
          lockedSeats: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'LOCKED'] },
                    { $gt: ['$lockedUntil', now] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const statsMap = new Map();
    seatStats.forEach((s) => {
      statsMap.set(s._id.toString(), s);
    });

    const data = concerts.map((c) => {
      const stats = statsMap.get(c._id.toString()) || {
        totalSeats: 0,
        bookedSeats: 0,
        lockedSeats: 0
      };
      const availableSeats = Math.max(
        0,
        stats.totalSeats - stats.bookedSeats - stats.lockedSeats
      );

      const prices = (c.tiers || []).map((t) => t.price);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;

      return {
        _id: c._id,
        title: c.title,
        artist: c.artist,
        venue: c.venue,
        date: c.date,
        bannerUrl: c.bannerUrl,
        description: c.description,
        tiers: c.tiers,
        status: c.status,
        totalSeatsCount: stats.totalSeats,
        availableSeatsCount: availableSeats,
        bookedSeatsCount: stats.bookedSeats,
        priceRange: { min: minPrice, max: maxPrice }
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    // Graceful fallback to in-memory store
    const data = inMemoryStore.getConcerts(req.query.search);
    res.json({ success: true, data });
  }
}

async function getConcertById(req, res, next) {
  try {
    const { id } = req.params;

    if (global.__isFallbackMode) {
      const concert = inMemoryStore.getConcertById(id);
      if (!concert) return res.status(404).json({ success: false, message: 'Concert not found' });
      return res.json({ success: true, data: concert });
    }

    const concert = await Concert.findById(id);
    if (!concert) {
      return res.status(404).json({ success: false, message: 'Concert not found' });
    }
    res.json({ success: true, data: concert });
  } catch (err) {
    const concert = inMemoryStore.getConcertById(req.params.id);
    if (concert) return res.json({ success: true, data: concert });
    res.status(404).json({ success: false, message: 'Concert not found' });
  }
}

async function getConcertSeats(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (global.__isFallbackMode) {
      const data = inMemoryStore.getConcertSeats(id, userId);
      return res.json({ success: true, data });
    }

    const now = new Date();
    const seats = await Seat.find({ concertId: id }).sort({
      section: 1,
      row: 1,
      number: 1
    });

    const projected = seats.map((seat) => {
      let currentStatus = seat.status;
      let remainingSeconds = 0;

      if (currentStatus === 'LOCKED') {
        if (!seat.lockedUntil || seat.lockedUntil <= now) {
          currentStatus = 'AVAILABLE';
        } else {
          remainingSeconds = Math.max(
            0,
            Math.floor((seat.lockedUntil.getTime() - now.getTime()) / 1000)
          );
        }
      }

      const isLockedByMe =
        currentStatus === 'LOCKED' && userId && seat.lockedBy === userId;

      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        section: seat.section,
        row: seat.row,
        number: seat.number,
        tier: seat.tier,
        price: seat.price,
        status: currentStatus,
        lockedUntil: currentStatus === 'LOCKED' ? seat.lockedUntil : null,
        remainingSeconds,
        isLockedByMe: Boolean(isLockedByMe)
      };
    });

    res.json({ success: true, data: projected });
  } catch (err) {
    const data = inMemoryStore.getConcertSeats(req.params.id, req.user?.id);
    res.json({ success: true, data });
  }
}

module.exports = { getConcerts, getConcertById, getConcertSeats };
