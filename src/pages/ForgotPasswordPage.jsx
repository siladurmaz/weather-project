import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('İsteğiniz işleniyor...');
    try {
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Şifremi Unuttum</h2>
        <p>Lütfen kayıtlı e-posta adresinizi girin. Size bir sıfırlama linki göndereceğiz.</p>
        <input
          type="email"
          placeholder="E-posta Adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Sıfırlama Linki Gönder</button>
        {message && <p style={{ marginTop: '15px' }}>{message}</p>}
        <p>
          Giriş sayfasına dönmek için <Link to="/login">tıklayın</Link>.
        </p>
      </form>
    </div>
  );
}
export default ForgotPasswordPage;