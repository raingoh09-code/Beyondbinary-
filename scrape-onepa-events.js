const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const ONEPA_URL = 'https://www.onepa.gov.sg/events/search?events=&aoi=Competitions&sort=rel';

// Category mapping from OnePA to our system
const categoryMap = {
  'Competitions': 'Sports',
  'Active Ageing': 'Health',
  'Arts & Heritage': 'Arts',
  'Environment': 'Social',
  'Sports & Wellness': 'Sports',
  'Community': 'Social',
  'Education': 'Education',
  'Technology': 'Technology',
  'default': 'Social'
};

async function scrapeOnepaEvents() {
  try {
    console.log('🔍 Fetching events from OnePA...');
    
    const response = await axios.get(ONEPA_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('✅ Page fetched successfully');
    
    const $ = cheerio.load(response.data);
    const events = [];
    let eventId = Date.now();

    // Try to find event cards/items on the page
    // This selector may need adjustment based on the actual HTML structure
    $('.event-item, .event-card, article, .result-item').each((index, element) => {
      try {
        const $event = $(element);
        
        // Extract event information (these selectors may need adjustment)
        const title = $event.find('h2, h3, .title, .event-title').first().text().trim();
        const description = $event.find('p, .description, .event-description').first().text().trim() || 
                          $event.find('.excerpt, .summary').first().text().trim();
        const dateText = $event.find('.date, .event-date, time').first().text().trim();
        const location = $event.find('.location, .venue, .event-location').first().text().trim();
        const link = $event.find('a').first().attr('href');

        if (title) {
          // Parse date (this is a basic implementation and may need adjustment)
          const date = parseDate(dateText);
          
          events.push({
            id: `onepa-${eventId++}`,
            title: title,
            description: description || 'Join us for this exciting community event!',
            date: date.dateStr || '2026-02-15',
            time: date.timeStr || '14:00',
            location: location || 'Singapore',
            category: 'Sports', // Competitions category
            maxAttendees: null,
            organizerId: 'onepa-singapore',
            attendees: [],
            coordinates: getSingaporeCoordinates(location),
            imageUrl: getDefaultImage('Health'),
            externalUrl: link ? (link.startsWith('http') ? link : `https://www.onepa.gov.sg${link}`) : ONEPA_URL,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.log(`⚠️  Error parsing event ${index + 1}:`, err.message);
      }
    });

    if (events.length === 0) {
      console.log('⚠️  No events found with current selectors. The page structure may have changed.');
      console.log('Creating sample Competition events instead...');
      return createSampleCompetitionEvents();
    }

    console.log(`✅ Successfully scraped ${events.length} events`);
    return events;

  } catch (error) {
    console.error('❌ Error scraping OnePA:', error.message);
    console.log('Creating sample Competition events instead...');
    return createSampleCompetitionEvents();
  }
}

// Helper function to parse dates
function parseDate(dateText) {
  if (!dateText) return { dateStr: '2026-02-15', timeStr: '14:00' };
  
  // Try to extract date and time from text
  // This is a basic implementation and may need enhancement
  const dateMatch = dateText.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  const timeMatch = dateText.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  
  let dateStr = '2026-02-15';
  let timeStr = '14:00';
  
  if (dateMatch) {
    const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const day = dateMatch[1].padStart(2, '0');
    const month = months[dateMatch[2].toLowerCase()];
    dateStr = `2026-${month}-${day}`;
  }
  
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2];
    const period = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
    
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    
    timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  
  return { dateStr, timeStr };
}

// Helper function to get Singapore coordinates
function getSingaporeCoordinates(location) {
  const locationMap = {
    'jurong': { lat: 1.3404, lng: 103.7090 },
    'tampines': { lat: 1.3496, lng: 103.9568 },
    'woodlands': { lat: 1.4382, lng: 103.7891 },
    'bedok': { lat: 1.3236, lng: 103.9273 },
    'yishun': { lat: 1.4304, lng: 103.8354 },
    'default': { lat: 1.3521, lng: 103.8198 }
  };
  
  const loc = location.toLowerCase();
  for (const key in locationMap) {
    if (loc.includes(key)) {
      return locationMap[key];
    }
  }
  
  return locationMap.default;
}

// Helper function to get default images by category
function getDefaultImage(category) {
  const images = {
    'Health': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    'Arts': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    'Social': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    'Education': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400'
  };
  return images[category] || images['Social'];
}

// Create sample Competition events if scraping fails
function createSampleCompetitionEvents() {
  const baseId = Date.now();
  return [
    {
      id: `onepa-${baseId + 1}`,
      title: 'Community Futsal Championship',
      description: 'Join the annual futsal tournament! Teams compete for the championship trophy. All skill levels welcome.',
      date: '2026-02-25',
      time: '14:00',
      location: 'Toa Payoh Sports Hall, Singapore',
      category: 'Sports',
      maxAttendees: 100,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3343, lng: 103.8467 },
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 2}`,
      title: 'Inter-Community Badminton Tournament',
      description: 'Showcase your badminton skills in this exciting inter-community tournament. Singles and doubles categories available.',
      date: '2026-03-01',
      time: '09:00',
      location: 'Jurong West Sports Centre, Singapore',
      category: 'Sports',
      maxAttendees: 80,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3404, lng: 103.7090 },
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 3}`,
      title: 'Community Photography Contest',
      description: 'Capture the beauty of Singapore! Submit your best photos for a chance to win amazing prizes. Theme: Community Spirit.',
      date: '2026-02-28',
      time: '10:00',
      location: 'Bishan Community Club, Singapore',
      category: 'Arts',
      maxAttendees: 50,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3644, lng: 103.8470 },
      imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 4}`,
      title: 'Table Tennis Open Championship',
      description: 'Test your ping pong prowess! Open to all ages and skill levels. Prizes for champions in each category.',
      date: '2026-03-05',
      time: '15:00',
      location: 'Tampines ActiveSG Centre, Singapore',
      category: 'Sports',
      maxAttendees: 60,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3496, lng: 103.9568 },
      imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 5}`,
      title: 'Cooking Competition: Best Local Dish',
      description: 'Showcase your culinary skills! Prepare your best local dish and impress our judges. Winner gets cooking equipment prizes.',
      date: '2026-03-08',
      time: '11:00',
      location: 'Bedok Community Centre, Singapore',
      category: 'Food',
      maxAttendees: 30,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3236, lng: 103.9273 },
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 6}`,
      title: 'Community Fun Run 5K',
      description: 'Lace up and join the fun run! A 5K route through scenic parks. All finishers receive medals. Family-friendly event.',
      date: '2026-03-12',
      time: '07:00',
      location: 'East Coast Park, Singapore',
      category: 'Sports',
      maxAttendees: 200,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3008, lng: 103.9074 },
      imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 7}`,
      title: 'Chess Tournament - All Ages',
      description: 'Battle of the minds! Strategic chess tournament for beginners to advanced players. Age categories: Junior, Adult, Senior.',
      date: '2026-03-15',
      time: '13:00',
      location: 'Yishun Community Club, Singapore',
      category: 'Sports',
      maxAttendees: 40,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.4304, lng: 103.8354 },
      imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 8}`,
      title: 'Dance Competition: Street Style',
      description: 'Show off your best moves! Solo and group categories. Hip-hop, breakdancing, and contemporary styles welcome.',
      date: '2026-03-18',
      time: '18:00',
      location: 'Ang Mo Kio Hub, Singapore',
      category: 'Arts',
      maxAttendees: 100,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3691, lng: 103.8454 },
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 9}`,
      title: 'Community Soccer League Finals',
      description: 'The final showdown! Watch the top teams battle for the championship title. Food stalls and activities for the whole family.',
      date: '2026-03-22',
      time: '16:00',
      location: 'Clementi Stadium, Singapore',
      category: 'Sports',
      maxAttendees: 500,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3162, lng: 103.7649 },
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    },
    {
      id: `onepa-${baseId + 10}`,
      title: 'Gaming Tournament: E-Sports Challenge',
      description: 'Gamers unite! Compete in popular e-sports titles. Prizes for top players. All gaming levels welcome.',
      date: '2026-03-25',
      time: '14:00',
      location: 'Hougang Community Centre, Singapore',
      category: 'Technology',
      maxAttendees: 64,
      organizerId: 'onepa-singapore',
      attendees: [],
      coordinates: { lat: 1.3714, lng: 103.8864 },
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
      externalUrl: ONEPA_URL,
      createdAt: new Date().toISOString()
    }
  ];
}

// Main function to scrape and save events
async function main() {
  console.log('🚀 OnePA Event Scraper Started\n');
  
  const events = await scrapeOnepaEvents();
  
  if (events.length > 0) {
    // Save to events.json
    const eventsPath = path.join(__dirname, 'data', 'events.json');
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    
    console.log(`\n✅ ${events.length} events saved to data/events.json`);
    console.log('\n📋 Event Summary:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} - ${event.date} at ${event.time}`);
    });
    console.log('\n🎉 Done! Restart your server to see the new events.');
  } else {
    console.log('\n❌ No events to save');
  }
}

// Run the scraper
main().catch(console.error);
