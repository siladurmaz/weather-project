// backend/server.js

// 1. Gerekli kütüphaneleri import et
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 2. Express uygulamasını oluştur
const app = express();
app.use(cors()); // Farklı portlardan gelen isteklere izin ver
app.use(express.json()); // Gelen isteklerin body'sini (JSON) okuyabilmek için

// 3. MySQL veritabanı bağlantısını kur
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // XAMPP için varsayılan kullanıcı adı
  password: '', // XAMPP için varsayılan şifre boş
  database: 'weather_app_db'
});

// 4. API Uç Noktalarını (Endpoints) oluşturma

// KAYIT OLMA (REGISTER) UÇ NOKTASI
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Şifreyi hash'le (güvenli hale getir)
    const hashedPassword = await bcrypt.hash(password, 10); // 10, hash'leme gücüdür

    // Kullanıcıyı veritabanına ekle
    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          // "Duplicate entry" hatası, kullanıcı adının zaten var olduğunu gösterir
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış!' });
          }
          return res.status(500).json({ message: 'Veritabanı hatası' });
        }
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GİRİŞ YAPMA (LOGIN) UÇ NOKTASI
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
        return res.status(500).json({ message: 'Veritabanı hatası' });
    }
    if (results.length === 0) {
        return res.status(404).json({ message: 'Böyle bir kullanıcı bulunamadı.' });
    }
    
    const user = results[0];
    // Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Yanlış şifre!' });
    }

    // Şifre doğruysa, bir JWT (JSON Web Token) oluştur ve kullanıcıya gönder
    const token = jwt.sign({ id: user.id, username: user.username }, 'superSecretKey123', { expiresIn: '1h' });

    res.json({ message: 'Giriş başarılı!', token: token, user: {id: user.id, username: user.username} });
  });
});


// 5. Sunucuyu dinlemeye başla
const PORT = 3001; // React uygulaması genellikle 5173'te çalışır, bu yüzden farklı bir port seçiyoruz
app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});