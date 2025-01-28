const API_KEY = '13ceabf4cecccfd349b168bb8a9d28c0';
const weatherWidget = document.getElementById('weather-widget');
const weatherData = document.getElementById('weather-data');
const weatherIcon = document.getElementById('weather-icon');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const unitToggle = document.getElementById('unit-toggle');

// State management
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
let currentWeatherData = null;
let currentForecastData = null;

// Chart instances
let charts = {
    temperature: null,
    conditions: null,
    temperatureTrend: null
};

// Weather icon mapping
const weatherIconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
};

// Background gradients for different weather conditions
const weatherBackgrounds = {
    clear: 'linear-gradient(to right, #56CCF2, #2F80ED)',
    clouds: 'linear-gradient(to right, #bdc3c7, #2c3e50)',
    rain: 'linear-gradient(to right, #3a7bd5, #3a6073)',
    drizzle: 'linear-gradient(to right, #3a7bd5, #3a6073)',
    thunderstorm: 'linear-gradient(to right, #141E30, #243B55)',
    snow: 'linear-gradient(to right, #E6DADA, #274046)',
    mist: 'linear-gradient(to right, #757F9A, #D7DDE8)',
    fog: 'linear-gradient(to right, #757F9A, #D7DDE8)',
    default: 'linear-gradient(to right, #7F7FD5, #86A8E7, #91EAE4)'
};

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

unitToggle.addEventListener('change', () => {
    currentUnit = unitToggle.checked ? 'imperial' : 'metric';
    if (currentWeatherData && currentForecastData) {
        updateUI(currentWeatherData, currentForecastData);
    }
});

// Loading state management
function setLoading(isLoading) {
    const loader = document.getElementById('loader');
    if (isLoading) {
        loader.style.display = 'flex';
        weatherData.style.opacity = '0.5';
    } else {
        loader.style.display = 'none';
        weatherData.style.opacity = '1';
    }
}

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

function convertTemperature(temp, targetUnit) {
    if (currentUnit === targetUnit) return temp;
    return targetUnit === 'imperial' ? celsiusToFahrenheit(temp) : fahrenheitToCelsius(temp);
}

// API calls
async function getWeatherData(city) {
    setLoading(true);
    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`)
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error(`City not found or API error`);
        }

        currentWeatherData = await currentWeatherResponse.json();
        currentForecastData = await forecastResponse.json();

        updateUI(currentWeatherData, currentForecastData);
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function showError(message) {
    weatherData.innerHTML = `
        <div class="error-message">
            <i class="wi wi-na"></i>
            <p>${message}</p>
            <p>Please try again with a valid city name.</p>
        </div>
    `;
    // Clear charts when there's an error
    clearCharts();
}

function clearCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
}

function setWeatherBackground(condition) {
    weatherWidget.style.background = weatherBackgrounds[condition] || weatherBackgrounds.default;
}

function updateUI(currentWeather, forecast) {
    const weatherCondition = currentWeather.weather[0].main.toLowerCase();
    const iconCode = currentWeather.weather[0].icon;
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windSpeedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    
    // Update weather icon and background
    weatherIcon.innerHTML = `<i class="wi ${weatherIconMap[iconCode] || 'wi-na'}"></i>`;
    setWeatherBackground(weatherCondition);
    
    // Format wind speed based on unit
    const windSpeed = currentUnit === 'metric' ? 
        currentWeather.wind.speed : 
        (currentWeather.wind.speed * 2.237).toFixed(1);

    // Update weather information
    weatherData.innerHTML = `
        <h2>${currentWeather.name}, ${currentWeather.sys.country}</h2>
        <div class="temp-container">
            <p class="main-temp">${currentWeather.main.temp.toFixed(1)}${tempUnit}</p>
            <p class="feels-like">Feels like: ${currentWeather.main.feels_like.toFixed(1)}${tempUnit}</p>
        </div>
        <div class="weather-details">
            <p><i class="wi wi-thermometer"></i> High/Low: ${currentWeather.main.temp_max.toFixed(1)}/${currentWeather.main.temp_min.toFixed(1)}${tempUnit}</p>
            <p><i class="wi wi-humidity"></i> Humidity: ${currentWeather.main.humidity}%</p>
            <p><i class="wi wi-strong-wind"></i> Wind: ${windSpeed} ${windSpeedUnit}</p>
            <p><i class="wi wi-barometer"></i> Pressure: ${currentWeather.main.pressure} hPa</p>
            <p><i class="wi ${weatherIconMap[iconCode]}"></i> ${currentWeather.weather[0].description}</p>
        </div>
    `;

    // Update all charts
    updateCharts(forecast);
}

function updateCharts(forecast) {
    updateTemperatureChart(forecast);
    updateConditionsChart(forecast);
    updateTemperatureTrendChart(forecast);
}

function updateTemperatureChart(forecast) {
    const ctx = document.getElementById('temperature-chart').getContext('2d');
    const dailyData = processDailyForecastData(forecast);

    if (charts.temperature) {
        charts.temperature.destroy();
    }

    charts.temperature = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dailyData.labels,
            datasets: [{
                label: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                data: dailyData.temps,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '5-Day Temperature Forecast'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`
                    }
                }
            }
        }
    });
}

function updateConditionsChart(forecast) {
    const ctx = document.getElementById('conditions-chart').getContext('2d');
    const conditions = forecast.list.map(item => item.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    if (charts.conditions) {
        charts.conditions.destroy();
    }

    charts.conditions = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weather Conditions Distribution'
                }
            }
        }
    });
}

function updateTemperatureTrendChart(forecast) {
    const ctx = document.getElementById('temperature-trend-chart').getContext('2d');
    const hourlyData = processHourlyForecastData(forecast);

    if (charts.temperatureTrend) {
        charts.temperatureTrend.destroy();
    }

    charts.temperatureTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyData.labels,
            datasets: [
                {
                    label: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                    data: hourlyData.temps,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: hourlyData.humidity,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: '24-Hour Forecast'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function processDailyForecastData(forecast) {
    const dailyData = {};
    
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                humidity: []
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
    });

    const labels = Object.keys(dailyData);
    const temps = labels.map(date => {
        const temps = dailyData[date].temps;
        return temps.reduce((a, b) => a + b) / temps.length;
    });

    return { labels, temps };
}

function processHourlyForecastData(forecast) {
    const next24Hours = forecast.list.slice(0, 8); // 3-hour intervals for 24 hours
    
    return {
        labels: next24Hours.map(item => 
            new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ),
        temps: next24Hours.map(item => item.main.temp),
        humidity: next24Hours.map(item => item.main.humidity)
    };
}

// Initialize the app with a default city
document.addEventListener('DOMContentLoaded', () => {
    getWeatherData('Islamabad');
});