const express = require('express');
const router = express.Router();
const { events } = require('../data/database');

// Chatbot conversation endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await processMessage(message.toLowerCase());
        
        res.json({
            message: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Process user message and generate response
async function processMessage(message) {
    // Greeting patterns
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(message)) {
        return "Hello! 👋 I'm your FAM assistant. I can help you find events, activities, and answer questions about our community platform. What would you like to know?";
    }

    // Help/what can you do
    if (/what can you do|help|how to use|capabilities/.test(message)) {
        return "I can help you with:\n• Finding upcoming events and activities\n• Searching events by category (Health, Education, Social, Technology)\n• Getting event details and locations\n• Learning about our community features\n• Finding caregivers and support services\n\nJust ask me anything!";
    }

    // Events queries
    if (/events?|activities?|what('s| is) (happening|available|on)|things to do/.test(message)) {
        return await getEventsResponse(message);
    }

    // Category-specific queries
    if (/health|fitness|wellness|exercise|yoga/.test(message)) {
        return await getCategoryEvents('Health');
    }

    if (/education|learning|class|course|workshop|skill/.test(message)) {
        return await getCategoryEvents('Education');
    }

    if (/social|community|gathering|meetup|networking/.test(message)) {
        return await getCategoryEvents('Social');
    }

    if (/tech|technology|digital|computer|coding/.test(message)) {
        return await getCategoryEvents('Technology');
    }

    // Location-based queries
    if (/near me|nearby|around|location|where/.test(message)) {
        return "I can help you find events near you! The events page allows you to search by location. Would you like me to show you upcoming events in your area? You can also visit our Events page to browse by location.";
    }

    // Caregiver queries
    if (/caregiver|babysit|elderly care|care service/.test(message)) {
        return "We have a Caregivers section where you can find verified caregivers offering services like babysitting, elderly care, and more. They're rated by our community and you can contact them directly. Would you like to browse available caregivers?";
    }

    // Community queries
    if (/community|communities|group|join/.test(message)) {
        return "You can join various communities on our platform! We have communities for different interests and neighborhoods. Visit the Communities page to explore and join groups that interest you.";
    }

    // Registration/account queries
    if (/register|sign up|create account|join platform/.test(message)) {
        return "To join our community, click on 'Sign Up' in the navigation menu. Registration is quick and free! Once registered, you can create events, join communities, and connect with caregivers.";
    }

    // Thank you
    if (/thank|thanks|appreciate/.test(message)) {
        return "You're welcome! 😊 Is there anything else I can help you with?";
    }

    // Goodbye
    if (/bye|goodbye|see you|exit/.test(message)) {
        return "Goodbye! Feel free to chat with me anytime you need help. Have a great day! 👋";
    }

    // Default response with suggestions
    return "I'm not sure I understand that question. Here are some things you can ask me:\n• 'What events are available?'\n• 'Show me health activities'\n• 'How do I find caregivers?'\n• 'What communities can I join?'\n\nWhat would you like to know?";
}

// Get events response based on query
async function getEventsResponse(message) {
    const now = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (upcomingEvents.length === 0) {
        return "I don't see any upcoming events at the moment. Please check back later or create your own event!";
    }

    let response = `Here are some upcoming events:\n\n`;
    
    upcomingEvents.forEach((event, index) => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        response += `${index + 1}. **${event.title}**\n`;
        response += `   📅 ${formattedDate} at ${event.time}\n`;
        response += `   📍 ${event.location}\n`;
        response += `   🏷️ ${event.category}\n`;
        if (event.price > 0) {
            response += `   💰 $${event.price}\n`;
        } else {
            response += `   💰 Free\n`;
        }
        response += `\n`;
    });

    response += `Visit the Events page to see more details and register!`;
    
    return response;
}

// Get events by category
async function getCategoryEvents(category) {
    const now = new Date();
    const categoryEvents = events
        .filter(event => 
            event.category === category && 
            new Date(event.date) >= now
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (categoryEvents.length === 0) {
        return `I don't see any upcoming ${category} events right now. Check out other categories or create your own ${category} event!`;
    }

    let response = `Here are upcoming ${category} events:\n\n`;
    
    categoryEvents.forEach((event, index) => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        response += `${index + 1}. **${event.title}**\n`;
        response += `   📅 ${formattedDate} at ${event.time}\n`;
        response += `   📍 ${event.location}\n`;
        if (event.price > 0) {
            response += `   💰 $${event.price}\n`;
        }
        response += `\n`;
    });

    response += `Check the Events page for more ${category} activities!`;
    
    return response;
}

module.exports = router;
