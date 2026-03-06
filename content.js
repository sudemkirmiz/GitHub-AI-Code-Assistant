// ============================================================
// GitHub AI Code Assistant — Content Script (Orkestra Şefi)
// Bu dosya sadece iş akışını yönetir: SPA algılama,
// chrome.runtime.sendMessage ve diğer modülleri koordine eder.
//
// Bağımlılıklar (global scope üzerinden):
//   utils/markdown.js  → simpleMarkdownToHTML()
//   utils/github.js    → getPageType(), getFileNameFromURL(),
//                         getRepoNameFromURL(), getGitHubSourceCode(),
//                         getRepoFileSummary()
//   core/prompts.js    → getPromptForAction(), getDetailedPrompt(),
//                         getRepoAnalyzePrompt()
//   ui/panel.js        → injectStyles(), createPanel(), createRepoPanel(),
//                         togglePanel(), openFullscreen(), closeFullscreen(),
//                         lockAllButtons(), unlockAllButtons(),
//                         injectDetailButton(), removePanel(),
//                         resetPanelState(), ensureFullscreenOverlay()
// ============================================================

console.log("[GitHub AI Code Assistant] Content script yüklendi:", window.location.href);

// ============================================================
// FILE MODE: Unified Action Handler
// ============================================================

function handleAction(btn, action) {
    const resultBox = document.getElementById('ai-result-box');
    const resultHeader = document.getElementById('ai-result-header');

    // Varsa eski detay butonunu kaldır
    const oldDetailBtn = document.getElementById('ai-detail-btn');
    if (oldDetailBtn) oldDetailBtn.remove();

    // --- Loading State ---
    lockAllButtons(btn);
    resultHeader.style.display = 'flex';
    resultBox.style.display = 'block';
    resultBox.className = '';
    resultBox.textContent = '⏳ Ollama\'dan yanıt bekleniyor...';

    try {
        // --- Kodu Çek ---
        const rawCode = getGitHubSourceCode();

        if (!rawCode) {
            resultBox.className = 'error';
            resultBox.textContent = '❌ Sayfada okunabilir kod bulunamadı.';
            unlockAllButtons();
            return;
        }

        // --- Aksiyona Göre Prompt Oluştur ---
        const prompt = getPromptForAction(action, rawCode);

        console.log('[Content] Ollama\'ya gönderiliyor (' + rawCode.length + ' karakter, aksiyon: ' + action + ')...');

        // --- Background.js'e Mesaj Gönder ---
        chrome.runtime.sendMessage(
            { type: 'OLLAMA_REQUEST', prompt: prompt },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[Content] Mesaj hatası:', chrome.runtime.lastError.message);
                    resultBox.className = 'error';
                    resultBox.textContent = '❌ Eklenti hatası: ' + chrome.runtime.lastError.message;
                    unlockAllButtons();
                    return;
                }

                if (response && response.success) {
                    resultBox.className = '';
                    resultBox.innerHTML = simpleMarkdownToHTML(response.reply);
                    // Detay butonu SADECE explain aksiyonunda
                    if (action === 'explain') {
                        injectDetailButton(rawCode);
                    }
                } else {
                    resultBox.className = 'error';
                    resultBox.textContent = '❌ ' + (response && response.error ? response.error : 'Bilinmeyen bir hata oluştu.');
                }

                unlockAllButtons();
            }
        );
    } catch (err) {
        console.error('[Content] ' + action + ' hatası:', err);
        resultBox.className = 'error';
        resultBox.textContent = '❌ Beklenmeyen hata: ' + err.message;
        unlockAllButtons();
    }
}

// ============================================================
// FILE MODE: Detaylı Analiz Handler
// ============================================================

function handleDetailedExplain(detailBtn, rawCode) {
    const resultBox = document.getElementById("ai-result-box");
    if (!resultBox) return;

    // Tüm butonları kilitle
    lockAllButtons(detailBtn);
    detailBtn.disabled = true;
    detailBtn.textContent = "⏳ Detaylı Analiz Ediliyor...";
    resultBox.className = "";
    resultBox.textContent = "⏳ Detaylı analiz hazırlanıyor, lütfen bekleyin...";

    const prompt = getDetailedPrompt(rawCode);

    console.log("[Content] Detaylı analiz Ollama'ya gönderiliyor...");

    try {
        chrome.runtime.sendMessage(
            { type: "OLLAMA_REQUEST", prompt: prompt },
            (response) => {
                if (chrome.runtime.lastError) {
                    resultBox.className = "error";
                    resultBox.textContent = "❌ Eklenti hatası: " + chrome.runtime.lastError.message;
                    detailBtn.remove();
                    unlockAllButtons();
                    return;
                }

                if (response && response.success) {
                    resultBox.className = "";
                    resultBox.innerHTML = simpleMarkdownToHTML(response.reply);
                } else {
                    resultBox.className = "error";
                    resultBox.textContent = "❌ " + (response && response.error ? response.error : "Bilinmeyen bir hata oluştu.");
                }

                // Detay butonunu kaldır, tüm butonları aç
                detailBtn.remove();
                unlockAllButtons();
            }
        );
    } catch (err) {
        console.error("[Content] Detaylı analiz hatası:", err);
        resultBox.className = "error";
        resultBox.textContent = "❌ Beklenmeyen hata: " + err.message;
        detailBtn.remove();
        unlockAllButtons();
    }
}

// ============================================================
// REPO MODE: Repo Analiz Handler
// ============================================================

function handleRepoAnalyze() {
    const analyzeBtn = document.getElementById('repo-analyze-btn');
    const labelSpan = analyzeBtn ? analyzeBtn.querySelector('.btn-label') : null;
    const resultBox = document.getElementById('ai-result-box');
    const resultHeader = document.getElementById('ai-result-header');
    if (!analyzeBtn || !resultBox) return;

    // Loading state
    analyzeBtn.disabled = true;
    analyzeBtn._loading = true;
    if (labelSpan) labelSpan.textContent = '⏳ Analiz Ediliyor...';
    resultHeader.style.display = 'flex';
    resultBox.style.display = 'block';
    resultBox.className = '';
    resultBox.textContent = '⏳ Repo analiz ediliyor, lütfen bekleyin...';

    function resetRepoBtn() {
        analyzeBtn.disabled = false;
        analyzeBtn._loading = false;
        if (labelSpan) labelSpan.textContent = analyzeBtn.dataset.labelEn || '🔍 Analyze Repository';
    }

    try {
        const repoSummary = getRepoFileSummary();

        if (!repoSummary) {
            resultBox.className = 'error';
            resultBox.textContent = '❌ Repo dosya ağacı DOM\'dan okunamadı. Sayfa tam yüklenmiş olmalı.';
            resetRepoBtn();
            return;
        }

        const repoName = getRepoNameFromURL();
        const prompt = getRepoAnalyzePrompt(repoName, repoSummary);

        console.log('[Content] Repo analizi Ollama\'ya gönderiliyor: ' + repoSummary);

        chrome.runtime.sendMessage(
            { type: 'OLLAMA_REQUEST', prompt: prompt },
            (response) => {
                if (chrome.runtime.lastError) {
                    resultBox.className = 'error';
                    resultBox.textContent = '❌ Eklenti hatası: ' + chrome.runtime.lastError.message;
                    resetRepoBtn();
                    return;
                }

                if (response && response.success) {
                    resultBox.className = '';
                    resultBox.innerHTML = simpleMarkdownToHTML(response.reply);
                } else {
                    resultBox.className = 'error';
                    resultBox.textContent = '❌ ' + (response && response.error ? response.error : 'Bilinmeyen bir hata oluştu.');
                }

                resetRepoBtn();
            }
        );
    } catch (err) {
        console.error('[Content] Repo analiz hatası:', err);
        resultBox.className = 'error';
        resultBox.textContent = '❌ Beklenmeyen hata: ' + err.message;
        resetRepoBtn();
    }
}

// ============================================================
// Sayfa Türü Kontrol ve Panel Yönetimi
// ============================================================

let lastFilePath = "";
let currentMode = null;

function checkAndManagePanel() {
    const pageType = getPageType();

    if (pageType === "FILE_MODE") {
        const pathname = window.location.pathname;
        // Mod değiştiyse (repo -> file) eski paneli sil
        if (currentMode !== "FILE_MODE") {
            removePanel();
            currentMode = "FILE_MODE";
            lastFilePath = pathname;
            createPanel();
        } else if (!document.getElementById("gh-ai-panel")) {
            lastFilePath = pathname;
            createPanel();
        } else if (pathname !== lastFilePath) {
            lastFilePath = pathname;
            resetPanelState();
        }
    } else if (pageType === "REPO_MODE") {
        const pathname = window.location.pathname;
        if (currentMode !== "REPO_MODE") {
            removePanel();
            currentMode = "REPO_MODE";
            lastFilePath = pathname;
            createRepoPanel();
        } else if (!document.getElementById("gh-ai-panel")) {
            lastFilePath = pathname;
            createRepoPanel();
        } else if (pathname !== lastFilePath) {
            // Farklı repo'ya geçildi
            lastFilePath = pathname;
            removePanel();
            createRepoPanel();
        }
    } else {
        // Ne file ne repo sayfası
        currentMode = null;
        lastFilePath = "";
        removePanel();
    }
}

// ============================================================
// SPA Route Değişimi Algılama (Gelişmiş)
// ============================================================

let lastURL = window.location.href;

// --- History API Override ---
const originalPushState = history.pushState;
history.pushState = function (...args) {
    originalPushState.apply(this, args);
    onURLChange();
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    onURLChange();
};

window.addEventListener("popstate", onURLChange);

// --- GitHub SPA Event Listeners (Turbo / Soft Navigation) ---
document.addEventListener("turbo:render", () => {
    console.log("[Content] turbo:render algılandı");
    onURLChange();
});

document.addEventListener("soft-nav:end", () => {
    console.log("[Content] soft-nav:end algılandı");
    onURLChange();
});

function onURLChange() {
    const currentURL = window.location.href;
    if (currentURL !== lastURL) {
        lastURL = currentURL;
        console.log("[Content] URL değişimi algılandı:", currentURL);
        // DOM'un yüklenmesini bekle
        setTimeout(checkAndManagePanel, 600);
    }
}

// Fallback: interval ile URL kontrolü
setInterval(() => {
    const currentURL = window.location.href;
    if (currentURL !== lastURL) {
        lastURL = currentURL;
        console.log("[Content] URL değişimi algılandı (interval):", currentURL);
        setTimeout(checkAndManagePanel, 600);
    }
}, 1000);

// ============================================================
// İlk Yükleme
// ============================================================
injectStyles();
checkAndManagePanel();
