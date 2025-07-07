// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => { // <-- DÜZELTME BURADA
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
    } else {
      // Sunucudan gelen token'ı localStorage'e kaydet
      localStorage.setItem('token', data.token);
      onLogin(data.user); // App.jsx'e kullanıcı bilgisini gönder
      navigate('/');
    }
  } catch (error) {
    alert('Sunucuya bağlanırken bir hata oluştu.');
  }
};

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Giriş Yap</h2>
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
        <button type="submit">Giriş Yap</button>
        <p>
          Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;