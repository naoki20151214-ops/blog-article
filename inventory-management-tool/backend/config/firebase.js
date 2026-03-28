require('dotenv').config();

const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'mock';

// Get appropriate database instance
let db = null;

const initializeFirebase = () => {
  if (MOCK_MODE) {
    // Use Mock Firebase
    const { initializeMock } = require('./firebase-mock');
    initializeMock();
    console.log('✓ Mock Firebase initialized successfully');
    return;
  }

  // Use Real Firebase
  try {
    const admin = require('firebase-admin');
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✓ Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    process.exit(1);
  }
};

// Get Firestore instance
const getDB = () => {
  if (MOCK_MODE) {
    const { getDB: getMockDB } = require('./firebase-mock');
    return getMockDB();
  }

  const admin = require('firebase-admin');
  return admin.firestore();
};

module.exports = {
  initializeFirebase,
  getDB,
};
