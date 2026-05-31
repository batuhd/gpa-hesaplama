<div align="center">

<img src="public/logo.png" alt="GPA Hesaplama Logo" width="80" height="80">

# 📚 GPA Hesaplama

**Modern, hızlı ve kullanımı kolay GPA (Genel Not Ortalaması) hesaplama uygulaması.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Destekli-5A0FC8?logo=pwa&logoColor=white)]()

[🌐 Canlı Demo](https://gpa.batuhdede.me) · [🐛 Hata Bildir](https://github.com/batuhd/gpa-hesaplama/issues)

</div>

---

## ✨ Özellikler

### 🎯 Temel Özellikler
- **📊 GPA/GNO Hesaplama** - Dönemlik ve genel not ortalamanızı anlık hesaplayın
- **📝 Ders & Sınav Yönetimi** - Ders ekleyin, sınav ağırlıklarını ve notlarını girin
- **📜 Transkript Görünümü** - Tüm dönemlerinizi ve notlarınızı şık bir transkript formatında görüntüleyin
- **💾 Otomatik Kayıt** - Tüm verileriniz tarayıcınızda (localStorage) otomatik saklanır

### 🚀 Gelişmiş Özellikler
- **📋 Üniversite Sayfasından İçe Aktar** - Altınbaş Üniversitesi sınav sonuçları sayfasından tüm dersleri tek seferde kopyala-yapıştır ile otomatik ekleyin
- **🎯 Final Notu Hesaplayıcı** - Hedef harf notunuz için almanız gereken final notunu hesaplayın
- **🔮 Senaryo Hesaplayıcı** - "Ödevden 10 puan fazla alırsam harf notum ne olur?" gibi senaryoları anında test edin
- **📱 PWA Desteği** - Uygulamayı telefonunuza "Ana Ekrana Ekle" ile kurun ve offline çalışın
- **📤 Yedekleme & Geri Yükleme** - Verilerinizi JSON olarak dışa aktarın ve geri yükleyin
- **⚠️ Final Baraj Kontrolü** - Final barajını geçemediğiniz dersler otomatik FF olarak işaretlenir

---

## 📸 Site Yapısı

<div align="center">

| Sınav Sonuçları | Transkript | Hesaplayıcılar |
|:---:|:---:|:---:|
| *Derslerinizi ve sınav notlarınızı görüntüleyin* | *Dönemlik ve genel ortalamanızı takip edin* | *Final notu ve senaryo hesaplayıcıları* |

| Veri Yönetimi | Üniversiteden İçe Aktar |
|:---:|:---:|
| *Yedekleme, sıfırlama ve içe aktarma* | *Sayfadan kopyala-yapıştır ile otomatik ekleme* |

</div>

---

## 🚀 Başlangıç

### Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üstü)
- npm veya yarn

### Kurulum

```bash
# Repoyu klonlayın
git clone https://github.com/batuhd/gpa-hesaplama.git

# Proje dizinine gidin
cd gpa-hesaplama

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

### Build

```bash
# Production build oluşturun
npm run build

# Preview ile test edin
npm run preview
```

---

## 📖 Kullanım

### Manuel Ders Ekleme
1. **"+ Ders Ekle"** butonuna tıklayın
2. Ders kodu, adı, kredi, AKTS ve dönem bilgilerini girin
3. Sınavlarınızı ekleyin (isim, tür, ağırlık ve not)
4. **Kaydet** butonuna tıklayın

### Üniversite Sayfasından İçe Aktarma (Altınbaş)
1. Üniversitenizin **Sınav Sonuçları** sayfasına gidin
2. Tüm sayfa içeriğini seçip kopyalayın (`Ctrl+A`, `Ctrl+C`)
3. Uygulamada **"Sayfadan Yapıştır"** butonuna tıklayın
4. Metni yapıştırın ve **"Önizle"** butonuna tıklayın
5. Çakışma varsa **"Üzerine Yaz"** veya **"Yeni Ekle"** seçeneğini belirleyin
6. **"Ekle"** butonuna tıklayın

> 💡 **İpucu:** Eğitim yılı ve dönem bilgisi metinden otomatik tespit edilir.

### Not Hesaplama
- Sınav notları girildikçe harf notu ve GPA otomatik hesaplanır
- Final barajı belirlediğinizde, barajı geçemeyen dersler otomatik **FF** olarak işaretlenir

---

## 🛠️ Teknolojiler

| Teknoloji | Açıklama |
|-----------|----------|
| ⚛️ **React 19** | Kullanıcı arayüzü kütüphanesi |
| ⚡ **Vite 8** | Ultra hızlı build aracı |
| 🎨 **Tailwind CSS 3** | Utility-first CSS framework |
| 📱 **vite-plugin-pwa** | Progressive Web App desteği |
| 💾 **localStorage** | Tarayıcı tarafı veri saklama |
| 🔒 **Crypto API** | Güvenli ID oluşturma |

---

## 📁 Proje Yapısı

```
gpa-hesaplama/
├── public/                    # Statik dosyalar (logo, ikonlar, manifest)
├── src/
│   ├── components/
│   │   ├── Alert.jsx           # Toast bildirim bileşeni
│   │   ├── Ayarlar.jsx         # Ayarlar sayfası
│   │   ├── DersModal.jsx       # Ders ekleme/düzenleme modalı
│   │   ├── DersTablosu.jsx     # Sınav sonuçları tablosu
│   │   ├── Hesaplayicilar.jsx  # Final & senaryo hesaplayıcıları
│   │   ├── Layout.jsx          # Ana layout (sidebar + top bar)
│   │   ├── PasteModal.jsx      # Üniversite sayfasından yapıştırma modalı
│   │   ├── Transkript.jsx      # Transkript görünümü
│   │   └── VeriYonetimi.jsx    # Veri yönetimi (yedekleme, sıfırlama)
│   ├── utils/
│   │   ├── altinbasParser.js   # Altınbaş üni. sayfası metin parser'ı
│   │   ├── grades.js           # Not hesaplama ve harf notu mantığı
│   │   └── storage.js          # localStorage okuma/yazma
│   ├── App.jsx                 # Ana uygulama bileşeni
│   ├── index.css               # Tailwind + özel stiller
│   └── main.jsx                # Uygulama giriş noktası
├── index.html                  # HTML şablonu
├── package.json                # Bağımlılıklar
└── vite.config.js              # Vite yapılandırması
```

---

## 🎓 Not Sistemi

| Harf Notu | Katsayı | Minimum Puan |
|:---:|:---:|:---:|
| AA | 4.0 | 90 |
| BA | 3.5 | 80 |
| BB | 3.0 | 70 |
| CB | 2.5 | 60 |
| CC | 2.0 | 55 |
| DC | 1.5 | 50 |
| DD | 1.0 | 45 |
| FF | 0.0 | < 45 |

> ℹ️ **S**, **M**, **U**, **EX** gibi notlar ortalamaya dahil edilmez.

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Bir hata bulursanız veya yeni bir özellik önermek isterseniz:

1. Fork'layın 🍴
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: amazing feature'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın 📬

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<div align="center">

**Sinop'ta ❤️ ile yapıldı**

[![](https://img.shields.io/badge/GitHub-batuhd-181717?logo=github&logoColor=white)](https://github.com/batuhd)

</div>
