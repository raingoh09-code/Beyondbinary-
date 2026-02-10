const express = require('express');
const router = express.Router();
const { communities, saveData } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Get all communities
router.get('/', (req, res) => {
  res.json(communities);
});

// Get single community
router.get('/:id', (req, res) => {
  const community = communities.find(c => c.id === req.params.id);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  res.json(community);
});

// Create community
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, description, category, location } = req.body;

    const newCommunity = {
      id: Date.now().toString(),
      name,
      description,
      category,
      location,
      organizerId: req.user.userId,
      members: [req.user.userId],
      createdAt: new Date().toISOString()
    };

    communities.push(newCommunity);
    saveData();

    res.status(201).json({ message: 'Community created successfully', community: newCommunity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join community
router.post('/:id/join', authenticateToken, (req, res) => {
  const community = communities.find(c => c.id === req.params.id);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }

  const userId = req.user.userId;
  if (community.members.includes(userId)) {
    return res.status(400).json({ message: 'Already a member of this community' });
  }

  community.members.push(userId);
  saveData();

  res.json({ message: 'Joined community successfully', community });
});

// Leave community
router.post('/:id/leave', authenticateToken, (req, res) => {
  const community = communities.find(c => c.id === req.params.id);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }

  const userId = req.user.userId;
  if (community.organizerId === userId) {
    return res.status(400).json({ message: 'Organizer cannot leave community' });
  }

  const index = community.members.indexOf(userId);
  if (index === -1) {
    return res.status(400).json({ message: 'Not a member of this community' });
  }

  community.members.splice(index, 1);
  saveData();

  res.json({ message: 'Left community successfully', community });
});

module.exports = router;
