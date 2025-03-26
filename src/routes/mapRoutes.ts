/**
 * Maps Routes
 * 
 * This module defines API routes related to geographical and location-based functionality.
 * It maps HTTP endpoints to their corresponding controller methods.
 * 
 * Available Routes:
 * - GET /: Serves the map interface HTML page
 * - GET /nearby-churches: Retrieves churches near a specified location
 * 
 * These routes are mounted under the /api/maps base path in the main application,
 * resulting in complete paths like: /api/maps/nearby-churches
 * 
 * Implementation Details:
 * - Uses Express Router for route definitions
 * - Routes are modular and can be mounted at any base path
 * - Each route is connected to a specific controller method
 * - Controller separation ensures proper separation of concerns
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { MapsController } from '../controllers/mapsController';
import { env } from '../config/env';  // Import validated env

const router = express.Router();

/**
 * API Route: Serve Maps Interface
 * 
 * Endpoint: GET /api/maps
 * 
 * Serves the HTML interface for the maps functionality with Google Maps integration.
 * Dynamically injects the Google Maps API key from validated environment variables.
 */
router.get('/', (req, res) => {
    try {
      // Embed HTML directly instead of importing
      const htmlContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nearby Churches | InteGreat</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h2 { color: #333; text-align: center; }
          #map { width: 100%; height: 500px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .loading { text-align: center; margin-top: 20px; font-style: italic; color: #666; }
      </style>
      <script>
          function getUserLocation() {
              return new Promise((resolve, reject) => {
                  if ("geolocation" in navigator) {
                      navigator.geolocation.getCurrentPosition(
                          (position) => { resolve({ lat: position.coords.latitude, lng: position.coords.longitude }); },
                          (error) => { reject(new Error(\`Geolocation error: \${error.message}\`)); },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                      );
                  } else { reject(new Error("Geolocation is not supported by this browser.")); }
              });
          }
  
          async function initMap() {
              try {
                  document.getElementById('loading').style.display = 'block';
                  const { lat, lng } = await getUserLocation();
                  const userLocation = { lat, lng };
                  const map = new google.maps.Map(document.getElementById('map'), {
                      center: userLocation, zoom: 14
                  });
                  new google.maps.Marker({ 
                      position: userLocation, map, 
                      title: "You are here",
                      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                  });
                  const infoWindow = new google.maps.InfoWindow();
                  fetch(\`\${window.location.pathname.includes('/dev') ? '/dev' : ''}/api/maps/nearby-churches?lat=\${lat}&lng=\${lng}\`)
                      .then(response => {
                          if (!response.ok) throw new Error('Network response was not ok');
                          return response.json();
                      })
                      .then(data => {
                          document.getElementById('loading').style.display = 'none';
                          data.churches.forEach(church => {
                              const marker = new google.maps.Marker({
                                  position: church.location, map, title: church.name
                              });
                              marker.addListener("click", () => {
                                  infoWindow.setContent(\`<div><h3>\${church.name}</h3><p>\${church.address}</p></div>\`);
                                  infoWindow.open(map, marker);
                              });
                          });
                      })
                      .catch(error => {
                          document.getElementById('loading').style.display = 'none';
                          console.error("Fetch Error Details:", error);
                          alert(\`Failed to load church data: \${error.message}\`);
                      });
              } catch (error) {
                  document.getElementById('loading').style.display = 'none';
                  console.error(error);
                  alert(error.message);
              }
          }
      </script>
      <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_PLACEHOLDER&callback=initMap"></script>
  </head>
  <body>
      <h2>Nearby Churches</h2>
      <div id="map"></div>
      <p id="loading" class="loading" style="display: none;">Loading nearby churches...</p>
  </body>
  </html>`;
  
      const updatedHtml = htmlContent.replace(
        'YOUR_API_KEY_PLACEHOLDER', 
        env.GOOGLE_MAPS_API_KEY
      );
      
      res.header('Content-Type', 'text/html');
      res.send(updatedHtml);
    } catch (error) {
      console.error('Error serving maps HTML:', error);
      res.status(500).send('Error loading map');
    }
  });

/**
 * API Route: Get Nearby Churches
 * 
 * Endpoint: GET /api/maps/nearby-churches
 * 
 * Query Parameters:
 * - lat: Latitude coordinate (number)
 * - lng: Longitude coordinate (number)
 * - radius: Optional search radius in meters (number, default: 5000)
 * 
 * Responses:
 * - 200 OK: Returns array of nearby churches with location details
 * - 400 Bad Request: Missing or invalid coordinates
 * - 500 Server Error: Error calling Google Maps API or unexpected server error
 */
router.get('/nearby-churches', MapsController.fetchNearbyChurches);

export default router;