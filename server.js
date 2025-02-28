// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use(bodyParser.json()); // Parse JSON request body

// Routes
// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional: API endpoint to save event data on the server
app.post('/api/save-event', (req, res) => {
  try {
    const eventData = req.body;
    
    // Add timestamp
    eventData.createdAt = new Date().toISOString();
    
    // Create filename based on event name
    const filename = `event_${eventData.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    
    // Save file to 'events' directory
    const eventsDir = path.join(__dirname, 'events');
    
    // Create 'events' directory if it doesn't exist
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir);
    }
    
    // Write the file
    fs.writeFileSync(path.join(eventsDir, filename), JSON.stringify(eventData, null, 2));
    
    res.status(200).json({ 
      success: true, 
      message: 'Event saved successfully',
      filename: filename
    });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save event',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});