// community-events.js
let ce_allEvents = [];
let ce_userLocation = null;

function ce_getUserInfo() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

async function ce_loadEvents() {
  const container = document.getElementById('eventsList');
  try {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error('Failed to fetch events');
    ce_allEvents = await res.json();
    displayCommunityEvents(ce_allEvents);
  } catch (err) {
    container.innerHTML = `<p class="loading">Error loading events: ${err.message}</p>`;
  }
}

function formatDateShort(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Haversine distance in km
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const sinDLat = Math.sin(dLat/2);
  const sinDLon = Math.sin(dLon/2);
  const aa = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1)*Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c;
}

function displayCommunityEvents(events) {
  const list = document.getElementById('eventsList');
  if (!events || events.length === 0) {
    list.innerHTML = '<p class="loading">No events found</p>';
    return;
  }

  const html = events.map(e => {
    const distanceText = e.distance ? `<div class="event-meta">${e.distance} km away</div>` : '';
    return `
      <div class="event-card">
        <div class="event-header">
          <span class="event-category">${e.category || ''}</span>
          <h3 class="event-title">${e.title}</h3>
        </div>
        <div class="event-body">
          <div class="event-info">
            <div class="event-info-item">${formatDateShort(e.date)}</div>
            <div class="event-info-item">${e.time || ''}</div>
            <div class="event-info-item">${e.location || ''}</div>
          </div>
          <p class="event-description">${(e.description || '').substring(0, 160)}${(e.description || '').length>160? '...':''}</p>
          ${distanceText}
          <div style="display:flex; gap:8px; margin-top:8px;">
            ${e.externalUrl ? `<a class="btn btn-outline" href="${e.externalUrl}" target="_blank">Register</a>` : `<button class="btn" onclick="window.location.href='events.html'">View</button>`}
            <button class="btn btn-outline" onclick="navigator.clipboard.writeText(window.location.origin + '/events.html')">Share</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = html;
}

function ce_filterAndRender() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;

  let filtered = ce_allEvents.slice();
  if (category) filtered = filtered.filter(e => e.category === category);
  if (search) filtered = filtered.filter(e => (e.title || '').toLowerCase().includes(search) || (e.description||'').toLowerCase().includes(search));

  const today = new Date(); today.setHours(0,0,0,0);
  if (dateFilter !== 'all') {
    filtered = filtered.filter(e => {
      const ed = new Date(e.date); ed.setHours(0,0,0,0);
      if (dateFilter === 'today') return ed.getTime() === today.getTime();
      if (dateFilter === 'this-week') { const w = new Date(today); w.setDate(w.getDate()+7); return ed>=today && ed<=w; }
      if (dateFilter === 'this-month') return ed.getMonth() === today.getMonth() && ed.getFullYear() === today.getFullYear();
      return true;
    });
  }

  // If user location known, compute distances
  if (ce_userLocation) {
    filtered.forEach(e => {
      if (e.coordinates) {
        e.distance = Math.round(distanceKm(ce_userLocation, {lat: e.coordinates.lat, lng: e.coordinates.lng}));
      } else {
        e.distance = null;
      }
    });
    filtered.sort((a,b) => (a.distance||Infinity) - (b.distance||Infinity));
  }

  displayCommunityEvents(filtered);
}

async function ce_tryNearMe() {
  if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition((pos) => {
    ce_userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    ce_filterAndRender();
  }, (err) => { alert('Location denied or unavailable'); });
}

document.addEventListener('DOMContentLoaded', () => {
  ce_loadEvents();

  document.getElementById('searchInput').addEventListener('input', ce_filterAndRender);
  document.getElementById('categoryFilter').addEventListener('change', ce_filterAndRender);
  document.getElementById('dateFilter').addEventListener('change', ce_filterAndRender);
  document.getElementById('nearMeBtn').addEventListener('click', ce_tryNearMe);
  document.getElementById('refreshBtn').addEventListener('click', () => { ce_loadEvents(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
      const s = document.getElementById('searchInput');
      if (s) { e.preventDefault(); s.focus(); }
    } else if (e.key === 'n') {
      ce_tryNearMe();
    } else if (e.key === 'r') {
      ce_loadEvents();
    }
  });
});

// expose for debugging
window.ce_loadEvents = ce_loadEvents;
