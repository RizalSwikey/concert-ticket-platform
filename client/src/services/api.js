// Guest ID generator
function getGuestId() {
  let guestId = localStorage.getItem('reserva_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('reserva_guest_id', guestId);
  }
  return guestId;
}

// Request helper with automatic auth header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('reserva_token');
  const headers = {
    'Content-Type': 'application/json',
    'x-guest-id': getGuestId(),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getGuestId,

  // Auth
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  demoLogin: (recruiterName = 'VIP Buyer (Demo Pass)') =>
    request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ recruiterName })
    }),

  getMe: () => request('/auth/me'),

  // Concerts
  getConcerts: (search = '') =>
    request(`/concerts${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getConcert: (id) => request(`/concerts/${id}`),

  getConcertSeats: (id) => request(`/concerts/${id}/seats`),

  // Seats
  lockSeats: (concertId, seatIds) =>
    request('/seats/lock', {
      method: 'POST',
      body: JSON.stringify({ concertId, seatIds })
    }),

  unlockSeats: (seatIds) =>
    request('/seats/unlock', {
      method: 'POST',
      body: JSON.stringify({ seatIds })
    }),

  simulateConcurrency: (seatId) =>
    request('/seats/simulate-concurrency', {
      method: 'POST',
      body: JSON.stringify({ seatId })
    }),

  // Orders
  checkout: (concertId, seatIds, paymentMethod = 'MOCK_QRIS') =>
    request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ concertId, seatIds, paymentMethod })
    }),

  getOrder: (id) => request(`/orders/${id}`),

  getMyOrders: () => request('/orders/my'),

  // Health / Telemetry
  getHealth: () => request('/health'),

  // Seeder
  seedDatabase: () =>
    request('/seed', {
      method: 'POST'
    })
};
