// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Station ID - match with the one in ESP32 code
const stationId = "station1";

// Gauge ranges configuration
const gaugeRanges = {
  temperature: {
    min: 0,
    max: 40
  },
  humidity: {
    min: 0,
    max: 100
  },
  pressure: {
    min: 980,
    max: 1040
  }
};