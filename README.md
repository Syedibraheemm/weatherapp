Weather Dashboard and Tables App
This project is a weather application that displays a dashboard with current weather details and a tables page with weather forecast data. The application interacts with the OpenWeather API to fetch weather data for a specified city.

Features
Dashboard Page:
Displays the current weather data for a default city or a user-specified city.
Shows temperature, weather conditions, wind speed, and more.
Utilizes pagination to display forecast data.
Tables Page:
Provides detailed weather forecast information in tabular format.
Allows users to search for weather data by city.
Includes a chatbot assistant to handle weather queries.
Files and Structure
The application is divided into two main pages: the Dashboard and the Tables page. Below is the structure and description of the main files:

HTML Files
dashboard.html: The main dashboard page that displays weather data.
tables.html: The tables page that displays weather forecast data in a table format.
CSS Files
dashboard.css: Styles specific to the layout and design of the dashboard page.
tables.css: Styles specific to the layout and design of the tables page.
JavaScript Files
dashboard.js: Contains the logic to fetch and display weather data on the dashboard page.
tables.js: Contains the logic to fetch and display weather data in a table, handle pagination, and implement the chatbot assistant.
How to Run the Application
Clone this repository or download the files to your local machine.
Open dashboard.html or tables.html in your browser.
API Integration
The app uses the OpenWeather API to fetch weather data. You will need to insert your API key in the JavaScript files (dashboard.js and tables.js).

In dashboard.js, replace:

const WEATHER_API_KEY = 'your-api-key';
const GEMINI_API_KEY = 'your-api-key';

In tables.js, replace:

const WEATHER_API_KEY = 'your-api-key';
const GEMINI_API_KEY = 'your-api-key';

Make sure to sign up at OpenWeather and Google API to obtain an API key.

Dashboard Page Overview
dashboard.html

Contains the main layout with a search bar to find weather information for different cities.
Displays a summary of the current weather, including temperature, humidity, and wind speed.
dashboard.css

Defines the layout and style for the dashboard components, including the weather display and search bar.
dashboard.js

Fetches current weather data using the OpenWeather API.
Displays the data dynamically on the dashboard.
Tables Page Overview

tables.html

Displays a detailed weather forecast table with columns for date, time, temperature, weather conditions, humidity, and wind speed.
Includes a chatbot assistant to answer user queries.

tables.css

Styles the table and chat assistant layout.
Implements responsive design to ensure the page looks good on all devices.

tables.js

Fetches forecast data for a specific city using the OpenWeather API.
Dynamically displays data in a paginated table.
Implements a chatbot that processes weather-related questions.

Additional Features

Pagination
Implemented on both the Dashboard and Tables pages.
Allows users to browse through the forecast data in a structured manner.

Chatbot Assistant
Located on the Tables page.
Responds to weather-related queries entered by the user.

Credits
Weather data provided by OpenWeather API.
Icons from Weather Icons.
ChatBot from Gemini API

Future Improvements
Implement filtering and sorting functionality for the forecast data.
Expand chatbot functionality to support more general queries.
#   w e a t h e r - a p p  
 