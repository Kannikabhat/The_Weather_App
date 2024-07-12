// src/components/Weather.js
import React, { useState } from 'react';
import axios from 'axios';
import './Weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State for loading status
  const [units, setUnits] = useState('metric'); // State for units

  const apiKey = '803dbb11ff3a3bfbdf2e5eb2710f6655'; // Replace with your actual API key

  const getWeather = async (lat, lon) => {
    setLoading(true); // Set loading to true before the API call
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?${lat && lon ? `lat=${lat}&lon=${lon}` : `q=${city}`}&appid=${apiKey}&units=${units}`
      );
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?${lat && lon ? `lat=${lat}&lon=${lon}` : `q=${city}`}&appid=${apiKey}&units=${units}`
      );
      const dailyForecast = groupForecastByDay(forecastResponse.data.list);
      setForecast(dailyForecast);

      setError('');
    } catch (err) {
      setError('City not found or unable to fetch weather data for the current location.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false); // Set loading to false after the API call
    }
  };

  const groupForecastByDay = (list) => {
    const forecast = {};
    list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!forecast[date]) {
        forecast[date] = [];
      }
      forecast[date].push(item);
    });
    return forecast;
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeather(latitude, longitude);
        },
        (error) => {
          setError('Unable to retrieve your location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  const toggleUnits = () => {
    setUnits((prevUnits) => (prevUnits === 'metric' ? 'imperial' : 'metric'));
  };

  return (
    <div>
      <h1>Weather App</h1>
      <input 
        type="text" 
        placeholder="Enter city" 
        value={city} 
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={() => getWeather()}>Get Weather</button>
      <button onClick={handleGeolocation}>Get Weather for Current Location</button>
      <button onClick={toggleUnits}>Switch to {units === 'metric' ? 'Fahrenheit' : 'Celsius'}</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {weather && !loading && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>{weather.weather[0].description}</p>
          <p>{weather.main.temp}°{units === 'metric' ? 'C' : 'F'}</p>
          <img 
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
            alt={weather.weather[0].description} 
          />
        </div>
      )}
      {Object.keys(forecast).length > 0 && !loading && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          {Object.keys(forecast).map((date) => (
            <div key={date}>
              <h3>{date}</h3>
              <div className="forecast-container">
                {forecast[date].map((entry, index) => (
                  <div key={index} className="forecast-item">
                    <p>{new Date(entry.dt * 1000).toLocaleTimeString()}</p>
                    <p>{entry.main.temp}°{units === 'metric' ? 'C' : 'F'}</p>
                    <p>{entry.weather[0].description}</p>
                    <img 
                      src={`http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`} 
                      alt={entry.weather[0].description} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Weather;
