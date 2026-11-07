const jwt = require('jsonwebtoken');
const User = require('../models/User');
const inMemoryStore = require('../config/inMemoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'concert_jwt_secret_rizalswikey_anti_double_booking_2026';

async function demoLogin(req, res, next) {
  try {
    const { recruiterName } = req.body;
    const name = recruiterName?.trim() || 'Portfolio Reviewer (Recruiter)';

    if (global.__isFallbackMode) {
      const session = inMemoryStore.demoLogin(name);
      return res.json({
        success: true,
        token: session.token,
        user: session.user
      });
    }

    const email = `recruiter-${Date.now()}@demo.local`;
    let user = await User.findOne({ name, role: 'RECRUITER' });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'RECRUITER',
        mockWalletBalance: 50000000
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        mockWalletBalance: user.mockWalletBalance
      }
    });
  } catch (err) {
    // If Mongo failed during query, transparently fall back
    const session = inMemoryStore.demoLogin(req.body.recruiterName || 'Portfolio Reviewer (Recruiter)');
    res.json({
      success: true,
      token: session.token,
      user: session.user
    });
  }
}

async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (global.__isFallbackMode) {
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email || 'recruiter@demo.local',
          role: req.user.role || 'RECRUITER',
          mockWalletBalance: 50000000
        }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email || 'guest@demo.local',
          role: req.user.role || 'CUSTOMER',
          mockWalletBalance: 50000000
        }
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        mockWalletBalance: user.mockWalletBalance
      }
    });
  } catch (err) {
    res.json({
      success: true,
      user: {
        id: req.user?.id || 'demo_user',
        name: req.user?.name || 'Portfolio Reviewer',
        email: 'recruiter@demo.local',
        role: 'RECRUITER',
        mockWalletBalance: 50000000
      }
    });
  }
}

module.exports = { demoLogin, getMe };
