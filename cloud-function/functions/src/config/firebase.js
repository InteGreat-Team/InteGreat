/**
 * Firebase Admin SDK Configuration
 *
 * This file sets up the Firebase Admin SDK along with Firebase Authentication,
 * Firestore, and both versions of Firebase Functions (v1 and v2).
 */

const admin = require('firebase-admin');
const functionsV1 = require('firebase-functions/v1');
const functionsV2 = require('firebase-functions/v2');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize services
const auth = admin.auth();
const db = admin.firestore();

const region = 'asia-southeast1';

// Set fixed region for v2 globally
functionsV2.setGlobalOptions({ region });

module.exports = { 
  admin, 
  auth, 
  db, 
  functionsV1: functionsV1.region(region), 
  functionsV2 // export the functionsV2 instance as is
};