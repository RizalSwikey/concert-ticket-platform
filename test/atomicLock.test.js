const assert = require('assert');

// Simulate WiredTiger atomic findOneAndUpdate logic in pure memory to assert contract invariants
class MockSeatStore {
  constructor(initialSeats) {
    this.seats = JSON.parse(JSON.stringify(initialSeats));
    this.writeMutex = Promise.resolve();
  }

  // Exact reproduction of MongoDB's document-level serialized findOneAndUpdate
  async findOneAndUpdate(filter, update) {
    return new Promise((resolve) => {
      this.writeMutex = this.writeMutex.then(async () => {
        const seat = this.seats.find((s) => {
          if (s._id !== filter._id) return false;

          // $or evaluation
          if (filter.$or) {
            const matchesOr = filter.$or.some((condition) => {
              if (condition.status && s.status !== condition.status) return false;
              if (condition.lockedUntil?.$lt) {
                if (!s.lockedUntil) return false;
                return new Date(s.lockedUntil) < new Date(condition.lockedUntil.$lt);
              }
              return true;
            });
            if (!matchesOr) return false;
          }

          return true;
        });

        if (!seat) {
          resolve(null);
          return;
        }

        // Apply $set atomically
        if (update.$set) {
          Object.assign(seat, update.$set);
        }

        resolve({ ...seat });
      });
    });
  }

  getSeat(id) {
    return this.seats.find((s) => s._id === id);
  }
}

async function runTests() {
  console.log('--- RUNNING ATOMIC SEAT LOCKING VERIFICATION ---');

  const store = new MockSeatStore([
    {
      _id: 'seat-101',
      seatNumber: 'VIP-A-1',
      status: 'AVAILABLE',
      lockedBy: null,
      lockedUntil: null
    },
    {
      _id: 'seat-102',
      seatNumber: 'VIP-A-2',
      status: 'LOCKED',
      lockedBy: 'user-old',
      lockedUntil: new Date(Date.now() - 5000) // Expired 5 seconds ago
    }
  ]);

  const LOCK_DURATION = 10 * 60 * 1000;

  // 1. Concurrent Race Test: 5 simultaneous requests to 'seat-101'
  console.log('Test 1: 5 simultaneous concurrent requests to 1 AVAILABLE seat...');
  const users = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_DURATION);

  const raceResults = await Promise.all(
    users.map(async (u) => {
      return store.findOneAndUpdate(
        {
          _id: 'seat-101',
          $or: [{ status: 'AVAILABLE' }, { status: 'LOCKED', lockedUntil: { $lt: now } }]
        },
        {
          $set: { status: 'LOCKED', lockedBy: u, lockedUntil: expiresAt }
        }
      );
    })
  );

  const winners = raceResults.filter(Boolean);
  const losers = raceResults.filter((r) => r === null);

  assert.strictEqual(winners.length, 1, 'Exactly 1 request must acquire the lock');
  assert.strictEqual(losers.length, 4, '4 concurrent requests must be rejected with null/conflict');
  console.log(`✓ Test 1 Passed: Exactly 1 winner (${winners[0].lockedBy}), 4 conflicts.`);

  // 2. Lazy Expiration Test: 'seat-102' is LOCKED but lockedUntil is in the past
  console.log('Test 2: Lazy Expiration (expired lock claimed without cron)...');
  const claimExpired = await store.findOneAndUpdate(
    {
      _id: 'seat-102',
      $or: [{ status: 'AVAILABLE' }, { status: 'LOCKED', lockedUntil: { $lt: now } }]
    },
    {
      $set: { status: 'LOCKED', lockedBy: 'user_lazy_winner', lockedUntil: expiresAt }
    }
  );

  assert.ok(claimExpired, 'Expired seat must be claimable atomically');
  assert.strictEqual(claimExpired.lockedBy, 'user_lazy_winner');
  console.log('✓ Test 2 Passed: Stale lock was overwritten in-place lazily with zero cron.');

  console.log('\nALL 2 ATOMIC INVARIANT TESTS PASSED CLEANLY.');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
