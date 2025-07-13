
import React, { useState, useEffect } from "react";

function WeatherPage({ currentUser, onLogout }) {
  const [city, setCity] = useState(currentUser.sehir || "");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 1. Arama geçmişini tutmak için yeni state
  const [searchHistory, setSearchHistory] = useState([]);

  const API_KEY = "ca77b857a3f1657c778bc2063fda0c70";

  // --- YENİ: ARAMA GEÇMİŞİNİ GETİRME FONKSİYONU ---
  const fetchSearchHistory = async () => {
    if (!currentUser.id) return; // Kullanıcı ID'si yoksa çalıştırma
    try {
      const response = await fetch(`http://localhost:3001/api/history/${currentUser.id}`);
      if (!response.ok) return;
      const data = await response.json();
      setSearchHistory(data.map(item => item.sehir));
    } catch (err) {
      console.error("Arama geçmişi yüklenemedi:", err);
    }
  };

  // --- GÜNCELLENDİ: HAVA DURUMU GETİRME VE GEÇMİŞE EKLEME FONKSİYONU ---
  const fetchWeather = async (targetCity) => {
    if (!targetCity || targetCity.trim() === "") return;
    setLoading(true);
    setError("");
    // setWeatherData(null); // Arayüzün anlık kaybolmaması için bunu kaldırabiliriz

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${API_KEY}&units=metric&lang=tr`
      );
      if (!weatherResponse.ok) {
        throw new Error("Şehir bulunamadı.");
      }
      const data = await weatherResponse.json();
      setWeatherData(data);

      // Arama başarılıysa ve geçmişte yoksa, veritabanına ekle
      // Küçük harfe çevirerek kontrol etmek daha güvenilirdir (örn: ankara vs Ankara)
      const isAlreadyInHistory = searchHistory.map(h => h.toLowerCase()).includes(targetCity.toLowerCase());
      if (!isAlreadyInHistory) {
          await fetch('http://localhost:3001/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, city: data.name }), // API'den gelen doğru şehir ismini kaydet
          });
          // Arayüzü anında güncelle
          fetchSearchHistory();
      }

    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- GÜNCELLENDİ: SAYFA İLK YÜKLENDİĞİNDE ÇALIŞACAK useEffect ---
  useEffect(() => {
    // Önce arama geçmişini getir
    fetchSearchHistory();
    // Sonra varsayılan şehrin hava durumunu getir
    if (currentUser.sehir) {
      fetchWeather(currentUser.sehir);
    }
  }, [currentUser.id]); // Bu etki sadece bir kere, kullanıcı bilgisi geldiğinde çalışır


  // --- DİNAMİK ARKA PLAN İÇİN useEffect (DEĞİŞİKLİK YOK) ---
  useEffect(() => {
    const getBackgroundClass = () => {
      if (!weatherData) return "default-bg";
      const weatherId = weatherData.weather[0].id;
      const icon = weatherData.weather[0].icon;
      if (icon.includes("n")) return "night-bg";
      if (weatherId >= 200 && weatherId <= 232) return "thunderstorm-bg";
      if (weatherId >= 300 && weatherId <= 531) return "rain-bg";
      if (weatherId >= 600 && weatherId <= 622) return "snow-bg";
      if (weatherId >= 701 && weatherId <= 781) return "mist-bg";
      if (weatherId === 800) return "clear-bg";
      if (weatherId >= 801 && weatherId <= 804) return "clouds-bg";
      return "default-bg";
    };
    const backgroundClass = getBackgroundClass();
    document.body.className = "";
    document.body.classList.add(backgroundClass);
    return () => {
      document.body.className = "";
      document.body.classList.add("default-bg");
    };
  }, [weatherData]);

  const handleSearch = () => {
    fetchWeather(city);
  };

  return (
    <div className="app">
      <div className="user-header">
        <span>Hoş geldin, {currentUser.email}!</span>
        <button onClick={onLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Başka bir şehir arayın..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Ara</button>
      </div>
      
      {/* --- YENİ EKLENEN ARAMA GEÇMİŞİ BÖLÜMÜ --- */}
      {searchHistory.length > 0 && (
        <div className="history-container">
          {searchHistory.map((historyCity, index) => (
            <button 
              key={index} 
              className="history-tag"
              onClick={() => {
                setCity(historyCity);
                fetchWeather(historyCity);
              }}
            >
              {historyCity}
            </button>
          ))}
        </div>
      )}

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
            <div className="detail-box">
              <p className="detail-label">Gün Doğumu</p>
              <p className="detail-value">
                {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="detail-box">
              <p className="detail-label">Gün Batımı</p>
              <p className="detail-value">
                {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherPage;