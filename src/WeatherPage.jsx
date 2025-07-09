// src/WeatherPage.jsx (TAM VE DÜZELTİLMİŞ KOD)

import React, { useState, useEffect } from "react";

function WeatherPage({ currentUser, onLogout }) {
  const [city, setCity] = useState(currentUser.sehir || "");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = "ca77b857a3f1657c778bc2063fda0c70";

  const fetchWeather = async (targetCity) => {
    if (!targetCity || targetCity.trim() === "") return;
    setLoading(true);
    setError("");
    setWeatherData(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${API_KEY}&units=metric&lang=tr`
      );
      if (!response.ok) {
        throw new Error("Şehir bulunamadı.");
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa ilk yüklendiğinde varsayılan şehri aramak için useEffect
  useEffect(() => {
    if (currentUser.sehir) {
      fetchWeather(currentUser.sehir);
    }
  }, [currentUser.sehir]);

  // --- DÜZELTİLMİŞ KISIM ---
  // Arka planı değiştirmek için AYRI bir useEffect
  useEffect(() => {
    const getBackgroundClass = () => {
      if (!weatherData) return 'default-bg';

      const weatherId = weatherData.weather[0].id;
      const icon = weatherData.weather[0].icon;

      if (icon.includes('n')) return 'night-bg';
      if (weatherId >= 200 && weatherId <= 232) return 'thunderstorm-bg';
      if (weatherId >= 300 && weatherId <= 531) return 'rain-bg';
      if (weatherId >= 600 && weatherId <= 622) return 'snow-bg';
      if (weatherId >= 701 && weatherId <= 781) return 'mist-bg';
      if (weatherId === 800) return 'clear-bg';
      if (weatherId >= 801 && weatherId <= 804) return 'clouds-bg';
      return 'default-bg';
    };

    const backgroundClass = getBackgroundClass();
    
    document.body.className = '';
    document.body.classList.add(backgroundClass);

    // Temizleme fonksiyonu: Bileşen kaldırıldığında çalışır
    return () => {
      document.body.className = '';
      document.body.classList.add('default-bg');
    };
  }, [weatherData]); // Bu etki, sadece weatherData değiştiğinde çalışacak

  const handleSearch = () => {
    fetchWeather(city);
  };

  return (
    <div className="app">
      <div className="user-header">
        <span>Hoş geldin, {currentUser.email}!</span>
        <button onClick={onLogout} className="logout-button">Çıkış Yap</button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Başka bir şehir arayın..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Ara</button>
      </div>

      {loading && <p>Yükleniyor...</p>}
      {error && <p className="error-message">{error}</p>}

      {weatherData && (
        <div className="weather-container">
          <h2>{weatherData.name}</h2>
          <div className="weather-main">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
              alt={weatherData.weather[0].description}
              className="weather-icon"
            />
            <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
            <p className="description">{weatherData.weather[0].description}</p>
          </div>
          <div className="weather-details">
            <div className="detail-box">
              <p className="detail-label">Hissedilen</p>
              <p className="detail-value">
                {Math.round(weatherData.main.feels_like)}°C
              </p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Yağış (1h)</p>
              <p className="detail-value">
                {weatherData.rain ? weatherData.rain["1h"] : 0} mm
              </p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Nem</p>
              <p className="detail-value">{weatherData.main.humidity}%</p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Rüzgar</p>
              <p className="detail-value">
                {(weatherData.wind.speed * 3.6).toFixed(1)} km/s
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherPage;