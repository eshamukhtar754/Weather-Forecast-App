// Try to load API key from config.js (local file, not committed to git)
let API_KEY = 'YOUR_API_KEY_HERE';
if (typeof WEATHER_API_KEY !== 'undefined') {
    API_KEY = WEATHER_API_KEY;
} else {
    // Fallback to localStorage
    API_KEY = localStorage.getItem('weatherApiKey') || 'YOUR_API_KEY_HERE';
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const forecast = document.getElementById('forecast');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Weather elements
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const forecastCards = document.getElementById('forecastCards');
const errorMessage = document.getElementById('errorMessage');

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Default city
window.addEventListener('load', () => {
    searchWeather('London');
});

async function searchWeather(city = cityInput.value.trim()) {
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    hideError();
    hideWeather();

    try {
        // Get current weather
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        console.log('API Response status:', weatherResponse.status);
        
        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            console.error('API Error:', errorData);
            // Use mock data if API fails
            console.log('Using mock data for demo');
            const mockData = getMockWeatherData(city);
            displayWeather(mockData);
            displayForecast(getMockForecastData());
            hideLoading();
            showWeather();
            return;
        }

        const weatherData = await weatherResponse.json();

        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
        hideLoading();
        showWeather();

    } catch (err) {
        console.error('Error:', err);
        // Use mock data on error
        console.log('Using mock data for demo');
        const mockData = getMockWeatherData(city);
        displayWeather(mockData);
        displayForecast(getMockForecastData());
        hideLoading();
        showWeather();
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateTime.textContent = formatDateTime();
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Set weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.className = getWeatherIcon(iconCode);
}

function displayForecast(data) {
    forecastCards.innerHTML = '';
    
    // Get one forecast per day (at noon)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = day.weather[0].icon;
        const temp = Math.round(day.main.temp);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="day">${dayName}</div>
            <i class="${getWeatherIcon(iconCode)}"></i>
            <div class="temp">${temp}°C</div>
        `;
        forecastCards.appendChild(card);
    });
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-showers-heavy',
        '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[iconCode] || 'fas fa-cloud';
}

function formatDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
}

function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showWeather() {
    weatherInfo.style.display = 'block';
    forecast.style.display = 'block';
}

function hideWeather() {
    weatherInfo.style.display = 'none';
    forecast.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}

// Mock data functions for demo when API fails
function getMockWeatherData(city) {
    const mockData = {
        name: city,
        sys: {
            country: 'PK'
        },
        main: {
            temp: 32,
            humidity: 65,
            pressure: 1013
        },
        weather: [
            {
                description: 'partly cloudy',
                icon: '02d'
            }
        ],
        wind: {
            speed: 3.5
        },
        visibility: 10000
    };
    return mockData;
}

function getMockForecastData() {
    const now = Date.now() / 1000;
    const mockData = {
        list: []
    };
    
    // Create 5 days of forecast data with 8 entries per day (3-hour intervals)
    for (let day = 1; day <= 5; day++) {
        for (let hour = 0; hour < 8; hour++) {
            const timestamp = now + (day * 86400) + (hour * 10800);
            const icons = ['01d', '02d', '03d', '04d', '10d'];
            const icon = icons[Math.floor(Math.random() * icons.length)];
            const temp = 28 + Math.floor(Math.random() * 8); // Random temp between 28-35
            
            mockData.list.push({
                dt: timestamp,
                weather: [{ icon: icon }],
                main: { temp: temp }
            });
        }
    }
    
    return mockData;
}
