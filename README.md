# Concert Ticket & Seat Reservation Platform (Anti Double-Booking Engine)

[![Vercel Serverless Ready](https://img.shields.io/badge/Vercel-Serverless%20Functions-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Atomic%20Writes-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![React Vite](https://img.shields.io/badge/React-18%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Dark--Stage%20Dala%20Tokens-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Author](https://img.shields.io/badge/Developed%20by-Rizal%20Akbar%20Syah%20Fauzan%20Putra%20(@RizalSwikey)-8052ff)](https://github.com/RizalSwikey)

A high-concurrency concert ticket and seat reservation engine built with the MERN stack for high-traffic "ticket war" surges. Engineered with atomic document-level locking (`findOneAndUpdate`) and lazy TTL evaluation to guarantee **100% race-condition free seat allocation with 0% double-booking**, even when thousands of users attempt to reserve the same seat in the same millisecond.

Designed following the **Refero / Dala Dark-Stage Design System** with pure black canvas (`#000000`), Electric Iris signature pill accents (`#8052ff`), Saffron sparks (`#ffb829`), and Deep Verdant confirmed states (`#15846e`).

---

## 1. Architectural Highlights

### 1.1 The High-Concurrency Problem in Ticket Reservations
In high-demand ticket sales, thousands of users click on prime seats (VIP front row) at the exact same millisecond. Traditional architectures fail in two common ways:
1. **Application-level read-then-write race conditions**: `find({ _id, status: 'AVAILABLE' })` followed by `save()`. Two requests can read `AVAILABLE` simultaneously, and both write `status = 'LOCKED'`, creating an immediate double-booking.
2. **Cron-dependent zombie locks**: Relying on background cron jobs (`setInterval` or external schedulers) to scan the database every minute to release expired locks. On serverless platforms like Vercel, serverless containers freeze when idle, killing background loops.

### 1.2 The Solution: Atomic Locking with Lazy Expiration

#### Core Atomic Query
```javascript
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

async function lockSingleSeat(seatId, userId) {
  const currentTime = new Date();
  const lockExpiresAt = new Date(currentTime.getTime() + LOCK_DURATION_MS);

  // Document-level atomic mutex in MongoDB WiredTiger
  const lockedSeat = await Seat.findOneAndUpdate(
    {
      _id: seatId,
      $or: [
        { status: 'AVAILABLE' },
        { status: 'LOCKED', lockedUntil: { $lt: currentTime } } // Stale lock check
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

  return lockedSeat; // Returns null if seat was validly locked by someone else
}
```

#### Why This Guarantees 0% Double-Booking:
1. **Single-Document Write Atomicity**: MongoDB WiredTiger serializes writes to individual documents. Requests targeting the same seat are queued and processed sequentially at the storage layer.
2. **Mutual Exclusion Filter**: The first request matches `{ status: 'AVAILABLE' }` and updates the seat to `'LOCKED'` with `lockedUntil = T + 10m`. The second request fails the filter condition because `status === 'LOCKED'` AND `lockedUntil > currentTime`. It matches 0 documents, returns `null`, and triggers an immediate `409 Conflict`.
3. **Zero Cron Overhead (Lazy Evaluation)**: If a user abandons checkout and closes their browser, no cron worker is needed. When the next user queries or attempts to lock that seat after $T + 10\text{m}$, the query matches `lockedUntil: { $lt: currentTime }` and overwrites the stale lock in-place.

### 1.3 Referenced `Seat` Collection Strategy
Instead of embedding thousands of seats inside a single `Concert` document (which locks the entire concert document during ticket wars and hits the 16MB BSON cap), seats are modeled as independent documents with compound indexes:
- `{ concertId: 1, seatNumber: 1 }` (unique constraint)
- `{ concertId: 1, status: 1, lockedUntil: 1 }` (high-speed lock filtering)

This allows 10,000 concurrent users to lock 10,000 distinct seats simultaneously with **zero write contention**.

### 1.4 Connection Pooling on Vercel Serverless
To prevent MongoDB connection pool exhaustion during traffic spikes across stateless Vercel lambdas, connections are cached globally using `global.mongoose` with `maxPoolSize: 10`:
```javascript
let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });
```

---

## 2. Recruiter & Portfolio Features

1. **1-Click Demo Login (Recruiter)**:
   - Located in the Navbar.
   - Instantly creates an authenticated reviewer session with pre-funded `Rp 50,000,000` mock wallet balance.
2. **1-Click Reset / Seed Database**:
   - Located in the Navbar.
   - Idempotently resets and populates 4 realistic stadium concerts (Coldplay at GBK, Bruno Mars at JIS, Taylor Swift at National Stadium, Billie Eilish at Indonesia Arena) with over 560+ distributed seats (Available, Booked, and Expired/Active locks).
3. **Simulate Concurrent Booking Benchmark (5x Parallel Race)**:
   - Interactive widget directly in the UI.
   - Fires 5 simultaneous HTTP requests to the exact same seat at the exact same millisecond.
   - Renders a live visual breakdown proving that **strictly 1 request wins (`200 OK`)** and **4 requests are rejected (`409 Conflict`)** with millisecond latency metrics.
4. **Digital QR Code E-Ticket**:
   - Simulated checkout generates an official digital ticket pass containing a live-generated QR code pass, order number, and buyer verification badge.

---

## 3. Tech Stack

- **Backend**: Node.js, Express.js, Mongoose 8 (MongoDB Atlas)
- **Frontend**: React 18, Vite, Tailwind CSS (Dala Dark-Stage Theme), Lucide Icons, Canvas Confetti, QRCode
- **Deployment Target**: Vercel Serverless Functions (`api/index.js` + `dist/`)

---

## 4. Local Development Setup

### 4.1 Prerequisites
- Node.js 18+ (tested on Node v22)
- MongoDB instance (local `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 4.2 Clone & Install
```bash
git clone https://github.com/RizalSwikey/concert-ticket-anti-double-booking.git
cd concert-ticket-anti-double-booking

# Install root dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### 4.3 Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/concert_reservation
JWT_SECRET=concert_jwt_secret_rizalswikey_anti_double_booking_2026
```

### 4.4 Run Seeder
```bash
npm run seed
```
Or start the server and click **"1-Click Reset DB"** in the top navbar.

### 4.5 Start Development Server
```bash
# Start backend server (port 5000)
npm run dev:server

# Start frontend client (port 3000)
npm run dev:client

# Or run both concurrently
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. Verification & Testing

Run the atomic locking contract verification suite:
```bash
npm test
```

Expected output:
```
--- RUNNING ATOMIC SEAT LOCKING VERIFICATION ---
Test 1: 5 simultaneous concurrent requests to 1 AVAILABLE seat...
✓ Test 1 Passed: Exactly 1 winner (user_1), 4 conflicts.
Test 2: Lazy Expiration (expired lock claimed without cron)...
✓ Test 2 Passed: Stale lock was overwritten in-place lazily with zero cron.

ALL 2 ATOMIC INVARIANT TESTS PASSED CLEANLY.
```

---

## 6. Vercel Deployment Configuration

The repository is configured for out-of-the-box Vercel deployment via `vercel.json`:
- `outputDirectory`: `dist` (Vite build output)
- `buildCommand`: `npm run build`
- API routing: `/api/(.*)` rewrites to Serverless Function `api/index.js`
- SPA fallback: `/(.*)` rewrites to `/index.html`

In Vercel Project Settings, add the following Environment Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
- `JWT_SECRET`: Random 64-character secret key

---

## 7. Author Attribution

Developed with precision by **Rizal Akbar Syah Fauzan Putra**  
- **GitHub**: [@RizalSwikey](https://github.com/RizalSwikey)  
- **Role**: Principal Full-Stack MERN Engineer  
- **Portfolio Showcase**: High-Concurrency Ticket Reservation Platform
