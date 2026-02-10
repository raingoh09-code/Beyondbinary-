// Seed Singapore events from Visit Singapore
const fs = require('fs');
const path = require('path');

// Get dates
const today = new Date();
const getDate = (daysFromNow) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Singapore events based on Visit Singapore
const singaporeEvents = [
  {
    id: 'sg-' + Date.now() + '-1',
    title: 'Singapore Night Festival',
    description: 'Experience the magic of Singapore\'s arts and culture district transformed with stunning light installations, performances, and interactive art displays.',
    date: getDate(5),
    time: '19:00',
    location: 'Bras Basah.Bugis Precinct, Singapore',
    category: 'Arts',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2970, lng: 103.8522 },
    externalUrl: 'https://www.visitsingapore.com/festivals-events-singapore/annual-highlights/singapore-night-festival/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-2',
    title: 'Gardens by the Bay Light Show',
    description: 'Marvel at the spectacular Garden Rhapsody light and music show at the iconic Supertree Grove. A mesmerizing display of lights synchronized to music.',
    date: getDate(0),
    time: '19:45',
    location: 'Gardens by the Bay, Singapore',
    category: 'Arts',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2816, lng: 103.8636 },
    externalUrl: 'https://www.visitsingapore.com/see-do-singapore/recreation-leisure/viewpoints/gardens-by-the-bay/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-3',
    title: 'Singapore Food Festival',
    description: 'Celebrate Singapore\'s diverse culinary heritage with local dishes, innovative fusion cuisine, and food tours across the island.',
    date: getDate(7),
    time: '11:00',
    location: 'Various Locations, Singapore',
    category: 'Food',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.3521, lng: 103.8198 },
    externalUrl: 'https://www.visitsingapore.com/festivals-events-singapore/annual-highlights/singapore-food-festival/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-4',
    title: 'Marina Bay Sands SkyPark Tour',
    description: 'Experience breathtaking 360-degree views of Singapore from the iconic SkyPark Observation Deck, 57 levels above the city.',
    date: getDate(1),
    time: '10:00',
    location: 'Marina Bay Sands, Singapore',
    category: 'Social',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2834, lng: 103.8607 },
    externalUrl: 'https://www.visitsingapore.com/see-do-singapore/architecture/modern/marina-bay-sands/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-5',
    title: 'Singapore Grand Prix',
    description: 'The world\'s first night Formula 1 race! Experience the thrill of high-speed racing under the lights on Singapore\'s street circuit.',
    date: getDate(30),
    time: '20:00',
    location: 'Marina Bay Street Circuit, Singapore',
    category: 'Sports',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2915, lng: 103.8641 },
    externalUrl: 'https://www.visitsingapore.com/festivals-events-singapore/annual-highlights/formula-1-singapore-grand-prix/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-6',
    title: 'Sentosa Beach Yoga Session',
    description: 'Start your day with peaceful yoga by the beach. All levels welcome. Mats provided. Enjoy the sunrise and ocean breeze.',
    date: getDate(2),
    time: '07:00',
    location: 'Siloso Beach, Sentosa, Singapore',
    category: 'Health',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2494, lng: 103.8198 },
    externalUrl: 'https://www.visitsingapore.com/see-do-singapore/recreation-leisure/beaches/siloso-beach/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-7',
    title: 'Singapore Art Week',
    description: 'Asia\'s premier art event featuring art fairs, gallery shows, and public installations across the island.',
    date: getDate(14),
    time: '10:00',
    location: 'Various Art Galleries, Singapore',
    category: 'Arts',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2970, lng: 103.8522 },
    externalUrl: 'https://www.visitsingapore.com/festivals-events-singapore/annual-highlights/singapore-art-week/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-8',
    title: 'Hawker Centre Food Tour',
    description: 'Discover Singapore\'s authentic street food culture. Taste iconic dishes like Hainanese Chicken Rice, Laksa, and Char Kway Teow.',
    date: getDate(3),
    time: '18:00',
    location: 'Maxwell Food Centre & Chinatown, Singapore',
    category: 'Food',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2806, lng: 103.8447 },
    externalUrl: 'https://www.visitsingapore.com/dining-drinks-singapore/local-dishes/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-9',
    title: 'Singapore River Cruise',
    description: 'Cruise along the historic Singapore River and learn about the city\'s transformation from fishing village to global metropolis.',
    date: getDate(4),
    time: '15:00',
    location: 'Clarke Quay, Singapore',
    category: 'Social',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2901, lng: 103.8467 },
    externalUrl: 'https://www.visitsingapore.com/see-do-singapore/recreation-leisure/cruises/singapore-river-cruise/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-10',
    title: 'Singapore Tech Conference',
    description: 'Connect with tech leaders, innovators, and startups. Explore the latest in AI, fintech, and digital transformation.',
    date: getDate(20),
    time: '09:00',
    location: 'Suntec Singapore Convention Centre',
    category: 'Technology',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2945, lng: 103.8582 },
    externalUrl: 'https://www.visitsingapore.com/mice/en/plan/why-singapore/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-11',
    title: 'Universal Studios Singapore',
    description: 'Experience thrilling rides, shows, and attractions based on your favorite movies and TV shows at Southeast Asia\'s only Universal Studios park.',
    date: getDate(6),
    time: '10:00',
    location: 'Resorts World Sentosa, Singapore',
    category: 'Social',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2540, lng: 103.8239 },
    externalUrl: 'https://www.visitsingapore.com/see-do-singapore/recreation-leisure/theme-parks/universal-studios-singapore/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sg-' + Date.now() + '-12',
    title: 'Singapore Marathon',
    description: 'Join thousands of runners in Singapore\'s premier running event. Categories for all levels from fun run to full marathon.',
    date: getDate(45),
    time: '05:30',
    location: 'Marina Bay, Singapore',
    category: 'Sports',
    maxAttendees: null,
    organizerId: 'visit-singapore',
    attendees: [],
    coordinates: { lat: 1.2826, lng: 103.8563 },
    externalUrl: 'https://www.visitsingapore.com/festivals-events-singapore/annual-highlights/standard-chartered-singapore-marathon/',
    createdAt: new Date().toISOString()
  }
];

// Read existing events
const eventsFile = path.join(__dirname, 'data', 'events.json');
let existingEvents = [];

try {
  if (fs.existsSync(eventsFile)) {
    existingEvents = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
  }
} catch (error) {
  console.log('No existing events file, creating new one');
}

// Remove old Singapore events (to avoid duplicates when re-running)
existingEvents = existingEvents.filter(e => !e.id.startsWith('sg-'));

// Add new Singapore events
const allEvents = [...existingEvents, ...singaporeEvents];

// Write to file
fs.writeFileSync(eventsFile, JSON.stringify(allEvents, null, 2));

console.log(`\n🇸🇬 ✅ Added ${singaporeEvents.length} Singapore events from Visit Singapore!\n`);
console.log('Categories:');
console.log(`  🎨 Arts & Culture: ${singaporeEvents.filter(e => e.category === 'Arts').length} events`);
console.log(`  🍜 Food & Dining: ${singaporeEvents.filter(e => e.category === 'Food').length} events`);
console.log(`  ⚽ Sports: ${singaporeEvents.filter(e => e.category === 'Sports').length} events`);
console.log(`  💻 Technology: ${singaporeEvents.filter(e => e.category === 'Technology').length} events`);
console.log(`  🌟 Social: ${singaporeEvents.filter(e => e.category === 'Social').length} events`);
console.log(`  💪 Health: ${singaporeEvents.filter(e => e.category === 'Health').length} events`);
console.log(`\n📅 Happening:`);
console.log(`  Today: ${singaporeEvents.filter(e => e.date === getDate(0)).length} events`);
console.log(`  This week: ${singaporeEvents.filter(e => {
    const eventDate = new Date(e.date);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return eventDate <= weekFromNow;
  }).length} events`);
console.log(`\n🌏 All events link to Visit Singapore for more details and booking!`);
console.log('\n✨ Visit your profile at http://localhost:3000/profile.html to see "My Events"\n');
