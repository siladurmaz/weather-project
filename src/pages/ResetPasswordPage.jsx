import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
  const { token } = useParams(); // URL'den token'ı al
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Şifreler uyuşmuyor!');
      return;
    }
    setMessage('Şifreniz güncelleniyor...');

    try {
      const response = await fetch(`http://localhost:3001/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setTimeout(() => navigate('/login'), 3000); // 3 saniye sonra login'e yönlendir
      }
    } catch (error) {
      setMessage('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Yeni Şifre Belirle</h2>
        <input
          type="password"
          placeholder="Yeni Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Yeni Şifre (Tekrar)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Şifreyi Güncelle</button>
        {message && <p style={{ marginTop: '15px' }}>{message}</p>}
      </form>
    </div>
  );
}
export default ResetPasswordPage;