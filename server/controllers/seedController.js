const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const Order = require('../models/Order');
const User = require('../models/User');

const MOCK_CONCERTS = [
  {
    title: 'Music of the Spheres World Tour',
    artist: 'Coldplay',
    venue: 'Gelora Bung Karno Stadium, Jakarta',
    date: new Date('2026-11-20T19:00:00.000Z'),
    bannerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience Coldplay live in Jakarta with a cosmic stadium stage, LED wristbands, and sustainable kinetic energy floors.',
    tiers: [
      { name: 'VIP', price: 5000000, color: '#8052ff', totalSeats: 40 },
      { name: 'CAT 1', price: 2500000, color: '#15846e', totalSeats: 60 },
      { name: 'CAT 2', price: 1250000, color: '#ffb829', totalSeats: 40 }
    ],
    status: 'ON_SALE'
  },
  {
    title: 'Live on Stage: The 24K Tour',
    artist: 'Bruno Mars',
    venue: 'Jakarta International Stadium (JIS)',
    date: new Date('2026-12-05T20:00:00.000Z'),
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    description: 'Bruno Mars brings unmatched funk, soul, and pop energy to Jakarta with full live brass band and pyrotechnics.',
    tiers: [
      { name: 'VIP', price: 4800000, color: '#8052ff', totalSeats: 40 },
      { name: 'CAT 1', price: 2400000, color: '#15846e', totalSeats: 60 },
      { name: 'CAT 2', price: 1200000, color: '#ffb829', totalSeats: 40 }
    ],
    status: 'ON_SALE'
  },
  {
    title: 'The Eras Tour Special Encore',
    artist: 'Taylor Swift',
    venue: 'National Stadium, Jakarta Arena',
    date: new Date('2026-12-18T18:30:00.000Z'),
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    description: 'A 3-hour journey through musical eras featuring monumental staging, acoustic surprise songs, and dancers.',
    tiers: [
      { name: 'VIP', price: 6500000, color: '#8052ff', totalSeats: 40 },
      { name: 'CAT 1', price: 3200000, color: '#15846e', totalSeats: 60 },
      { name: 'CAT 2', price: 1500000, color: '#ffb829', totalSeats: 40 }
    ],
    status: 'ON_SALE'
  },
  {
    title: 'Hit Me Hard and Soft Tour',
    artist: 'Billie Eilish',
    venue: 'Indonesia Arena, Jakarta',
    date: new Date('2027-01-15T19:30:00.000Z'),
    bannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    description: 'An intimate 360-degree arena audio-visual masterpiece featuring Billie Eilish and Finneas.',
    tiers: [
      { name: 'VIP', price: 4200000, color: '#8052ff', totalSeats: 40 },
      { name: 'CAT 1', price: 2100000, color: '#15846e', totalSeats: 60 },
      { name: 'CAT 2', price: 1100000, color: '#ffb829', totalSeats: 40 }
    ],
    status: 'ON_SALE'
  }
];

function generateSeatsForConcert(concertId, tiers) {
  const seats = [];
  const now = new Date();
  const tierMap = {};
  tiers.forEach((t) => {
    tierMap[t.name] = t.price;
  });

  // VIP: Rows A, B (20 seats each = 40)
  // CAT 1: Rows C, D, E (20 seats each = 60)
  // CAT 2: Rows F, G (20 seats each = 40)
  const layout = [
    { tier: 'VIP', section: 'VIP Front Stage', rows: ['A', 'B'], countPerRow: 20 },
    { tier: 'CAT 1', section: 'CAT 1 Festival Center', rows: ['C', 'D', 'E'], countPerRow: 20 },
    { tier: 'CAT 2', section: 'CAT 2 Grandstand Elevated', rows: ['F', 'G'], countPerRow: 20 }
  ];

  let seedCounter = 0;

  for (const block of layout) {
    const price = tierMap[block.tier] || 1000000;

    for (const row of block.rows) {
      for (let num = 1; num <= block.countPerRow; num++) {
        seedCounter++;
        const seatNumber = `${block.tier.replace(/\s+/g, '')}-${row}-${num}`;

        // Realistic seed distribution:
        // ~15% Booked (e.g. seedCounter % 7 === 0)
        // ~5% Active Lock (e.g. seedCounter % 19 === 0)
        // ~3% Expired Lock (e.g. seedCounter % 29 === 0)
        // Remainder Available
        let status = 'AVAILABLE';
        let lockedUntil = null;
        let lockedBy = null;
        let bookedBy = null;

        if (seedCounter % 7 === 0) {
          status = 'BOOKED';
          bookedBy = 'preseeded_attendee';
        } else if (seedCounter % 19 === 0) {
          status = 'LOCKED';
          lockedBy = 'concurrent_user_demo';
          // Active lock for 8 more minutes
          lockedUntil = new Date(now.getTime() + 8 * 60 * 1000);
        } else if (seedCounter % 29 === 0) {
          status = 'LOCKED';
          lockedBy = 'expired_user_demo';
          // Expired lock 5 minutes ago (tests lazy release!)
          lockedUntil = new Date(now.getTime() - 5 * 60 * 1000);
        }

        seats.push({
          concertId,
          seatNumber,
          section: block.section,
          row,
          number: num,
          tier: block.tier,
          price,
          status,
          lockedBy,
          lockedUntil,
          bookedBy
        });
      }
    }
  }

  return seats;
}

async function seedDatabase(req, res, next) {
  try {
    // Clear existing data
    await Seat.deleteMany({});
    await Concert.deleteMany({});
    await Order.deleteMany({});

    // Ensure default recruiter exists
    await User.findOneAndUpdate(
      { email: 'recruiter@demo.local' },
      {
        name: 'Portfolio Reviewer (Recruiter)',
        email: 'recruiter@demo.local',
        role: 'RECRUITER',
        mockWalletBalance: 50000000
      },
      { upsert: true }
    );

    let totalSeatsCreated = 0;
    const createdConcerts = [];

    for (const concertData of MOCK_CONCERTS) {
      const concert = await Concert.create(concertData);
      createdConcerts.push(concert);

      const seats = generateSeatsForConcert(concert._id, concert.tiers);
      await Seat.insertMany(seats);
      totalSeatsCreated += seats.length;
    }

    res.json({
      success: true,
      message: 'Database reset and seeded with realistic concerts and seat maps.',
      seededConcerts: createdConcerts.length,
      seededSeats: totalSeatsCreated,
      concerts: createdConcerts.map((c) => ({
        id: c._id,
        title: c.title,
        artist: c.artist,
        venue: c.venue,
        totalSeats: 140
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { seedDatabase };
