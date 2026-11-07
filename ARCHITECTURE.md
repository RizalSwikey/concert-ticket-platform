# ARCHITECTURE SPECIFICATION
## High-Concurrency Concert Ticket & Seat Reservation Platform (MERN Stack on Vercel)
**Author & Candidate**: Rizal Akbar Syah Fauzan Putra (`RizalSwikey`)  
**Target Environment**: Vercel Serverless Functions + MongoDB Atlas + React (Vite)  
**Design Reference**: Refero Styles — Dala ("Your workplace has the answer. Just ask Dala for it.")

---

## 1. UI/UX Design System Specification (Refero / Dala Theme)

### 1.1 Philosophy & Visual Metaphor
A dark-stage, digital holo-deck environment where pure black voids (`#000000`) meet saturated electric violet (`#8052ff`), punctuated by saffron amber sparks (`#ffb829`) and deep verdant accents (`#15846e`). 

- **Surfaces**: Elevation is achieved through contrast, scale, and subtle atmospheric glows rather than traditional fuzzy drop shadows.
- **Hierarchy by Scale, Not Weight**: Display headlines use `weight: 400` at massive scales (78–113px) with aggressive negative tracking (`-0.04em`), while body copy uses ultra-light (`weight: 200`).
- **Signature Accent**: Single primary interactive CTA (Electric Iris pill button). Never crowd the viewport with multiple primary buttons.

### 1.2 Design Tokens

| Token Name | Hex / CSS Value | Role & Semantic Application |
| :--- | :--- | :--- |
| `void` | `#000000` | Canvas base, page background, deep void space |
| `void-surface` | `#09090b` | Elevated surfaces (drawers, modal backgrounds, hover states) |
| `void-border` | `rgba(255, 255, 255, 0.08)` | Hairline dividers, seat outlines, floating panel borders |
| `bone-white` | `#ffffff` | Primary display text, stage boundary outline, active icon fills |
| `ash-gray` | `#9a9a9a` | Secondary text, inactive tab labels, ghost button text |
| `silver-mist` | `#bdbdbd` | Tertiary metadata, seat row labels, timestamps |
| `electric-iris` | `#8052ff` | Primary CTA pill, selected seat state, interactive brand aura |
| `saffron-spark` | `#ffb829` | Seat "LOCKED" status, countdown timer warnings, highlight sparks |
| `deep-verdant` | `#15846e` | Seat "BOOKED" status (sold), payment confirmed badge, logo gradient |

### 1.3 Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./client/index.html', './client/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#000000',
          surface: '#09090b',
          card: '#111115',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        bone: '#ffffff',
        ash: '#9a9a9a',
        silver: '#bdbdbd',
        iris: {
          DEFAULT: '#8052ff',
          hover: '#6f3ff5',
          glow: 'rgba(128, 82, 255, 0.35)'
        },
        saffron: {
          DEFAULT: '#ffb829',
          glow: 'rgba(255, 184, 41, 0.3)'
        },
        verdant: {
          DEFAULT: '#15846e',
          glow: 'rgba(21, 132, 110, 0.3)'
        }
      },
      fontFamily: {
        sans: ['PPNeueMontreal', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.025em'
      },
      borderRadius: {
        '3xl': '24px',
        pill: '9999px'
      },
      boxShadow: {
        'iris-glow': '0 0 25px -3px rgba(128, 82, 255, 0.45)',
        'saffron-glow': '0 0 20px -3px rgba(255, 184, 41, 0.4)',
        'ambient-stage': '0 20px 80px -20px rgba(128, 82, 255, 0.25)'
      }
    }
  },
  plugins: []
};
```

### 1.4 Specific Component UI Mapping

1. **Hero Section (Concert Headline & Stage Ambience)**:
   - Asymmetric two-column split on `#000000`.
   - Left: Monolithic headline (`text-6xl md:text-8xl font-normal tracking-tighter text-bone`), ultra-light subhead (`text-lg font-extralight text-silver`), and a single `electric-iris` pill CTA (`rounded-full px-8 py-4 bg-iris text-white shadow-iris-glow uppercase tracking-wide text-xs font-semibold`).
   - Right: Interactive ambient stage light / particle constellation visualizing concert soundwaves and live seat occupancy density.

2. **Concert Card (Event Listing)**:
   - Borderless or hairline border (`border border-void-border rounded-3xl bg-void-card/60 backdrop-blur-md p-6 hover:border-iris/40 transition-all`).
   - Category tags styled with uppercase `text-xs font-semibold tracking-wide text-saffron`.
   - Live availability badge showing real-time remaining seats count.

3. **Interactive Stage Seating Map**:
   - Top: Stylized glowing curved arc representing **STAGE / VIP SOUNDBOOTH** (`border-b-2 border-iris/60 shadow-ambient-stage text-center text-ash text-xs tracking-widest uppercase pb-2`).
   - Grid layout of SVG / CSS seat nodes categorized by Tier (VIP, Platinum, Cat 1, Cat 2).
   - Seat States:
     - **Available**: `bg-zinc-800/80 hover:bg-zinc-700 text-transparent border border-white/10 cursor-pointer`
     - **Selected by Me**: `bg-iris text-white shadow-iris-glow scale-110 border-bone cursor-pointer`
     - **Locked by Others**: `bg-saffron/20 border border-saffron/50 text-saffron animate-pulse cursor-not-allowed` (with live remaining lock timer countdown)
     - **Booked / Sold**: `bg-zinc-900/60 border border-white/5 text-zinc-600 opacity-40 cursor-not-allowed`

4. **Checkout Drawer (Slide-Over Panel)**:
   - Slides from right (`w-full max-w-md bg-void-surface border-l border-void-border p-8 rounded-l-3xl backdrop-blur-2xl`).
   - Sticky top bar: 10-minute countdown indicator with amber spark pulse (`text-saffron font-mono text-sm`).
   - Seat tier breakdown, administrative fee, dynamic subtotal calculation.
   - Primary Action: Full-width Electric Iris pill button (`Confirm & Pay Mock`).

---

## 2. High-Concurrency Backend Architecture (Serverless Vercel + MongoDB)

### 2.1 Database Modeling Strategy: Why Referenced `Seat` Collection?

In high-concurrency seat reservation (ticket war):
- **Embedded Array Antipattern**: Embedding 10,000 seats inside a single `Concert` document fails at scale:
  1. *Write Contention*: MongoDB uses document-level locking in WiredTiger. Updating `concert.seats.$.status` locks the entire concert document. Concurrent writes from thousands of users result in severe lock conflicts and transaction aborts.
  2. *BSON 16MB Cap*: A full stadium seating map with historical logs easily approaches the 16MB limit.
- **Referenced `Seat` Pattern (Selected)**: Each seat is an independent document with compound indexes `{ concertId: 1, seatNumber: 1 }` and `{ concertId: 1, status: 1, lockedUntil: 1 }`.
  - Enables true document-level atomic writes per seat.
  - Allows 10,000 users to concurrently lock 10,000 distinct seats with zero write contention.

### 2.2 Mongoose Connection Pooling in Vercel Serverless

Vercel functions freeze between requests and can spin up dozens of isolated instances during traffic spikes. Creating new `mongoose.connect()` calls on every invocation causes connection pool exhaustion on MongoDB Atlas.

**Connection Cache Singleton (`api/config/db.js`)**:
```javascript
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain lean pool per serverless container
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
```

### 2.3 Mongoose Schemas

#### 1. `Concert.js`
```javascript
const mongoose = require('mongoose');

const TierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'VIP', 'CAT 1', 'CAT 2'
  price: { type: Number, required: true },
  color: { type: String, default: '#8052ff' },
  totalSeats: { type: Number, required: true }
}, { _id: false });

const ConcertSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  artist: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  bannerUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  tiers: [TierSchema],
  status: { type: String, enum: ['UPCOMING', 'ON_SALE', 'SOLD_OUT', 'CANCELLED'], default: 'ON_SALE' }
}, { timestamps: true });

module.exports = mongoose.models.Concert || mongoose.model('Concert', ConcertSchema);
```

#### 2. `Seat.js`
```javascript
const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  concertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true, index: true },
  seatNumber: { type: String, required: true }, // e.g., 'VIP-A-12'
  section: { type: String, required: true },    // e.g., 'Section A'
  row: { type: String, required: true },        // e.g., 'A'
  number: { type: Number, required: true },     // e.g., 12
  tier: { type: String, required: true },       // e.g., 'VIP'
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], 
    default: 'AVAILABLE',
    index: true 
  },
  lockedBy: { type: String, default: null },   // User ID or Guest Session UUID
  lockedUntil: { type: Date, default: null, index: true },
  bookedBy: { type: String, default: null },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

// Compound unique index: Prevent duplicate seat allocations per concert
SeatSchema.index({ concertId: 1, seatNumber: 1 }, { unique: true });

// Compound index for fast seat-map status queries & lock evaluations
SeatSchema.index({ concertId: 1, status: 1, lockedUntil: 1 });

module.exports = mongoose.models.Seat || mongoose.model('Seat', SeatSchema);
```

#### 3. `Order.js`
```javascript
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  seatNumber: { type: String, required: true },
  tier: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  concertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true },
  seats: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'], 
    default: 'PENDING',
    index: true 
  },
  expiresAt: { type: Date, required: true },
  paymentDetails: {
    method: { type: String, default: 'MOCK_QRIS' },
    transactionId: { type: String, default: null },
    paidAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
```

#### 4. `User.js` (Lightweight Recruiter / Guest Model)
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['RECRUITER', 'CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  mockWalletBalance: { type: Number, default: 50000000 } // 50M IDR for testing
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
```

---

### 2.4 Algoritma "Atomic Seat Locking with Lazy Expiration"

#### The Problem
In standard cron-based systems:
- A server checks the DB every 1 minute to release expired locked seats.
- **Fail on Vercel**: Serverless containers are stateless and freeze when idle. Background loops (`setInterval`) die immediately. External cron services introduce latency and cost.

#### The Solution: Lazy Atomic Expiration
We do not run any background cleaner. Instead, expiration is evaluated **lazily and atomically** at the exact moment a lock is requested or a seating map is queried.

#### Core Atomic Operation
```javascript
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

async function lockSingleSeat(seatId, userId) {
  const currentTime = new Date();
  const lockExpiresAt = new Date(currentTime.getTime() + LOCK_DURATION_MS);

  // ATOMIC FIND AND MODIFY
  const lockedSeat = await Seat.findOneAndUpdate(
    {
      _id: seatId,
      $or: [
        { status: 'AVAILABLE' },
        { status: 'LOCKED', lockedUntil: { $lt: currentTime } } // Expired lock check
      ]
    },
    {
      $set: {
        status: 'LOCKED',
        lockedBy: userId,
        lockedUntil: lockExpiresAt
      }
    },
    { new: true } // Return updated document
  );

  return lockedSeat; // null if seat is already validly locked or booked
}
```

#### Why This is 100% Race-Condition Free
1. **Single Document Write Atomicity**:
   MongoDB guarantees that an update operation on a single document (`findOneAndUpdate`) is completely atomic. WiredTiger serializes writes to that document.
2. **Deterministic Mutual Exclusion**:
   Suppose User A and User B send simultaneous requests to lock Seat X at $T_0$:
   - User A and User B both execute the query with `$or: [ { status: 'AVAILABLE' }, { status: 'LOCKED', lockedUntil: { $lt: T_0 } } ]`.
   - WiredTiger evaluates User A first. At that moment, `status === 'AVAILABLE'`. Document updates: `status` becomes `'LOCKED'`, and `lockedUntil` becomes $T_0 + 10\text{m}$.
   - Immediately after, WiredTiger evaluates User B. The filter condition fails because `status` is now `'LOCKED'` AND `lockedUntil` is in the future ($T_0 + 10\text{m} > T_0$).
   - User B's query matches 0 documents and returns `null`. User B is immediately notified with `409 Conflict`.
3. **Zero Zombie Locks Without Cron**:
   If User A abandons checkout and closes their browser, the seat document remains with `status: 'LOCKED'` until $T_0 + 10\text{m}$. When User C arrives at $T_0 + 11\text{m}$, the query matches `lockedUntil: { $lt: currentTime }`. User C atomically claims the lock. The stale lock is overwritten in-place with zero cron overhead.

#### Multi-Seat Atomic Batch Locking (All-or-Nothing Guarantee)
When a user reserves multiple seats (e.g., 2–4 seats for friends):
```javascript
async function lockBatchSeats(seatIds, userId) {
  const lockedSeats = [];

  for (const seatId of seatIds) {
    const locked = await lockSingleSeat(seatId, userId);
    if (!locked) {
      // ROLLBACK: Release previously acquired locks in this attempt
      if (lockedSeats.length > 0) {
        await Seat.updateMany(
          {
            _id: { $in: lockedSeats.map(s => s._id) },
            lockedBy: userId
          },
          {
            $set: { status: 'AVAILABLE', lockedBy: null, lockedUntil: null }
          }
        );
      }
      return { success: false, failedSeatId: seatId };
    }
    lockedSeats.push(locked);
  }

  return { success: true, seats: lockedSeats };
}
```

---

## 3. REST API Specification

### 3.1 Authentication & Recruiter Access

#### `POST /api/demo-login`
Creates or logs in a one-click session for portfolio reviewers / recruiters.
- **Request**:
  ```json
  { "recruiterName": "Recruiter from Company X" }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6724a1b0c9e2b10012ab34cd",
      "name": "Recruiter from Company X",
      "email": "recruiter@demo.local",
      "role": "RECRUITER",
      "mockWalletBalance": 50000000
    }
  }
  ```

---

### 3.2 Concert Endpoints

#### `GET /api/concerts`
Retrieves list of available concerts.
- **Query Params**: `page=1&limit=10&search=coldplay`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6724a1b0c9e2b10012ab1111",
        "title": "Music of the Spheres World Tour",
        "artist": "Coldplay",
        "venue": "Gelora Bung Karno Stadium, Jakarta",
        "date": "2026-11-20T12:00:00.000Z",
        "bannerUrl": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
        "status": "ON_SALE",
        "priceRange": { "min": 800000, "max": 5000000 },
        "availableSeatsCount": 420
      }
    ]
  }
  ```

#### `GET /api/concerts/:id`
Retrieves single concert details and tier definitions.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6724a1b0c9e2b10012ab1111",
      "title": "Music of the Spheres World Tour",
      "artist": "Coldplay",
      "venue": "Gelora Bung Karno Stadium, Jakarta",
      "date": "2026-11-20T12:00:00.000Z",
      "tiers": [
        { "name": "VIP", "price": 5000000, "color": "#8052ff", "totalSeats": 60 },
        { "name": "CAT 1", "price": 2500000, "color": "#15846e", "totalSeats": 120 },
        { "name": "CAT 2", "price": 1250000, "color": "#ffb829", "totalSeats": 200 }
      ]
    }
  }
  ```

#### `GET /api/concerts/:id/seats`
Retrieves the real-time seating map with lazy-evaluated availability.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6724a1b0c9e2b10012ab2001",
        "seatNumber": "VIP-A-1",
        "section": "VIP A",
        "row": "A",
        "number": 1,
        "tier": "VIP",
        "price": 5000000,
        "status": "AVAILABLE", 
        "lockedUntil": null
      },
      {
        "_id": "6724a1b0c9e2b10012ab2002",
        "seatNumber": "VIP-A-2",
        "section": "VIP A",
        "row": "A",
        "number": 2,
        "tier": "VIP",
        "price": 5000000,
        "status": "LOCKED",
        "lockedUntil": "2026-11-07T05:32:00.000Z"
      }
    ]
  }
  ```
  *(Note: Backend projection computes: if `status === 'LOCKED'` and `lockedUntil < now`, returns `status: 'AVAILABLE'`)*.

---

### 3.3 Seat Locking & Order Processing

#### `POST /api/seats/lock`
Atomically locks 1 to 4 seats for 10 minutes.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "concertId": "6724a1b0c9e2b10012ab1111",
    "seatIds": ["6724a1b0c9e2b10012ab2001", "6724a1b0c9e2b10012ab2002"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "lockedUntil": "2026-11-07T05:40:00.000Z",
    "lockedSeats": [
      { "_id": "6724a1b0c9e2b10012ab2001", "seatNumber": "VIP-A-1", "price": 5000000 },
      { "_id": "6724a1b0c9e2b10012ab2002", "seatNumber": "VIP-A-2", "price": 5000000 }
    ],
    "expiresInSeconds": 600
  }
  ```
- **Response `409 Conflict` (Seat already taken)**:
  ```json
  {
    "success": false,
    "message": "One or more requested seats are no longer available. Please select another seat.",
    "conflictSeatId": "6724a1b0c9e2b10012ab2001"
  }
  ```

#### `POST /api/seats/unlock`
Releases seats manually if user deselects or navigates away.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "seatIds": ["6724a1b0c9e2b10012ab2001"]
  }
  ```
- **Response `200 OK`**:
  ```json
  { "success": true, "message": "Seats unlocked successfully." }
  ```

#### `POST /api/orders/checkout`
Confirms payment and locks seats permanently to `BOOKED`.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "concertId": "6724a1b0c9e2b10012ab1111",
    "seatIds": ["6724a1b0c9e2b10012ab2001", "6724a1b0c9e2b10012ab2002"],
    "paymentMethod": "MOCK_QRIS"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "order": {
      "orderNumber": "ORD-20261107-7782",
      "totalAmount": 10000000,
      "status": "PAID",
      "seats": ["VIP-A-1", "VIP-A-2"],
      "paidAt": "2026-11-07T05:31:00.000Z",
      "qrTicketCode": "TICKET-MOCK-GBK-VIPA1A2"
    }
  }
  ```

#### `GET /api/orders/:id`
Retrieves ticket invoice and digital QR pass details.

---

### 3.4 Seed Endpoint

#### `POST /api/seed`
Idempotent endpoint to reset and populate mock concerts, tiers, and 300+ seat maps.
- **Request**: Optional `{ "secret": "recruiter_seed_key" }`
- **Generates**:
  - 3 Real-world concerts: Coldplay (GBK Jakarta), Bruno Mars (Jakarta International Stadium), Taylor Swift (National Stadium Mock).
  - Tiers: VIP, CAT 1, CAT 2 with pre-configured seat grids.
  - Initial distributed seat statuses (80% Available, 15% Booked, 5% Expired Locks) to showcase dynamic map capabilities immediately.

---

## 4. Monorepo Architecture & Vercel Configuration

### 4.1 Folder Structure

```
concert-ticket-project/
├── api/                             # Express backend running as Vercel Serverless Function
│   ├── config/
│   │   └── db.js                    # Serverless MongoDB connection cache
│   ├── controllers/
│   │   ├── authController.js        # Recruiter login & JWT generation
│   │   ├── concertController.js     # Concert queries & tier filtering
│   │   ├── seatController.js        # Atomic lock, unlock & seat projection
│   │   ├── orderController.js       # Checkout & mock payment
│   │   └── seedController.js        # Database seed runner
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT Bearer verification
│   │   └── errorHandler.js          # Central error parser
│   ├── models/
│   │   ├── Concert.js
│   │   ├── Seat.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── concertRoutes.js
│   │   ├── seatRoutes.js
│   │   ├── orderRoutes.js
│   │   └── seedRoutes.js
│   ├── app.js                       # Express app configuration & middleware
│   └── index.js                     # Serverless function entrypoint
│
├── client/                          # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Void transparent header + 1-Click Demo badge
│   │   │   ├── Hero.jsx             # Two-column display headline & particle canvas
│   │   │   ├── ConcertCard.jsx      # Minimalist event cards with status
│   │   │   ├── SeatingMap/
│   │   │   │   ├── StageCurve.jsx   # Stylized glowing stage arc
│   │   │   │   ├── SeatNode.jsx     # Individual seat pip with hover tooltip
│   │   │   │   ├── SeatLegend.jsx   # Available / Selected / Locked / Booked indicator
│   │   │   │   └── SeatingGrid.jsx  # Interactive SVG/CSS grid
│   │   │   ├── CheckoutDrawer.jsx   # Slide-over panel with 10-min live timer
│   │   │   └── TicketModal.jsx      # Post-checkout QR code mock
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Recruiter token & user state
│   │   │   └── SeatContext.jsx      # Selected seats, active countdown, WebSocket/polling
│   │   ├── hooks/
│   │   │   ├── useCountdown.js      # Synced 10-minute timer hook
│   │   │   └── useSeatingMap.js     # Polling fetcher for seat status
│   │   ├── services/
│   │   │   └── api.js               # Axios / Fetch client targeting /api/*
│   │   ├── App.jsx
│   │   ├── index.css                # Dala custom styles & font definitions
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── vercel.json                      # Unified Vercel serverless + SPA routing
├── package.json                     # Monorepo orchestrator scripts
├── design.md                        # Refero Dala design token definitions
└── ARCHITECTURE.md                  # This document
```

### 4.2 `vercel.json` Specification

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/client/dist/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
```

### 4.3 Root `package.json`

```json
{
  "name": "high-concurrency-concert-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:server": "nodemon api/server.js",
    "dev:client": "npm --prefix client run dev",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "build:client": "npm --prefix client run build",
    "seed": "node api/scripts/seedLocal.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.1.0"
  }
}
```

### 4.4 Express Serverless Adapter (`api/index.js`)

```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const concertRoutes = require('./routes/concertRoutes');
const seatRoutes = require('./routes/seatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failure:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Mount Routes
app.use('/api', authRoutes);
app.use('/api/concerts', concertRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seed', seedRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
```

---

## 5. Implementation Roadmap for Coding Agent (OMP)

1. **Step 1: Project Scaffolding & Configs**
   - Initialize root `package.json`, `vercel.json`, and `.gitignore`.
   - Setup `/api` with Express, Mongoose, CORS, and `connectDB` serverless singleton.
   - Setup `/client` with Vite, React, and Tailwind CSS configured with the Dala design tokens.

2. **Step 2: Database Models & Seed Engine**
   - Implement schemas in `api/models/`.
   - Build `POST /api/seed` with deterministic mock data for Coldplay, Bruno Mars, and Taylor Swift concerts.

3. **Step 3: Atomic Lock Engine & APIs**
   - Implement `POST /api/seats/lock` and `POST /api/seats/unlock` with atomic `findOneAndUpdate` lazy expiration logic.
   - Implement `POST /api/orders/checkout` with mock payment confirmation and transition to `BOOKED`.
   - Implement `POST /api/demo-login` (1-Click Recruiter access).

4. **Step 4: Frontend Development (Dala Theme)**
   - Build Hero section with massive display type (`78px+`, `tracking-tighter`, `weight: 400`) on `#000000`.
   - Build Interactive Stage Seating Map with SVG/CSS nodes, hover tooltips, and real-time status visual indicators (Available / Selected / Locked / Booked).
   - Build Checkout Drawer with synced 10-minute live countdown timer and single Electric Iris pill button.

5. **Step 5: Testing & Verification**
   - Concurrent test: simulate 2 simultaneous requests attempting to lock the exact same seat; verify only one returns `200` while the other receives `409 Conflict`.
   - Lazy test: set `lockedUntil` in the past, verify subsequent lock query acquires the seat without cron intervention.
