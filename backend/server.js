// backend/server.js

// =================================================================
// 1. GEREKLİ KÜTÜPHANELERİ IMPORT ET
// =================================================================
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// =================================================================
// 2. GENEL AYARLAR VE YAPILANDIRMA
// =================================================================
const app = express();

// CORS Ayarları (Tüm API endpoint'lerinden önce gelmeli)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS tarafından izin verilmedi!'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // JSON body-parser

// Veritabanı Bağlantısı
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "weather_app_db",
});

db.connect((err) => {
  if (err) {
    console.error("Veritabanı bağlantı hatası: ", err);
    return;
  }
  console.log("MySQL veritabanına başarıyla bağlanıldı.");
});

// E-posta Gönderici (Transporter) Ayarları - GLOBAL OLARAK TANIMLANMALI
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'projem.hava.durumu@gmail.com', // Kendi Gmail adresini yaz
        pass: 'jxbrrrkwhsmmxlwc'             // Kendi 16 haneli uygulama şifreni yaz
    }
});

// =================================================================
// 3. API UÇ NOKTALARI (ENDPOINTS)
// =================================================================

// --- KAYIT OLMA (REGISTER) ENDPOINT'İ ---
app.post('/api/register', async (req, res) => {
  try {
    const { kullanici_adi, isim, soyisim, email, password, sehir } = req.body;

    if (!kullanici_adi || !isim || !soyisim || !email || !password) {
        return res.status(400).json({ message: 'Kullanıcı adı, isim, soyisim, e-posta ve şifre alanları zorunludur.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (kullanici_adi, isim, soyisim, email, password, sehir) VALUES (?, ?, ?, ?, ?, ?)',
      [kullanici_adi, isim, soyisim, email, hashedPassword, sehir],
      (err, result) => {
        if (err) {
          console.error("VERİTABANI KAYIT HATASI:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            const errorMessage = err.message.includes('email') ? 'Bu e-posta adresi zaten kullanılıyor!' : 'Bu kullanıcı adı zaten alınmış!';
            return res.status(400).json({ message: errorMessage });
          }
          return res.status(500).json({ message: 'Veritabanına kayıt sırasında bir hata oluştu.' });
        }
        res.status(201).json({ message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' });
      }
    );
  } catch (error) {
    console.error("SUNUCU HATASI (REGISTER):", error);
    res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
  }
});

// --- GİRİŞ YAPMA (LOGIN) ENDPOINT'İ ---
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-posta ve şifre alanları zorunludur." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("VERİTABANI HATASI (LOGIN):", err);
      return res.status(500).json({ message: "Veritabanı hatası" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı." });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Yanlış şifre!" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, "superSecretKey123", { expiresIn: "1h" });

    res.json({
        message: 'Giriş başarılı!',
        token: token,
        user: { id: user.id, email: user.email, isim: user.isim, sehir: user.sehir } 
    });
  });
});

// --- ŞİFRE SIFIRLAMA TALEBİ (FORGOT-PASSWORD) ENDPOINT'İ ---
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(200).json({ message: 'Eğer e-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.' });
        }
        const user = results[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 saat

        db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, user.id], (updateErr) => {
            if (updateErr) {
                console.error('Reset token güncelleme hatası:', updateErr);
                return res.status(200).json({ message: 'Eğer e-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.' });
            }
            const resetLink = `http://localhost:5173/reset-password/${token}`;
            const mailOptions = {
                from: 'projem.hava.durumu@gmail.com', // Kendi Gmail adresini yaz
                to: user.email,
                subject: 'Hava Durumu Uygulaması - Şifre Sıfırlama Talebi',
                html: `<p>Merhaba ${user.isim},</p><p>Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayın. Bu link 1 saat geçerlidir.</p><a href="${resetLink}">Şifremi Sıfırla</a>`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) { console.error('E-posta gönderme hatası:', error); }
                res.status(200).json({ message: 'Eğer e-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.' });
            });
        });
    });
});

// --- YENİ ŞİFREYİ KAYDETME (RESET-PASSWORD) ENDPOINT'İ ---
app.post('/api/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.' });
        }
        const user = results[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Şifre güncellenirken bir hata oluştu.' });
            }
            res.status(200).json({ message: 'Şifreniz başarıyla güncellendi!' });
        });
    });
});

// =================================================================
// 4. SUNUCUYU BAŞLATMA
// =================================================================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});

// 1. KULLANICININ ARAMA GEÇMİŞİNİ GETİRME
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    
    // Son 5 benzersiz aramayı getir
    const query = `
        SELECT DISTINCT sehir 
        FROM arama_gecmisi 
        WHERE kullanici_id = ? 
        ORDER BY arama_tarihi DESC 
        LIMIT 5
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Arama geçmişi alınırken hata:", err);
            return res.status(500).json({ message: "Sunucu hatası" });
        }
        res.json(results);
    });
});


// 2. YENİ BİR ARAMAYI KAYDETME
app.post('/api/history', (req, res) => {
    const { userId, city } = req.body;

    if (!userId || !city) {
        return res.status(400).json({ message: "Kullanıcı ID ve şehir gereklidir." });
    }

    const query = 'INSERT INTO arama_gecmisi (kullanici_id, sehir) VALUES (?, ?)';
    db.query(query, [userId, city], (err, result) => {
        if (err) {
            console.error("Arama kaydedilirken hata:", err);
            return res.status(500).json({ message: "Sunucu hatası" });
        }
        res.status(201).json({ message: "Arama başarıyla kaydedildi." });
    });
});