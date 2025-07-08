// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  // State'i 'username'den 'email'e çevirin.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Backend'e 'username' yerine 'email' gönderin.
        body: JSON.stringify({ email, password }),
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
        {/* Input'u e-posta için güncelleyin */}
        <input
          type="email"
          placeholder="E-posta Adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
    <p>
    <Link to="/forgot-password">Şifremi Unuttum</Link>
</p>
      </form>
    </div>
  );
}

export default LoginPage;