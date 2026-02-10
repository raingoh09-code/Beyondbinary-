const express = require('express');
const router = express.Router();
const { users, events, communities, saveData } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  // Check if user is updating their own profile
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ message: 'You can only update your own profile' });
  }

  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, phone, area, bio, interests } = req.body;

  // Update user data
  if (name) users[userIndex].name = name;
  if (phone !== undefined) users[userIndex].phone = phone;
  if (area !== undefined) users[userIndex].area = area;
  if (bio !== undefined) users[userIndex].bio = bio;
  if (interests !== undefined) users[userIndex].interests = interests;

  // Save to file
  saveData();

  // Remove password from response
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

// Get user's events
router.get('/:id/events', (req, res) => {
  const userEvents = events.filter(e => 
    e.organizerId === req.params.id || e.attendees.includes(req.params.id)
  );
  res.json(userEvents);
});

// Get user's communities
router.get('/:id/communities', (req, res) => {
  const userCommunities = communities.filter(c => c.members.includes(req.params.id));
  res.json(userCommunities);
});

module.exports = router;
