// src/pages/RegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  // 1. Yeni alanlar için state'ler oluştur
  const [kullanici_adi, setKullaniciAdi] = useState("");
  const [isim, setIsim] = useState("");
  const [soyisim, setSoyisim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sehir, setSehir] = useState(""); // Şehir opsiyonel olabilir
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 2. Frontend'de temel kontrol
    if (!kullanici_adi || !isim || !soyisim || !email || !password) {
      alert("Yıldızlı (*) alanların doldurulması zorunludur.");
      return;
    }

    try {
      // 3. Backend'e gönderilecek veri objesini oluştur
      const userData = {
        kullanici_adi,
        isim,
        soyisim,
        email,
        password,
        sehir,
      };

      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message); // Sunucudan gelen hata mesajını göster
      } else {
        alert(data.message);
        navigate("/login");
      }
    } catch (error) {
      alert("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Kayıt Ol</h2>
        
        {/* 4. Yeni input alanlarını forma ekle */}
        <input
          type="text"
          placeholder="Kullanıcı Adı *"
          value={kullanici_adi}
          onChange={(e) => setKullaniciAdi(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="İsim *"
          value={isim}
          onChange={(e) => setIsim(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Soyisim *"
          value={soyisim}
          onChange={(e) => setSoyisim(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-Posta Adresi *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Şehir (Opsiyonel)"
          value={sehir}
          onChange={(e) => setSehir(e.target.value)}
        />

        <button type="submit">Kayıt Ol</button>
        <p>
          Zaten bir hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
