// Caregivers functionality
console.log('Caregivers.js loaded');
const API_URL = '/api';

// Load caregivers on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - starting caregiver load');
    loadCaregivers();
});

// Load all caregivers
async function loadCaregivers() {
    try {
        console.log('Loading caregivers...');
        showLoading();
        const response = await fetch(`${API_URL}/caregivers`);
        console.log('Response status:', response.status);
        console.log('Full response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const caregivers = await response.json();
        console.log('Caregivers loaded:', caregivers.length, caregivers);
        
        // Additional debug info
        const container = document.getElementById('caregiversContainer');
        console.log('Container found:', container);
        console.log('About to call displayCaregivers with:', caregivers);
        
        displayCaregivers(caregivers);
    } catch (error) {
        console.error('Error loading caregivers:', error);
        showError('Failed to load caregivers: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Search caregivers with filters
async function searchCaregivers() {
    try {
        showLoading();
        
        const area = document.getElementById('areaFilter').value.trim();
        const service = document.getElementById('serviceFilter').value;
        const minRating = document.getElementById('ratingFilter').value;
        
        let url = `${API_URL}/caregivers?`;
        const params = new URLSearchParams();
        
        if (area) params.append('area', area);
        if (service) params.append('service', service);
        if (minRating) params.append('minRating', minRating);
        
        const response = await fetch(`${url}${params.toString()}`);
        const caregivers = await response.json();
        
        displayCaregivers(caregivers);
    } catch (error) {
        console.error('Error searching caregivers:', error);
        showError('Failed to search caregivers');
    } finally {
        hideLoading();
    }
}

// Display caregivers
function displayCaregivers(caregivers) {
    console.log('displayCaregivers called with:', caregivers ? caregivers.length : 0, 'caregivers');
    
    const container = document.getElementById('caregiversContainer');
    if (!container) {
        console.error('caregiversContainer not found!');
        return;
    }
    
    if (!caregivers || caregivers.length === 0) {
        console.log('No caregivers to display');
        container.innerHTML = `
            <div class="no-results">
                <h3>No caregivers found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    console.log('Building HTML for', caregivers.length, 'caregivers');
    
    let html = '';
    
    caregivers.forEach((caregiver, index) => {
        console.log('Processing caregiver', index, ':', caregiver.name);
        
        // Build services tags safely
        let servicesHtml = '';
        if (caregiver.services && Array.isArray(caregiver.services)) {
            const displayServices = caregiver.services.slice(0, 3);
            servicesHtml = displayServices.map(service => 
                `<span class="service-tag">${service}</span>`
            ).join('');
            
            if (caregiver.services.length > 3) {
                servicesHtml += `<span class="service-tag">+${caregiver.services.length - 3} more</span>`;
            }
        }
        
        // Build the card HTML
        html += `
            <div class="caregiver-card" onclick="viewCaregiver('${caregiver.id}')">
                <div class="caregiver-header">
                    <div class="caregiver-avatar">${getInitials(caregiver.name)}</div>
                    <div class="caregiver-info">
                        <h3>
                            ${caregiver.name}
                            ${caregiver.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                        </h3>
                        <div class="caregiver-rating">
                            <span class="star">★</span>
                            <span>${caregiver.rating ? caregiver.rating.toFixed(1) : '0.0'}</span>
                            <span>(${caregiver.reviews || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                
                <p class="caregiver-bio">${caregiver.bio || ''}</p>
                
                <div class="services-tags">
                    ${servicesHtml}
                </div>
                
                <div class="caregiver-details">
                    <div>
                        <div class="rate">$${caregiver.hourlyRate || 0}/hr</div>
                        <div class="location">📍 ${caregiver.location && caregiver.location.area ? caregiver.location.area : 'Unknown'}</div>
                    </div>
                    ${caregiver.distance ? `<span class="distance">${caregiver.distance} km away</span>` : ''}
                </div>
                
                <button class="btn-contact" onclick="event.stopPropagation(); contactCaregiver('${caregiver.id}')">
                    Contact Now
                </button>
            </div>
        `;
    });
    
    console.log('Setting innerHTML with HTML length:', html.length);
    container.innerHTML = html;
    console.log('Caregivers displayed successfully');
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

// View caregiver profile
function viewCaregiver(caregiverId) {
    window.location.href = `caregiver-profile.html?id=${caregiverId}`;
}

// Contact caregiver
async function contactCaregiver(caregiverId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to contact caregivers');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch(`${API_URL}/caregivers/${caregiverId}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Contact information:\n\nName: ${data.contact.name}\nEmail: ${data.contact.email}\nPhone: ${data.contact.phone}`);
        } else {
            alert(data.message || 'Failed to get contact information');
        }
    } catch (error) {
        console.error('Error contacting caregiver:', error);
        alert('Failed to contact caregiver');
    }
}

// Show loading spinner
function showLoading() {
    console.log('showLoading called');
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('caregiversContainer');
    
    if (spinner) {
        spinner.style.display = 'block';
        console.log('Spinner shown');
    } else {
        console.error('loadingSpinner element not found');
    }
    
    if (container) {
        container.style.display = 'none';
        console.log('Container hidden');
    } else {
        console.error('caregiversContainer element not found');
    }
}

// Hide loading spinner
function hideLoading() {
    console.log('hideLoading called');
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('caregiversContainer');
    
    if (spinner) {
        spinner.style.display = 'none';
        console.log('Spinner hidden');
    } else {
        console.error('loadingSpinner element not found');
    }
    
    if (container) {
        container.style.display = 'grid';
        container.style.visibility = 'visible';
        console.log('Container shown');
    } else {
        console.error('caregiversContainer element not found');
    }
}

// Show error message
function showError(message) {
    console.error('showError called:', message);
    const container = document.getElementById('caregiversContainer');
    container.innerHTML = `
        <div class="no-results">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Search nearby caregivers (if geolocation is available)
function searchNearby() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                showLoading();
                const { latitude, longitude } = position.coords;
                const response = await fetch(`${API_URL}/caregivers/nearby/${latitude}/${longitude}`);
                const caregivers = await response.json();
                displayCaregivers(caregivers);
            } catch (error) {
                console.error('Error finding nearby caregivers:', error);
                showError('Failed to find nearby caregivers');
            } finally {
                hideLoading();
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please search by area instead.');
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}
