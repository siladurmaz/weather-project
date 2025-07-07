// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => { // Fonksiyonu async yap
    e.preventDefault();
    if (!username || !password) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message); // Sunucudan gelen hata mesajını göster
      } else {
        alert(data.message);
        navigate('/login');
      }
    } catch (error) {
      alert('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Kayıt Ol</h2>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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