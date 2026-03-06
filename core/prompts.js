// ============================================================
// GitHub AI Code Assistant — LLM Prompt Şablonları
// Tüm File Mode ve Repo Mode promptları burada tanımlıdır.
// ============================================================

// --- File Mode: Aksiyona Göre Prompt Üret ---
function getPromptForAction(action, rawCode) {
    const prompts = {
        explain: "Aşağıdaki kodun ne yaptığını KISA ve NET bir şekilde özetle. Sadece en önemli işlevini söyle. Maksimum 6 kısa madde kullan. Kesinlikle gereksiz detay verme ve destan yazma. Yanıtı Türkçe ve Markdown formatında ver.\n\nKod:\n" + rawCode,

        quality: "Sen kıdemli bir yazılım mimarısın. Aşağıdaki kodu analiz et ve kalitesini puanla. Sadece şu formatta (Markdown) ÇOK KISA bir yanıt ver:\n**Genel Puan:** (0-100 arası bir sayı)\n**Okunabilirlik:** (Düşük/Orta/Yüksek)\n**Sürdürülebilirlik:** (Düşük/Orta/Yüksek)\n**En Büyük Problem:** (Tek cümlelik açıklama)\nKod:\n" + rawCode,

        security: "Sen uzman bir siber güvenlik analistisin. Aşağıdaki kodu güvenlik açıklarına karşı tara. Sadece şu formatta (Markdown) ÇOK KISA bir yanıt ver:\n**Risk Seviyesi:** (Düşük/Orta/Yüksek)\n**Ana Risk:** (Eğer varsa en kritik açığı tek cümleyle yaz. Yoksa 'Güvenli görünüyor' de.)\n**Öneri:** (Açığı kapatmak için tek cümlelik tavsiye)\nKod:\n" + rawCode,

        refactor: "Sen kıdemli bir yazılım mühendisisin. Aşağıdaki kodu daha temiz, hızlı veya modern hale getirmek için iyileştirme önerileri sun. Destan yazma, ÇOK KISA ve NET ol. Yanıt formatı (Markdown):\n**1. Öneri:** (Kısa açıklama)\n**2. Öneri:** (Kısa açıklama)\n**Örnek Kod:** (Eğer gerekiyorsa, en kritik iyileştirmenin kısa bir kod bloğu (```) örneği)\nKod:\n" + rawCode
    };
    return prompts[action] || prompts.explain;
}

// --- File Mode: Detaylı Analiz Promptu ---
function getDetailedPrompt(rawCode) {
    return "Sen kıdemli bir yazılım mühendisisin. Aşağıdaki içeriği (bu bir kod, config dosyası veya README olabilir) ÇOK DETAYLI bir şekilde analiz et. Eğer bu bir kodsa mimarisini, olası edge-case'leri ve mantığını açıkla. Eğer bu bir README veya metin dosyasıysa, projenin ne işe yaradığını, nasıl kurulduğunu ve mimarisini derinlemesine özetle. KESİNLİKLE 'kodun tamamını göremiyorum' gibi itirazlarda bulunma, sadece sana verilen bu metni analiz et. Çıktıyı başlıklar (##) ve gerekirse kod blokları (```) kullanarak zenginleştirilmiş Markdown formatında ver.\n\nİçerik:\n" + rawCode;
}

// --- Repo Mode: Repo Analiz Promptu ---
function getRepoAnalyzePrompt(repoName, repoSummary) {
    return "Sen bir Baş Yazılım Mimarı (Chief Architect)'sın. Aşağıda bir GitHub projesinin (" + repoName + ") kök dizinindeki en önemli dosyaların listesi var. Sadece bu dosya adlarına, uzantılarına ve mimariye bakarak projenin ne işe yaradığını tahmin et.\nYANITI KESİNLİKLE TAMAMEN TÜRKÇE VER. Maksimum 150 kelime kullan. Destan yazma. Çıktı formatı (Markdown) KESİN ŞU OLMALI:\n**Proje Tipi:** (Örn: React Web App, Python CLI vb.)\n**Genel Kalite Puanı:** (0-100 arası tahmin)\n**En Güçlü Yanı:** (Mimari açıdan en güçlü yanı)\n**Zayıf Yanı:** (Eksik görünen yanı)\n**Güvenlik Riski:** (Düşük/Orta/Yüksek)\n\nDosya Ağacı Özeti: " + repoSummary;
}
