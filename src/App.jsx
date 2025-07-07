// App.jsx
import React, { useState } from "react"; // useState'i import ettik

function App() {
  // useState, bileşenin hafızasında veri tutmamızı sağlar.
  // 'city' kullanıcının girdiği şehir ismini, 'setCity' ise bu ismi güncelleyen fonksiyonu tutar.
  const [city, setCity] = useState("");

  // 'weatherData' API'den gelen hava durumu verisini, 'setWeatherData' ise bu veriyi güncelleyen fonksiyonu tutar.
  const [weatherData, setWeatherData] = useState(null); // Başlangıçta veri yok (null)

  const API_KEY = "ca77b857a3f1657c778bc2063fda0c70"; // Buraya OpenWeather'dan aldığın anahtarı yapıştır!

  const handleSearch = async () => {
    if (city.trim() === "") {
      alert("Lütfen bir şehir giriniz.");
      return;
    }

    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=tr`;

    try {
      // API'ye istek gönderiyoruz
      const response = await fetch(API_URL);

      // Gelen cevabı JSON formatına çeviriyoruz
      const data = await response.json();

      if (response.ok) {
        // Eğer istek başarılıysa (şehir bulunduysa)
        setWeatherData(data); // Gelen veriyi state'e kaydediyoruz
        console.log(data); // Gelen veriyi konsolda görebilirsin
      } else {
        // Eğer şehir bulunamadıysa veya başka bir hata varsa
        alert(data.message); // API'den gelen hata mesajını göster
        setWeatherData(null); // Önceki veriyi temizle
      }
    } catch (error) {
      // İnternet bağlantısı yoksa veya başka bir ağ hatası olursa
      alert("Veri alınırken bir hata oluştu.");
      console.error("Fetch hatası:", error);
    }
  };

  return (
    <div className="app">
      <div className="search-container">
        <input
          type="text"
          placeholder="Şehir giriniz..."
          value={city}
          onChange={(e) => setCity(e.target.value)} // Input'a her yazı yazıldığında 'city' state'ini günceller
        />
        <button onClick={handleSearch}>Ara</button>
      </div>

      {/* Hava durumu verisi varsa bu bölümü göster */}
      {weatherData && (
        <div className="weather-container">
          <h2>{weatherData.name}</h2>
          <div className="weather-info">
            <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
            <p className="description">{weatherData.weather[0].description}</p>
          </div>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}
    </div>
  );
}

export default App;
