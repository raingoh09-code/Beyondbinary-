const express = require('express');
const router = express.Router();
const { caregivers, saveData } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Get all caregivers
router.get('/', (req, res) => {
  try {
    const { area, service, minRating } = req.query;
    
    let filteredCaregivers = [...caregivers];
    
    // Filter by area
    if (area) {
      filteredCaregivers = filteredCaregivers.filter(cg => 
        cg.location.area.toLowerCase().includes(area.toLowerCase())
      );
    }
    
    // Filter by service
    if (service) {
      filteredCaregivers = filteredCaregivers.filter(cg => 
        cg.services.some(s => s.toLowerCase().includes(service.toLowerCase()))
      );
    }
    
    // Filter by minimum rating
    if (minRating) {
      filteredCaregivers = filteredCaregivers.filter(cg => 
        cg.rating >= parseFloat(minRating)
      );
    }
    
    res.json(filteredCaregivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get caregiver by ID
router.get('/:id', (req, res) => {
  try {
    const caregiver = caregivers.find(cg => cg.id === req.params.id);
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    res.json(caregiver);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create/Register as a caregiver (requires authentication)
router.post('/register', authenticateToken, (req, res) => {
  try {
    const { name, phone, email, bio, services, hourlyRate, availability, location, experience, certifications } = req.body;
    
    const newCaregiver = {
      id: `cg${Date.now()}`,
      userId: req.userId,
      name,
      phone,
      email,
      bio,
      services: services || [],
      hourlyRate: hourlyRate || 0,
      availability: availability || '',
      location: location || { area: '', lat: 0, lng: 0 },
      experience: experience || '0 years',
      certifications: certifications || [],
      rating: 0,
      reviews: 0,
      verified: false,
      followers: 0,
      following: 0,
      caringSince: '0 years',
      updates: [],
      createdAt: new Date().toISOString()
    };
    
    caregivers.push(newCaregiver);
    saveData();
    
    res.status(201).json({ message: 'Caregiver profile created successfully', caregiver: newCaregiver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update caregiver profile
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const caregiverIndex = caregivers.findIndex(cg => cg.id === req.params.id);
    if (caregiverIndex === -1) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    
    const caregiver = caregivers[caregiverIndex];
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'rating' && key !== 'reviews') {
        caregiver[key] = req.body[key];
      }
    });
    
    caregivers[caregiverIndex] = caregiver;
    saveData();
    
    res.json({ message: 'Caregiver profile updated', caregiver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add update/post to caregiver profile
router.post('/:id/updates', authenticateToken, (req, res) => {
  try {
    const caregiver = caregivers.find(cg => cg.id === req.params.id);
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    
    const newUpdate = {
      id: `u${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      message: req.body.message
    };
    
    if (!caregiver.updates) {
      caregiver.updates = [];
    }
    
    caregiver.updates.unshift(newUpdate);
    saveData();
    
    res.status(201).json({ message: 'Update added', update: newUpdate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Contact caregiver (requires authentication)
router.post('/:id/contact', authenticateToken, (req, res) => {
  try {
    const caregiver = caregivers.find(cg => cg.id === req.params.id);
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    
    // In a real app, this would send an email or notification
    res.json({ 
      message: 'Contact request sent successfully',
      contact: {
        name: caregiver.name,
        phone: caregiver.phone,
        email: caregiver.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search nearby caregivers based on coordinates
router.get('/nearby/:lat/:lng', (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radius = req.query.radius || 5; // default 5km radius
    
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    
    // Calculate distance using Haversine formula
    const nearbyCaregivers = caregivers.map(cg => {
      const R = 6371; // Earth's radius in km
      const dLat = (cg.location.lat - userLat) * Math.PI / 180;
      const dLng = (cg.location.lng - userLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(cg.location.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return { ...cg, distance: distance.toFixed(2) };
    })
    .filter(cg => cg.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyCaregivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
