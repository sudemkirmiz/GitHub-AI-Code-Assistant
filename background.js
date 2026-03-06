// GitHub AI Code Assistant - Background Service Worker
// Content script'ten gelen mesajları dinler ve Ollama API'ye iletir.

const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "gpt-oss:120b-cloud";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OLLAMA_REQUEST") {
    console.log("[Background] Ollama isteği alındı:", message.prompt);

    // Ollama API'ye istek at (async IIFE)
    (async () => {
      try {
        const response = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL_NAME,
            prompt: message.prompt,
            stream: false
          })
        });

        // --- Akıllı Hata Yönetimi ---
        if (!response.ok) {
          // 403 - CORS / Forbidden hatası
          if (response.status === 403) {
            sendResponse({
              success: false,
              error: "Ollama CORS Hatası: Lütfen Windows Ortam Değişkenlerine OLLAMA_ORIGINS='*' ekleyip Ollama'yı yeniden başlatın."
            });
            return;
          }

          // 404 - Model bulunamadı
          if (response.status === 404) {
            sendResponse({
              success: false,
              error: `Model bulunamadı: "${MODEL_NAME}". Lütfen "ollama pull ${MODEL_NAME}" komutu ile modeli yükleyin.`
            });
            return;
          }

          // Diğer HTTP hataları
          throw new Error(`Ollama HTTP Hatası: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[Background] Ollama yanıtı alındı.");
        sendResponse({ success: true, reply: data.response });

      } catch (error) {
        console.error("[Background] Ollama hatası:", error.message);

        let errorMessage = error.message;
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Ollama'ya bağlanılamadı. Lütfen Ollama'nın çalıştığından emin olun (http://localhost:11434).";
        }

        sendResponse({ success: false, error: errorMessage });
      }
    })();

    // Asenkron yanıt için true döndür (ZORUNLU)
    return true;
  }
});

console.log("[GitHub AI Code Assistant] Background service worker başlatıldı.");
