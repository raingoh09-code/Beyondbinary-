// Caregiver profile functionality
const API_URL = '/api';
let currentCaregiver = null;

// Load caregiver profile on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const caregiverId = urlParams.get('id');
    
    if (caregiverId) {
        loadCaregiverProfile(caregiverId);
    } else {
        alert('No caregiver ID provided');
        window.location.href = 'nearby-caregivers.html';
    }
});

// Load caregiver profile
async function loadCaregiverProfile(caregiverId) {
    try {
        const response = await fetch(`${API_URL}/caregivers/${caregiverId}`);
        
        if (!response.ok) {
            throw new Error('Caregiver not found');
        }
        
        const caregiver = await response.json();
        currentCaregiver = caregiver;
        displayCaregiverProfile(caregiver);
    } catch (error) {
        console.error('Error loading caregiver profile:', error);
        alert('Failed to load caregiver profile');
        window.location.href = 'nearby-caregivers.html';
    }
}

// Display caregiver profile
function displayCaregiverProfile(caregiver) {
    // Avatar
    document.getElementById('avatarLarge').textContent = getInitials(caregiver.name);
    
    // Basic info
    document.getElementById('caregiverName').textContent = caregiver.name;
    document.getElementById('caregiverBio').textContent = caregiver.bio;
    
    // Verified badge
    if (caregiver.verified) {
        document.getElementById('verifiedBadge').style.display = 'inline-block';
    }
    
    // Stats
    document.getElementById('followers').textContent = caregiver.followers || 0;
    document.getElementById('following').textContent = caregiver.following || 0;
    document.getElementById('experience').textContent = caregiver.caringSince || caregiver.experience;
    
    // Rating
    document.getElementById('ratingValue').textContent = caregiver.rating.toFixed(1);
    document.getElementById('reviewsCount').textContent = `${caregiver.reviews} reviews`;
    displayStars(caregiver.rating);
    
    // Services
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = caregiver.services.map(service => 
        `<span class="service-badge">${service}</span>`
    ).join('');
    
    // Details
    document.getElementById('hourlyRate').textContent = `$${caregiver.hourlyRate}/hour`;
    document.getElementById('availability').textContent = caregiver.availability;
    document.getElementById('location').textContent = caregiver.location.area;
    document.getElementById('experienceDetail').textContent = caregiver.experience;
    
    // Certifications
    const certificationsList = document.getElementById('certificationsList');
    if (caregiver.certifications && caregiver.certifications.length > 0) {
        certificationsList.innerHTML = caregiver.certifications.map(cert => 
            `<li>✓ ${cert}</li>`
        ).join('');
    } else {
        certificationsList.innerHTML = '<li>No certifications listed</li>';
    }
    
    // Updates
    displayUpdates(caregiver.updates || []);
    
    // Contact info (for modal)
    document.getElementById('contactEmail').textContent = caregiver.email;
    document.getElementById('contactPhone').textContent = caregiver.phone;
}

// Display star rating
function displayStars(rating) {
    const starsDisplay = document.getElementById('starsDisplay');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    
    if (hasHalfStar) {
        starsHTML += '☆';
    }
    
    while (starsHTML.length < 5) {
        starsHTML += '☆';
    }
    
    starsDisplay.textContent = starsHTML;
}

// Display updates
function displayUpdates(updates) {
    const container = document.getElementById('updatesContainer');
    
    if (!updates || updates.length === 0) {
        container.innerHTML = '<p style="color: #666;">No recent updates</p>';
        return;
    }
    
    container.innerHTML = updates.map(update => `
        <div class="update-card">
            <div class="update-date">${formatDate(update.date)}</div>
            <div class="update-message">${update.message}</div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Show contact modal
function showContactModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to contact caregivers');
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('contactModal').classList.add('show');
}

// Close contact modal
function closeContactModal() {
    document.getElementById('contactModal').classList.remove('show');
}

// Follow caregiver
async function followCaregiver() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to follow caregivers');
        window.location.href = 'login.html';
        return;
    }
    
    // In a real app, this would make an API call to follow the caregiver
    alert('Following feature coming soon! You will be notified of their updates.');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeContactModal();
    }
}
