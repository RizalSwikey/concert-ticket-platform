const assert = require('assert');
const store = require('../server/config/inMemoryStore');

const CONCERT_ID = 'c_coldplay_gbk';

function seatsOf(concertId) {
  return store.seats.filter((s) => s.concertId === concertId);
}

function findAvailable(concertId, n = 1) {
  const avail = seatsOf(concertId).filter((s) => s.status === 'AVAILABLE');
  assert.ok(avail.length >= n, `precondition: need ${n} AVAILABLE seats, got ${avail.length}`);
  return avail.slice(0, n);
}

async function runTests() {
  console.log('--- RUNNING CHECKOUT FLOW VERIFICATION ---');

  // Test 1: Happy path issues a PAID order and burns the seats
  store.seed();
  const buyer = { id: 'usr_test_buyer', name: 'Test Buyer', email: 'buyer@test.local' };
  const [seatA, seatB] = findAvailable(CONCERT_ID, 2);
  const ids = [seatA._id, seatB._id];

  const lock = await store.lockBatchSeats(ids, buyer.id);
  assert.strictEqual(lock.success, true, 'lock must succeed on AVAILABLE seats');

  const order = await store.checkout(CONCERT_ID, ids, buyer, 'MOCK_QRIS');

  assert.strictEqual(order.status, 'PAID');
  assert.strictEqual(order.userId, buyer.id);
  assert.strictEqual(order.totalAmount, seatA.price + seatB.price, 'totalAmount must equal sum of seat prices');
  assert.deepStrictEqual(order.seats, [seatA.seatNumber, seatB.seatNumber]);
  assert.ok(order.qrTicketCode.startsWith('TICKET-GBK-'));

  for (const id of ids) {
    const s = store.seats.find((x) => x._id === id);
    assert.strictEqual(s.status, 'BOOKED', 'seat must be BOOKED after checkout');
    assert.strictEqual(s.bookedBy, buyer.id);
    assert.strictEqual(s.lockedBy, null, 'lock must be released on booking');
    assert.strictEqual(s.lockedUntil, null);
    assert.strictEqual(s.orderId, order.id);
  }
  assert.ok(store.orders.some((o) => o.id === order.id), 'order must be persisted');
  console.log('Test 1 Passed: checkout issues PAID order, seats BOOKED, lock released.');

  // Test 2: Booked seat cannot be re-booked (double-booking blocked)
  const again = await store.lockBatchSeats([seatA._id], buyer.id);
  assert.strictEqual(again.success, false, 'BOOKED seat must not be lockable again');
  await assert.rejects(
    () => store.checkout(CONCERT_ID, [seatA._id], buyer, 'MOCK_QRIS'),
    /expired or not held/,
    'checkout on a BOOKED seat must be rejected'
  );
  console.log('Test 2 Passed: BOOKED seat rejected on re-lock and re-checkout.');

  // Test 3: Seat locked by another user cannot be checked out (ownership enforced)
  const [seatC] = findAvailable(CONCERT_ID, 1);
  await store.lockBatchSeats([seatC._id], 'usr_other');
  await assert.rejects(
    () => store.checkout(CONCERT_ID, [seatC._id], buyer, 'MOCK_QRIS'),
    /expired or not held/,
    'checkout must reject seats locked by a different user'
  );
  await store.unlockSeats([seatC._id], 'usr_other');
  console.log('Test 3 Passed: cross-user lock cannot be checked out.');

  // Test 4: Expired lock cannot be redeemed
  const [seatD] = findAvailable(CONCERT_ID, 1);
  await store.lockBatchSeats([seatD._id], buyer.id);
  const d = store.seats.find((x) => x._id === seatD._id);
  d.lockedUntil = new Date(Date.now() - 1000);
  await assert.rejects(
    () => store.checkout(CONCERT_ID, [seatD._id], buyer, 'MOCK_QRIS'),
    /expired/,
    'checkout must reject an expired lock'
  );
  await store.unlockSeats([seatD._id], buyer.id);
  console.log('Test 4 Passed: expired lock rejected at checkout.');

  // Test 5: Partial batch lock rolls back seats already granted
  const free = findAvailable(CONCERT_ID, 2);
  await store.lockBatchSeats([free[1]._id], 'usr_other');
  const rollback = await store.lockBatchSeats([free[0]._id, free[1]._id], 'usr_rollback');
  assert.strictEqual(rollback.success, false);
  assert.strictEqual(rollback.failedSeatId, free[1]._id);
  assert.strictEqual(
    store.seats.find((x) => x._id === free[0]._id).status,
    'AVAILABLE',
    'seats granted earlier in a failed batch must be released'
  );
  console.log('Test 5 Passed: partial batch lock rolled back.');

  console.log('\nALL 5 CHECKOUT FLOW TESTS PASSED CLEANLY.');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
