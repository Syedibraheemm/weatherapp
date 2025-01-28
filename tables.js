// Constants for API keys and pagination
const WEATHER_API_KEY = '13ceabf4cecccfd349b168bb8a9d28c0';
const GEMINI_API_KEY = 'AIzaSyC25U9f8VIriVAmyJocEsHRGp6K0BsGshI';
const ITEMS_PER_PAGE = 10;

// Global variables
let forecastData = [];
let currentPage = 1;
let defaultCity = 'Islamabad';

// DOM Elements
const weatherTable = document.getElementById('weather-data');
const paginationContainer = document.getElementById('pagination');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const searchBar = document.querySelector('.search-bar');

// Fetch weather forecast data
async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error(`City not found or API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Display weather data in table
function displayWeatherData(weatherData) {
    if (!weatherData || !weatherData.list) {
        console.error('Invalid weather data received');
        return;
    }

    forecastData = weatherData.list;
    const pageData = forecastData.slice(0, ITEMS_PER_PAGE);
    
    weatherTable.innerHTML = pageData.map(item => `
        <tr>
            <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
            <td>${new Date(item.dt * 1000).toLocaleTimeString()}</td>
            <td>${item.main.temp.toFixed(1)}°C</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="https://openweathermap.org/img/w/${item.weather[0].icon}.png" alt="weather icon">
                    ${item.weather[0].description}
                </div>
            </td>
            <td>${item.main.humidity}%</td>
            <td>${item.wind.speed} m/s</td>
        </tr>
    `).join('');

    setupPagination();
}

// Setup pagination
function setupPagination() {
    const pageCount = Math.ceil(forecastData.length / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = '';

    if (currentPage > 1) {
        addPaginationButton('Previous', currentPage - 1);
    }

    for (let i = 1; i <= pageCount; i++) {
        addPaginationButton(i, i, i === currentPage);
    }

    if (currentPage < pageCount) {
        addPaginationButton('Next', currentPage + 1);
    }
}

// Add pagination button
function addPaginationButton(text, pageNumber, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    if (isActive) button.classList.add('active');
    button.addEventListener('click', () => changePage(pageNumber));
    paginationContainer.appendChild(button);
}

// Change page
function changePage(page) {
    currentPage = page;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = forecastData.slice(startIndex, endIndex);

    weatherTable.innerHTML = pageData.map(item => `
        <tr>
            <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
            <td>${new Date(item.dt * 1000).toLocaleTimeString()}</td>
            <td>${item.main.temp.toFixed(1)}°C</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="https://openweathermap.org/img/w/${item.weather[0].icon}.png" alt="weather icon">
                    ${item.weather[0].description}
                </div>
            </td>
            <td>${item.main.humidity}%</td>
            <td>${item.wind.speed} m/s</td>
        </tr>
    `).join('');
}

// Extract city name from message
function extractCityName(message) {
    message = message.toLowerCase();
    const words = message.split(' ');
    
    // Common weather-related words to ignore
    const ignoreWords = ['weather', 'temperature', 'forecast', 'in', 'at', 'of', 'the', 'tell', 'me', 'about', 'what', 'is'];
    
    // Filter out common words and return the first remaining word that could be a city
    const potentialCity = words.find(word => {
        word = word.replace(/[.,!?]/g, '').trim();
        return word.length > 2 && !ignoreWords.includes(word);
    });

    return potentialCity ? potentialCity.charAt(0).toUpperCase() + potentialCity.slice(1) : null;
}

// Handle chat messages
async function handleChatMessage(message) {
    appendMessage('user', message);

    // Check if it's a weather-related query
    if (message.toLowerCase().includes('weather') || 
        message.toLowerCase().includes('temperature') || 
        message.toLowerCase().includes('forecast')) {
        
        const cityName = extractCityName(message);
        
        if (cityName) {
            try {
                const weatherData = await fetchWeatherData(cityName);
                displayWeatherData(weatherData);
                
                const response = `Current weather in ${cityName}:\n` +
                    `Temperature: ${weatherData.list[0].main.temp.toFixed(1)}°C\n` +
                    `Condition: ${weatherData.list[0].weather[0].description}\n` +
                    `Humidity: ${weatherData.list[0].main.humidity}%\n` +
                    `Wind Speed: ${weatherData.list[0].wind.speed} m/s`;
                
                appendMessage('bot', response);
            } catch (error) {
                appendMessage('bot', `Sorry, I couldn't find weather data for ${cityName}. Please check the city name and try again.`);
            }
        } else {
            appendMessage('bot', 'Please specify a city name for the weather information.');
        }
    } else {
        // Handle non-weather queries with Gemini API
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                              "I apologize, but I'm having trouble understanding. Could you rephrase your question?";
            appendMessage('bot', botResponse);
        } catch (error) {
            console.error('Gemini API Error:', error);
            appendMessage('bot', "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking about the weather instead!");
        }
    }
}

// Append message to chat
function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            handleChatMessage(message);
            chatInput.value = '';
        }
    }
});

searchBar.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const city = searchBar.value.trim();
        if (city) {
            try {
                const weatherData = await fetchWeatherData(city);
                displayWeatherData(weatherData);
            } catch (error) {
                console.error('Error fetching weather data:', error);
                alert(`Could not find weather data for "${city}". Please check the city name and try again.`);
            }
        }
    }
});

// Initialize with default city
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const weatherData = await fetchWeatherData(defaultCity);
        displayWeatherData(weatherData);
    } catch (error) {
        console.error('Error loading initial weather data:', error);
        alert('Error loading initial weather data. Please try searching for a city.');
    }
});