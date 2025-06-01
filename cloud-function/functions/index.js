/**
 * Firebase Cloud Functions - Main Entry Point
 * 
 * This file exports all Cloud Functions for deployment
 */

// Import Auth Triggers
const authTriggers = require('./src/triggers/auth/emailAuthTrigger');

// Export Auth Triggers - make sure function name matches exactly
exports.deleteNonIntegreatUsers = authTriggers.deleteNonIntegreatUsers;

// You can add more functions as you develop them
console.log('Firebase Functions initialized');