// config.js
// Use the global firebase config
const firebaseConfig = window.firebaseConfig || {};

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