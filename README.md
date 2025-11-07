# Grafik Hesap Makinesi

Modern ve güçlü bir grafik hesap makinesi uygulaması. Desmos benzeri matematiksel grafik çizim aracı.

## Özellikler

- 📊 **Çoklu Fonksiyon Desteği**: Birden fazla fonksiyonu aynı anda çizme
- 🎨 **Parametrik Denklemler**: x(t), y(t) formatında parametrik denklemler
- 📐 **Polar Koordinatlar**: r = f(θ) formatında polar denklemler
- 🔢 **İmplicit Denklemler**: x² + y² = r² gibi implicit denklemler
- 📈 **Eşitsizlikler**: y > f(x) gibi eşitsizlik bölgeleri
- 🎛️ **Parametre Kontrolleri**: Slider'lar ile gerçek zamanlı parametre değişimi
- 📊 **Değer Tabloları**: Fonksiyon değer tabloları ve CSV export
- 🎯 **Türev ve İntegral**: Türev hesaplama ve teğet çizgisi
- 📥 **Export**: PNG ve SVG formatında grafik export
- 💾 **Kalıcılık**: Local Storage ile otomatik kayıt
- ⌨️ **Klavye Kısayolları**: Hızlı erişim için kısayollar
- 📱 **Responsive**: Mobil, tablet ve desktop desteği
- 🌓 **Dark Mode**: Açık/koyu tema desteği

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## Production Build

```bash
npm run build
```

Build dosyaları `dist` klasörüne oluşturulacaktır.

## Vercel Deployment

### Hızlı Deploy

1. **Vercel CLI ile:**
```bash
npm install -g vercel
vercel
```

2. **GitHub ile:**
   - Projeyi GitHub'a push edin
   - [Vercel](https://vercel.com) hesabınıza giriş yapın
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin
   - Vercel otomatik olarak yapılandırmayı algılayacaktır
   - "Deploy" butonuna tıklayın

### Yapılandırma

Vercel otomatik olarak şu ayarları algılar:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

Gerekirse `.env` dosyası oluşturun veya Vercel dashboard'dan environment variables ekleyin.

### Custom Domain

Vercel dashboard'dan custom domain ekleyebilirsiniz.

## Kullanım

### Temel Fonksiyonlar

- `x^2` - Parabol
- `sin(x)` - Sinüs dalgası
- `cos(x)` - Kosinüs dalgası
- `exp(x)` - Üstel fonksiyon
- `log(x)` - Logaritma
- `sqrt(x)` - Karekök
- `abs(x)` - Mutlak değer

### Parametrik Denklemler

```
x=cos(t), y=sin(t)  // Daire
x=2*cos(t), y=3*sin(t)  // Elips
```

### Polar Koordinatlar

```
r = 2*sin(t)  // Kardiyoid
r = 1 + cos(t)  // Limaçon
```

### İmplicit Denklemler

```
x^2 + y^2 = 25  // Daire
x^2/4 + y^2/9 = 1  // Elips
```

### Eşitsizlikler

```
y > x^2  // Parabol üzerindeki bölge
y < sin(x)  // Sinüs altındaki bölge
```

## Klavye Kısayolları

- `Ctrl+N` veya `Alt+E`: Yeni fonksiyon ekle
- `Ctrl++`: Yakınlaştır
- `Ctrl+-`: Uzaklaştır
- `Ctrl+A`: Tüm grafikleri ekrana sığdır
- `Delete`: Odaklı expression'ı sil (input boşken)

## Teknolojiler

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **mathjs** - Matematiksel hesaplamalar
- **Vite** - Build tool

## Lisans

MIT
