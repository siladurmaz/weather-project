// src/WeatherPage.jsx 

import React, { useState } from 'react';

// Fonksiyon tanımı, props olarak kullanıcı bilgilerini ve çıkış fonksiyonunu alıyor.
function WeatherPage({ currentUser, onLogout }) {
  // Eski projemizdeki state'ler aynı şekilde kalıyor.
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const API_KEY = 'ca77b857a3f1657c778bc2063fda0c70'; // BURAYA KENDİ API KEY'İNİ YAPIŞTIR!

  // API'den veri çeken fonksiyonumuz da aynı şekilde kalıyor.
  const handleSearch = async () => {
    if (city.trim() === '') {
      alert('Lütfen bir şehir giriniz.');
      return;
    }
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=tr`;
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (response.ok) {
        setWeatherData(data);
      } else {
        alert(data.message);
        setWeatherData(null);
      }
    } catch (error) {
      alert('Veri alınırken bir hata oluştu.');
    }
  };

  // BURASI EN ÖNEMLİ KISIM: HEM YENİ HEM ESKİ KODLARIN BİRLEŞİMİ
  return (
    <div className="app">
      {/* YENİ EKLENEN KULLANICI BİLGİSİ VE ÇIKIŞ BUTONU */}
      <div className="user-header">
        <span>Hoş geldin, {currentUser.username}!</span>
        <button onClick={onLogout} className="logout-button">Çıkış Yap</button>
      </div>

      {/* ESKİ PROJEMİZDEN GELEN ARAMA KUTUSU */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Şehir giriniz..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Ara</button>
      </div>

      {/* ESKİ PROJEMİZDEN GELEN HAVA DURUMU GÖSTERGE ALANI */}
      {weatherData && (
        <div className="weather-container">
          <h2>{weatherData.name}</h2>
          <div className="weather-info">
            <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
          </div>
          <p className="description">{weatherData.weather[0].description}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
        </div>
      )}
    </div>
  );
}

export default WeatherPage;