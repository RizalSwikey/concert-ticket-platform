const Seat = require('../models/Seat');

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Single seat atomic lock
async function lockSingleSeat(seatId, userId, lockExpiresAt, currentTime) {
  return await Seat.findOneAndUpdate(
    {
      _id: seatId,
      $or: [
        { status: 'AVAILABLE' },
        { status: 'LOCKED', lockedUntil: { $lt: currentTime } }
      ]
    },
    {
      $set: {
        status: 'LOCKED',
        lockedBy: userId,
        lockedUntil: lockExpiresAt
      }
    },
    { new: true }
  );
}

// POST /api/seats/lock
async function lockSeats(req, res, next) {
  try {
    const { seatIds } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication or guest session required to lock seats.'
      });
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'seatIds array is required.'
      });
    }

    if (seatIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 seats can be reserved in a single transaction.'
      });
    }

    const currentTime = new Date();
    const lockExpiresAt = new Date(currentTime.getTime() + LOCK_DURATION_MS);
    const lockedSeats = [];

    // Attempt atomic lock for each seat in sequence
    for (const seatId of seatIds) {
      const locked = await lockSingleSeat(seatId, userId, lockExpiresAt, currentTime);

      if (!locked) {
        // Rollback any seats acquired in this batch attempt
        if (lockedSeats.length > 0) {
          await Seat.updateMany(
            {
              _id: { $in: lockedSeats.map((s) => s._id) },
              lockedBy: userId
            },
            {
              $set: { status: 'AVAILABLE', lockedBy: null, lockedUntil: null }
            }
          );
        }

        return res.status(409).json({
          success: false,
          message: 'One or more requested seats are no longer available. Please select another seat.',
          conflictSeatId: seatId
        });
      }

      lockedSeats.push(locked);
    }

    res.json({
      success: true,
      lockedUntil: lockExpiresAt,
      expiresInSeconds: 600,
      lockedSeats: lockedSeats.map((s) => ({
        _id: s._id,
        seatNumber: s.seatNumber,
        tier: s.tier,
        price: s.price
      }))
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/seats/unlock
async function unlockSeats(req, res, next) {
  try {
    const { seatIds } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const filter = {
      lockedBy: userId,
      status: 'LOCKED'
    };

    if (seatIds && Array.isArray(seatIds) && seatIds.length > 0) {
      filter._id = { $in: seatIds };
    }

    await Seat.updateMany(filter, {
      $set: { status: 'AVAILABLE', lockedBy: null, lockedUntil: null }
    });

    res.json({
      success: true,
      message: 'Seats unlocked successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/seats/simulate-concurrency
// Recruiter feature: 5 simultaneous parallel requests to 1 seat
async function simulateConcurrency(req, res, next) {
  try {
    const { seatId } = req.body;
    if (!seatId) {
      return res.status(400).json({ success: false, message: 'seatId is required' });
    }

    const targetSeat = await Seat.findById(seatId);
    if (!targetSeat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    // Reset this seat to AVAILABLE for the test run
    await Seat.updateOne(
      { _id: seatId },
      { $set: { status: 'AVAILABLE', lockedBy: null, lockedUntil: null } }
    );

    const simulatedUsers = [
      { id: 'user_sim_alpha_01', name: 'User Alpha (Req #1)' },
      { id: 'user_sim_beta_02', name: 'User Beta (Req #2)' },
      { id: 'user_sim_gamma_03', name: 'User Gamma (Req #3)' },
      { id: 'user_sim_delta_04', name: 'User Delta (Req #4)' },
      { id: 'user_sim_epsilon_05', name: 'User Epsilon (Req #5)' }
    ];

    const startTime = Date.now();

    // Fire 5 concurrent requests at the exact same millisecond
    const racePromises = simulatedUsers.map(async (u) => {
      const reqStart = Date.now();
      const now = new Date();
      const expires = new Date(now.getTime() + LOCK_DURATION_MS);

      const result = await Seat.findOneAndUpdate(
        {
          _id: seatId,
          $or: [
            { status: 'AVAILABLE' },
            { status: 'LOCKED', lockedUntil: { $lt: now } }
          ]
        },
        {
          $set: {
            status: 'LOCKED',
            lockedBy: u.id,
            lockedUntil: expires
          }
        },
        { new: true }
      );

      const durationMs = Date.now() - reqStart;

      if (result) {
        return {
          user: u.name,
          userId: u.id,
          status: 200,
          outcome: 'LOCK_ACQUIRED',
          message: 'Lock successfully granted (WiredTiger serialized first)',
          timestamp: new Date().toISOString(),
          durationMs
        };
      } else {
        return {
          user: u.name,
          userId: u.id,
          status: 409,
          outcome: 'LOCK_CONFLICT',
          message: 'Rejected by atomic filter ($or evaluation failed)',
          timestamp: new Date().toISOString(),
          durationMs
        };
      }
    });

    const outcomes = await Promise.all(racePromises);
    const totalDurationMs = Date.now() - startTime;

    const winner = outcomes.find((o) => o.status === 200);
    const conflicts = outcomes.filter((o) => o.status === 409);

    const verified = winner && conflicts.length === simulatedUsers.length - 1;

    res.json({
      success: true,
      seatNumber: targetSeat.seatNumber,
      seatTier: targetSeat.tier,
      totalRequests: simulatedUsers.length,
      successCount: winner ? 1 : 0,
      conflictCount: conflicts.length,
      winner: winner?.user || 'None',
      totalDurationMs,
      verified,
      summary: verified
        ? 'VERIFIED: Exactly 1 out of 5 concurrent requests acquired the atomic lock. Zero race conditions, 0% double-booking.'
        : 'WARNING: Verification condition mismatch.',
      results: outcomes
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { lockSeats, unlockSeats, simulateConcurrency };
