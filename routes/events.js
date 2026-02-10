const express = require('express');
const router = express.Router();
const { events, saveData } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Get all events
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let filteredEvents = [...events];

  if (category) {
    filteredEvents = filteredEvents.filter(e => e.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.title.toLowerCase().includes(searchLower) || 
      e.description.toLowerCase().includes(searchLower)
    );
  }

  res.json(filteredEvents);
});

// Get single event
router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

// Create event (requires authentication)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, date, time, location, category, maxAttendees, communityId } = req.body;

    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date,
      time,
      location,
      category,
      maxAttendees: maxAttendees || null,
      communityId: communityId || null,
      organizerId: req.user.userId,
      attendees: [],
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    saveData();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// RSVP to event
router.post('/:id/rsvp', authenticateToken, (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const userId = req.user.userId;
  if (event.attendees.includes(userId)) {
    return res.status(400).json({ message: 'Already registered for this event' });
  }

  if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    return res.status(400).json({ message: 'Event is full' });
  }

  event.attendees.push(userId);
  saveData();

  res.json({ message: 'RSVP successful', event });
});

// Cancel RSVP
router.delete('/:id/rsvp', authenticateToken, (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const userId = req.user.userId;
  const index = event.attendees.indexOf(userId);
  if (index === -1) {
    return res.status(400).json({ message: 'Not registered for this event' });
  }

  event.attendees.splice(index, 1);
  saveData();

  res.json({ message: 'RSVP cancelled', event });
});

module.exports = router;
