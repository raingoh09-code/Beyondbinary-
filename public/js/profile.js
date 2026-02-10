// Protect this page
requireAuth();

const user = getUserInfo();
let myEvents = [];
let createdEvents = [];
let myCommunities = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Display user info
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  
  // Display profile information
  displayProfileInfo();

  // Load all data
  await Promise.all([
    loadMyEvents(),
    loadCreatedEvents(),
    loadMyCommunities()
  ]);
  
  // Update stats after loading data
  updateStats();
});

// Display profile information
function displayProfileInfo() {
  document.getElementById('displayName').textContent = user.name || '-';
  document.getElementById('displayEmail').textContent = user.email || '-';
  document.getElementById('displayPhone').textContent = user.phone || 'Not set';
  document.getElementById('displayArea').textContent = user.area || 'Not set';
}

// Toggle edit profile mode
window.toggleEditProfile = function() {
  const displayDiv = document.getElementById('profileInfoDisplay');
  const editDiv = document.getElementById('profileInfoEdit');
  
  // Populate edit fields with current values
  document.getElementById('editName').value = user.name || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editArea').value = user.area || '';
  
  // Toggle visibility
  displayDiv.style.display = 'none';
  editDiv.style.display = 'grid';
};

// Cancel edit profile
window.cancelEditProfile = function() {
  const displayDiv = document.getElementById('profileInfoDisplay');
  const editDiv = document.getElementById('profileInfoEdit');
  
  displayDiv.style.display = 'grid';
  editDiv.style.display = 'none';
};

// Save profile changes
window.saveProfile = async function() {
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const area = document.getElementById('editArea').value.trim();
  
  if (!name) {
    alert('Name is required');
    return;
  }
  
  try {
    const updatedUser = await apiRequest(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, phone, area })
    });
    
    // Update local user object
    user.name = updatedUser.name;
    user.phone = updatedUser.phone;
    user.area = updatedUser.area;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update display
    displayProfileInfo();
    document.getElementById('profileName').textContent = user.name;
    
    // Hide edit form
    cancelEditProfile();
    
    alert('Profile updated successfully!');
  } catch (error) {
    alert('Error updating profile: ' + error.message);
  }
};

// Update stats display
function updateStats() {
  document.getElementById('statsEventsAttending').textContent = myEvents.length;
  document.getElementById('statsEventsCreated').textContent = createdEvents.length;
  document.getElementById('statsCommunities').textContent = myCommunities.length;
}

// Switch between tabs
window.switchTab = function(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
};

// Load events user is attending
async function loadMyEvents() {
  const container = document.getElementById('myEventsContainer');
  
  try {
    const allEvents = await apiRequest('/events');
    myEvents = allEvents.filter(e => e.attendees.includes(user.id));
    
    if (myEvents.length === 0) {
      container.innerHTML = '<p class="loading">You haven\'t RSVP\'d to any events yet. <a href="events.html" style="color: var(--primary-color);">Browse events</a></p>';
      return;
    }

    displayEvents(myEvents, container);
  } catch (error) {
    container.innerHTML = `<p class="loading">Error loading events: ${error.message}</p>`;
  }
}

// Load events user created
async function loadCreatedEvents() {
  const container = document.getElementById('createdEventsContainer');
  
  try {
    const allEvents = await apiRequest('/events');
    createdEvents = allEvents.filter(e => e.organizerId === user.id);
    
    if (createdEvents.length === 0) {
      container.innerHTML = '<p class="loading">You haven\'t created any events yet. <a href="create-event.html" style="color: var(--primary-color);">Create an event</a></p>';
      return;
    }

    displayEvents(createdEvents, container);
  } catch (error) {
    container.innerHTML = `<p class="loading">Error loading events: ${error.message}</p>`;
  }
}

// Load user's communities
async function loadMyCommunities() {
  const container = document.getElementById('myCommunitiesContainer');
  
  try {
    const allCommunities = await apiRequest('/communities');
    myCommunities = allCommunities.filter(c => c.members.includes(user.id));
    
    if (myCommunities.length === 0) {
      container.innerHTML = '<p class="loading">You haven\'t joined any communities yet. <a href="communities.html" style="color: var(--primary-color);">Explore communities</a></p>';
      return;
    }

    container.innerHTML = myCommunities.map(community => `
      <div class="community-card">
        <div class="community-name">${community.name}</div>
        <span class="community-category">${community.category}</span>
        <div class="community-description">${community.description}</div>
        <div class="community-footer">
          <span class="members-count">👥 ${community.members.length} members</span>
          ${community.organizerId === user.id ? 
            '<span style="color: var(--primary-color); font-weight: 600;">Organizer</span>' : 
            '<button class="btn btn-outline" onclick="leaveCommunity(\'${community.id}\')">Leave</button>'
          }
        </div>
        <div class="event-info-item" style="margin-top: 1rem">
          📍 ${community.location}
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p class="loading">Error loading communities: ${error.message}</p>`;
  }
}

// Display events
function displayEvents(events, container) {
  container.innerHTML = events.map(event => {
    const isExternal = event.externalUrl;
    return `
    <div class="event-card" onclick="${isExternal ? '' : 'viewEvent(\'' + event.id + '\')'}">
      <div class="event-header">
        <span class="event-category">${event.category}</span>
        <h3 class="event-title">${event.title}</h3>
      </div>
      <div class="event-body">
        <div class="event-info">
          <div class="event-info-item">
            📅 ${formatDate(event.date)}
          </div>
          <div class="event-info-item">
            🕐 ${event.time}
          </div>
          <div class="event-info-item">
            📍 ${event.location}
          </div>
        </div>
        <p class="event-description">${event.description}</p>
        <div class="event-footer">
          ${isExternal ? 
            `<a href="${event.externalUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">View Details →</a>` :
            `<span class="attendees-count">👥 ${event.attendees.length} ${event.maxAttendees ? '/ ' + event.maxAttendees : ''} attending</span>`
          }
          ${!isExternal && event.organizerId === user.id ? 
            '<span style="color: var(--primary-color); font-weight: 600;">Organizer</span>' : 
            '<button class="btn btn-outline" onclick="cancelRSVP(event, \'' + event.id + '\')">Cancel RSVP</button>'
          }
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function viewEvent(eventId) {
  console.log('View event:', eventId);
}

async function cancelRSVP(e, eventId) {
  e.stopPropagation();
  
  if (!confirm('Are you sure you want to cancel your RSVP?')) {
    return;
  }
  
  try {
    await apiRequest(`/events/${eventId}/rsvp`, {
      method: 'DELETE'
    });
    
    alert('RSVP cancelled successfully!');
    await loadMyEvents();
  } catch (error) {
    alert(error.message);
  }
}

async function leaveCommunity(communityId) {
  if (!confirm('Are you sure you want to leave this community?')) {
    return;
  }
  
  try {
    await apiRequest(`/communities/${communityId}/leave`, {
      method: 'POST'
    });
    
    alert('Left community successfully');
    await loadMyCommunities();
  } catch (error) {
    alert(error.message);
  }
}
