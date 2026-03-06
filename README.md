<p align="center">
  <img src="https://img.shields.io/badge/Platform-Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/AI%20Motoru-Ollama-000000?style=for-the-badge" alt="Ollama" />
  <img src="https://img.shields.io/badge/Kod-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Lisans-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">🤖 GitHub AI Code Assistant</h1>

<p align="center">
  <strong>%100 Yerel, Gizlilik Odaklı GitHub Kod Asistanı — Ollama Destekli.</strong><br/>
  Kodlarınızı analiz edin, kalite puanlayın, güvenlik taraması yapın ve iyileştirme önerileri alın — hiçbir veri makinenizden çıkmadan.
</p>

<p align="center">
  <a href="#-özellikler">Özellikler</a> •
  <a href="#-ön-gereksinimler">Ön Gereksinimler</a> •
  <a href="#-kurulum">Kurulum</a> •
  <a href="#-kullanım">Kullanım</a> •
  <a href="#-proje-mimarisi">Proje Mimarisi</a> •
  <a href="#-katkıda-bulunma">Katkıda Bulunma</a> •
  <a href="#-lisans">Lisans</a>
</p>

---

## 🔥 Neden Bu Eklenti?

Çoğu AI kod asistanı, kodunuzu uzak sunuculara gönderir. **GitHub AI Code Assistant** ise tamamen sizin makinenizde, [Ollama](https://ollama.com/) üzerinde çalışır. Kodunuz **asla localhost'tan dışarı çıkmaz** — sıfır veri sızıntısı, sıfır API maliyeti, sıfır gizlilik endişesi.

---

## ✨ Özellikler

### 🔒 Gizlilik Odaklı
Tüm yapay zeka çıkarımı `localhost:11434` üzerinden Ollama ile gerçekleşir. Bulut API'si yok, telemetri yok, takip yok. **Kodunuz SİZİN makinenizde kalır.**

### 📄 Dosya Modu — Tekil Dosya Analizi
GitHub'da herhangi bir dosyayı görüntülediğinizde (`/blob/` sayfaları), şık bir yüzen panel belirir ve dört aksiyon butonu sunar:

| Aksiyon | Açıklama |
|---------|----------|
| 🔍 **Kodu Açıkla** | Kodun ne yaptığını kısa ve öz özetle, isteğe bağlı derinlemesine analiz |
| 📊 **Kod Kalitesi** | 0-100 arası kalite puanı, okunabilirlik ve sürdürülebilirlik değerlendirmesi |
| 🛡️ **Güvenlik Taraması** | Güvenlik açıklarını tara, risk seviyesi belirle |
| ♻️ **Refactor Önerileri** | Kod örnekleriyle iyileştirme tavsiyeleri al |

> 💡 "Kodu Açıkla" butonundan sonra **"🔎 Daha Ayrıntılı Açıkla"** butonu ile derinlemesine analiz alabilirsiniz (Progressive Disclosure).

### 🗂️ Repo Modu — Depo Genel Bakış
Bir deponun ana sayfasındayken eklenti otomatik olarak:
- DOM'daki dosya ağacını **sezgisel tarama (heuristic extraction)** ile okur
- Önemli dosyaları önceliklendirir (README → bağımlılıklar → giriş noktaları → kaynak kodlar)
- Gürültüyü filtreler (`.gitignore`, görseller, kilit dosyaları vb.)
- En önemli 10 dosyayı LLM'e gönderip **Baş Mimar tarzında analiz** yapar

Çıktı: **Proje Tipi**, **Kalite Puanı**, **Güçlü Yanı**, **Zayıf Yanı** ve **Güvenlik Riski** değerlendirmesi.

### ⚡ SPA Uyumlu
GitHub bir Single Page Application'dır. Bu eklenti bunu kusursuz yönetir:
- `history.pushState` / `replaceState` override'ları
- `turbo:render` ve `soft-nav:end` event listener'ları
- Interval tabanlı yedek URL kontrolü
- Dosyadan dosyaya geçişte otomatik panel sıfırlama

### 🎨 Modern Arayüz
- **Glassmorphism** koyu tema — `backdrop-filter: blur` efekti
- Hover animasyonları ile EN → TR etiket geçişleri
- Uzun analiz sonuçları için **tam ekran (fullscreen) modal**
- Panel aç/kapa için **Floating Action Button (FAB)**
- Dahili **Vanilla JS Markdown renderer** (kalın, italik, başlıklar, kod blokları, listeler)

---

## 📋 Ön Gereksinimler

### 1. Ollama Kurulumu

[Ollama](https://ollama.com/download) indirip kurun.

### 2. Model İndirme

```bash
# Önerilen model
ollama pull llama3

# Veya başka bir model
ollama pull gpt-oss:120b-cloud
ollama pull mistral
```

### 3. ⚠️ CORS Ayarı (ZORUNLU)

Chrome eklentisi, Ollama ile `localhost:11434` üzerinden iletişim kurar. Bunun çalışması için **CORS ayarı şarttır**.

<details>
<summary><strong>🪟 Windows (PowerShell)</strong></summary>

```powershell
# Geçici — sadece bu oturum için
$env:OLLAMA_ORIGINS="*"
ollama serve
```

Kalıcı yapmak için Sistem Ortam Değişkenlerinden:
- **Değişken:** `OLLAMA_ORIGINS`
- **Değer:** `*`

</details>

<details>
<summary><strong>🪟 Windows (CMD)</strong></summary>

```cmd
set OLLAMA_ORIGINS=* && ollama serve
```

</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
OLLAMA_ORIGINS="*" ollama serve

# Kalıcı yapmak için ~/.zshrc dosyasına ekleyin:
export OLLAMA_ORIGINS="*"
```

</details>

<details>
<summary><strong>🐧 Linux</strong></summary>

```bash
# Doğrudan çalıştırma:
OLLAMA_ORIGINS="*" ollama serve

# Systemd servisi olarak:
sudo systemctl edit ollama
# [Service] altına ekleyin:
# Environment="OLLAMA_ORIGINS=*"
sudo systemctl restart ollama
```

</details>

### 4. Ollama'nın Çalıştığını Doğrulama

```bash
curl http://localhost:11434/api/tags
```

Kurulu modellerinizi listeleyen bir JSON yanıtı görmelisiniz.

---

## 🚀 Kurulum

Bu eklenti Chrome Web Mağazası'nda yayınlanmamıştır. Manuel olarak yüklenmelidir:

1. **Depoyu klonlayın**
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/github-ai-code-assistant.git
   ```

2. **Chrome Eklentiler sayfasını açın**
   ```
   chrome://extensions/
   ```

3. **Geliştirici Modunu açın**
   Sağ üst köşedeki **"Geliştirici modu"** anahtarını aktifleştirin.

4. **Eklentiyi yükleyin**
   **"Paketlenmemiş öğe yükle"** butonuna tıklayın ve klonlanan proje klasörünü (`github_code_assistant/`) seçin.

5. **GitHub'a gidin**
   [github.com](https://github.com) üzerindeki herhangi bir dosyayı açın — yüzen AI panelinin belirdiğini göreceksiniz! 🎉

> ⚠️ **Hatırlatma:** Eklentiyi yüklemeden önce Ollama'nın CORS ayarıyla çalıştığından emin olun, aksi halde `403 Forbidden` hatası alırsınız.

---

## 🎯 Kullanım

### 📄 Dosya Modu
1. GitHub'da herhangi bir dosyaya gidin (herhangi bir `/blob/` URL'si)
2. Sağ üst köşede yüzen panel belirir
3. 4 aksiyon butonundan birine tıklayın
4. Yerel LLM'in yanıt vermesini bekleyin
5. Uzun sonuçlar için **⛶** butonuyla tam ekrana geçin
6. "Kodu Açıkla" sonrasında **"🔎 Daha Ayrıntılı Açıkla"** ile derinlemesine analiz alın

### 🗂️ Repo Modu
1. Herhangi bir deponun ana sayfasına gidin (örn. `github.com/user/repo`)
2. Panel otomatik olarak **Repo Modu**na geçer
3. **"🔍 Analyze Repository"** butonuna tıklayın
4. Projenin Baş Mimar tarzında özetini alın

---

## 📁 Proje Mimarisi

```
github_code_assistant/
│
├── utils/
│   ├── markdown.js          # Vanilla JS Markdown → HTML dönüştürücü
│   └── github.js            # GitHub DOM çekme, URL ayrıştırma, sayfa yönlendirici
│
├── core/
│   └── prompts.js           # Tüm LLM prompt şablonları (Dosya + Repo modları)
│
├── ui/
│   └── panel.js             # CSS enjeksiyonu, panel oluşturma, modal, buton durumu
│
├── content.js               # Orkestra Şefi: aksiyon yöneticileri, SPA algılama
├── background.js            # Service Worker: Ollama API proxy
├── manifest.json            # Chrome Extension Manifest V3 yapılandırması
│
├── icons/                   # Eklenti simgeleri
├── requirements.txt         # Sistem gereksinimleri ve CORS ayarı rehberi
├── .gitignore
├── LICENSE
└── README.md                # 📖 Şu an buradasınız!
```

### Mimari Akış

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  GitHub DOM  │────▶│  content.js  │────▶│background.js│
│  (Web Sayfa) │     │ (Orkestra    │     │  (Service   │
└─────────────┘     │   Şefi)      │     │   Worker)   │
                    └──────┬───────┘     └──────┬──────┘
                           │                     │
              ┌────────────┼────────────┐        │
              ▼            ▼            ▼        ▼
        ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────┐
        │ ui/      │ │ utils/   │ │ core/  │ │Ollama │
        │ panel.js │ │github.js │ │prompts │ │(Yerel)│
        │          │ │markdown  │ │  .js   │ │:11434 │
        └──────────┘ └──────────┘ └────────┘ └───────┘
```

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Başlamak için:

1. Depoyu **fork** edin
2. Bir **özellik dalı** oluşturun (`git checkout -b ozellik/harika-ozellik`)
3. Değişikliklerinizi **commit** edin (`git commit -m 'Harika özellik eklendi'`)
4. Dalı **push** edin (`git push origin ozellik/harika-ozellik`)
5. Bir **Pull Request** açın

### 💡 Katkı Fikirleri
- 🌍 Çoklu dil desteği (prompt şablonları)
- 🎨 Açık tema / tema değiştirici
- 📊 Kod karmaşıklık metrikleri (Cyclomatic Complexity)
- 🔧 Model seçimi için ayarlar sayfası
- 📦 Chrome Web Mağazası paketleme

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<p align="center">
  Gizliliğine önem veren geliştiriciler için ❤️ ile yapıldı.<br/>
  <strong>Senin kodun. Senin makinan. Senin yapay zekan.</strong>
</p>
