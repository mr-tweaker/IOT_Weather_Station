// Global variables for charts
let tempHumidityChart;
let pressureWindChart;
let lastUpdateTime = 0;
const UPDATE_THROTTLE_MS = 2000; // Throttle updates to prevent too many redraws

// Function to set gauge value (0 to 1)
function setGaugeValue(gaugeElement, value) {
    if (!gaugeElement) return null;
    gaugeElement.querySelector(".gauge__fill").style.transform = `rotate(${value/2}turn)`;
    return gaugeElement;
}

// Function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

// Initialize dashboard
function initializeDashboard() {
    console.log("Initializing dashboard...");
    
    // Listen for current data updates
    database.ref(`/stations/${stationId}/current`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Throttle updates to prevent performance issues
            const now = Date.now();
            if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
                console.log("Updating with new data:", data);
                updateCurrentConditions(data);
                lastUpdateTime = now;
            }
        } else {
            console.log("No data received from Firebase");
        }
    }, (error) => {
        console.error("Firebase error:", error);
    });
    
    // Listen for station info updates
    database.ref(`/stations/${stationId}/info`).on('value', (snapshot) => {
        const info = snapshot.val();
        if (info) {
            updateStationInfo(info);
        }
    });
    
    // Initialize historical data
    initializeCharts();
    fetchHistoricalData();
    
    // Set a basic weather forecast based on current conditions
    updateForecast();
    
    console.log("Dashboard initialization complete");
}

// Update current conditions display
function updateCurrentConditions(data) {
    console.log("Updating current conditions with:", data);
    
    // Update temperature
    if (data.temperature) {
        document.getElementById("temperature-value").textContent = data.temperature.toFixed(1);
        setGaugeValue(document.getElementById("temperature-gauge"), 
                      (data.temperature - gaugeRanges.temperature.min) / 
                      (gaugeRanges.temperature.max - gaugeRanges.temperature.min));
    }
    
    // Update humidity
    if (data.humidity) {
        document.getElementById("humidity-value").textContent = data.humidity.toFixed(0);
        setGaugeValue(document.getElementById("humidity-gauge"), 
                      (data.humidity - gaugeRanges.humidity.min) / 
                      (gaugeRanges.humidity.max - gaugeRanges.humidity.min));
    }
    
    // Update pressure
    if (data.pressure) {
        document.getElementById("pressure-value").textContent = data.pressure.toFixed(0);
        setGaugeValue(document.getElementById("pressure-gauge"), 
                      (data.pressure - gaugeRanges.pressure.min) / 
                      (gaugeRanges.pressure.max - gaugeRanges.pressure.min));
    }
    
    // Update wind
    if (data.windSpeed) {
        document.getElementById("wind-speed-value").textContent = data.windSpeed.toFixed(1);
    }
    
    if (data.windDirection) {
        document.getElementById("wind-direction-value").textContent = data.windDirection.toFixed(0);
        document.getElementById("wind-direction-arrow").style.transform = `rotate(${data.windDirection}deg)`;
    }
    
    // Update light level
    if (data.light) {
        document.getElementById("light-level-value").textContent = data.light.toFixed(0);
        document.getElementById("light-level-bar").style.width = `${data.light}%`;
    }
    
    // Update station health
    if (data.batteryLevel) {
        document.getElementById("battery-level").textContent = data.batteryLevel;
    }
    
    if (data.signalStrength) {
        document.getElementById("signal-strength").textContent = data.signalStrength;
    }
    
    if (data.uptime) {
        document.getElementById("uptime").textContent = formatUptime(data.uptime);
    }
    
    // Update last updated timestamp
    if (data.timestamp) {
        const date = new Date(data.timestamp * 1000);
        document.getElementById("lastUpdated").textContent = date.toLocaleString();
    } else {
        // If no timestamp provided, use current time
        document.getElementById("lastUpdated").textContent = new Date().toLocaleString();
    }
    
    // Update forecast based on current conditions
    updateForecast(data);
}

// Update station info
function updateStationInfo(info) {
    console.log("Updating station info:", info);
    
    if (info.latitude) {
        document.getElementById("latitude").textContent = info.latitude;
    }
    
    if (info.longitude) {
        document.getElementById("longitude").textContent = Math.abs(info.longitude);
    }
    
    if (info.elevation) {
        document.getElementById("elevation").textContent = info.elevation;
    }
}

// Initialize charts
function initializeCharts() {
    console.log("Initializing charts...");
    
    // Temperature & Humidity Chart
    const tempHumidityCtx = document.getElementById('tempHumidityChart').getContext('2d');
    tempHumidityChart = new Chart(tempHumidityCtx, {
        type: 'line',
        data: {
            labels: Array(24).fill("--"),
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: Array(24).fill(null),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Humidity (%)',
                    data: Array(24).fill(null),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                }
            }
        }
    });
    
    // Pressure & Wind Speed Chart
    const pressureWindCtx = document.getElementById('pressureWindChart').getContext('2d');
    pressureWindChart = new Chart(pressureWindCtx, {
        type: 'line',
        data: {
            labels: Array(24).fill("--"),
            datasets: [
                {
                    label: 'Pressure (hPa)',
                    data: Array(24).fill(null),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Wind Speed (km/h)',
                    data: Array(24).fill(null),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Pressure (hPa)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Wind Speed (km/h)'
                    }
                }
            }
        }
    });
    
    console.log("Charts initialized");
}

// Fetch historical data
function fetchHistoricalData() {
    console.log("Fetching historical data...");
    
    database.ref(`/stations/${stationId}/historical`).on('value', (snapshot) => {
        const historicalData = snapshot.val();
        if (historicalData) {
            console.log("Received historical data");
            updateHistoricalCharts(historicalData);
        } else {
            console.log("No historical data available");
        }
    });
}

// Update historical charts
function updateHistoricalCharts(historicalData) {
    if (!historicalData) return;
    
    console.log("Updating historical charts with:", historicalData);
    
    const currentIndex = historicalData.currentIndex || 0;
    const labels = [];
    
    // Create labels for 24 hours
    for (let i = 0; i < 24; i++) {
        // Calculate correct index
        const hoursAgo = 23 - i;
        labels.push(`${hoursAgo}h ago`);
    }
    
    // Update temperature chart
    if (historicalData.temperature) {
        const tempData = organizeHistoricalData(historicalData.temperature, currentIndex);
        tempHumidityChart.data.labels = labels;
        tempHumidityChart.data.datasets[0].data = tempData;
    }
    
    // Update humidity chart
    if (historicalData.humidity) {
        const humidityData = organizeHistoricalData(historicalData.humidity, currentIndex);
        tempHumidityChart.data.datasets[1].data = humidityData;
    }
    
    // Update pressure chart
    if (historicalData.pressure) {
        const pressureData = organizeHistoricalData(historicalData.pressure, currentIndex);
        pressureWindChart.data.labels = labels;
        pressureWindChart.data.datasets[0].data = pressureData;
    }
    
    // Update wind speed chart
    if (historicalData.windSpeed) {
        const windData = organizeHistoricalData(historicalData.windSpeed, currentIndex);
        pressureWindChart.data.datasets[1].data = windData;
    }
    
    // Update charts
    tempHumidityChart.update();
    pressureWindChart.update();
    
    console.log("Historical charts updated");
}

// Organize historical data in correct order based on current index
function organizeHistoricalData(data, currentIndex) {
    if (!data) return Array(24).fill(null);
    
    const result = Array(24).fill(null);
    
    // Convert object to array if needed
    let dataArray = data;
    if (!Array.isArray(data)) {
        dataArray = [];
        for (const key in data) {
            const index = parseInt(key);
            if (!isNaN(index) && index >= 0 && index < 24) {
                dataArray[index] = data[key];
            }
        }
    }
    
    // Organize data based on current index
    for (let i = 0; i < 24; i++) {
        // Calculate the correct index in the circular buffer
        const dataIndex = (currentIndex - 23 + i + 24) % 24;
        result[i] = dataArray[dataIndex] || null;
    }
    
    return result;
}

// Update forecast based on current conditions
function updateForecast(data) {
    if (!data) {
        document.getElementById("forecast-text").textContent = "No forecast data available";
        return;
    }
    
    let forecastText = "";
    
    // Simple forecasting logic based on current conditions
    if (data.temperature && data.humidity && data.pressure) {
        if (data.pressure < 995) {
            forecastText = "Stormy conditions likely. Expect rain and strong winds.";
        } else if (data.pressure < 1005) {
            if (data.humidity > 80) {
                forecastText = "Rain likely in the next 24 hours. Keep an umbrella handy.";
            } else {
                forecastText = "Cloudy with possible light showers.";
            }
        } else if (data.pressure > 1020) {
            if (data.humidity < 40) {
                forecastText = "Clear skies and dry conditions expected.";
            } else {
                forecastText = "Stable weather conditions. Partly cloudy.";
            }
        } else {
            if (data.humidity > 70) {
                forecastText = "Partly cloudy with a chance of light rain.";
            } else {
                forecastText = "Generally fair conditions expected.";
            }
        }
        
        // Add temperature trend
        forecastText += " Temperature expected to ";
        if (data.temperature > 30) {
            forecastText += "remain hot.";
        } else if (data.temperature > 20) {
            forecastText += "be pleasantly warm.";
        } else if (data.temperature > 10) {
            forecastText += "be mild.";
        } else {
            forecastText += "be cool to cold.";
        }
    } else {
        forecastText = "Insufficient data for forecast.";
    }
    
    document.getElementById("forecast-text").textContent = forecastText;
}

// Handle connection status
firebase.database().ref('.info/connected').on('value', (snapshot) => {
    const isConnected = snapshot.val();
    console.log("Firebase connection status:", isConnected ? "Connected" : "Disconnected");
    
    // Update UI to show connection status
    const statusElement = document.createElement('div');
    if (!document.getElementById('connection-status')) {
        statusElement.id = 'connection-status';
        statusElement.className = isConnected ? 'text-green-600' : 'text-red-600';
        statusElement.textContent = isConnected ? 'Connected to Firebase' : 'Disconnected from Firebase';
        document.querySelector('header').appendChild(statusElement);
    } else {
        const existing = document.getElementById('connection-status');
        existing.className = isConnected ? 'text-green-600' : 'text-red-600';
        existing.textContent = isConnected ? 'Connected to Firebase' : 'Disconnected from Firebase';
    }
});

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded, initializing dashboard...");
    initializeDashboard();
});