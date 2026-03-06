// ============================================================
// GitHub AI Code Assistant — UI Panel Modülü
// CSS enjeksiyonu, floating panel oluşturma, fullscreen modal,
// buton kilitleme/açma ve panel state yönetimi.
// ============================================================

// --- CSS Stilleri DOM'a Enjekte Et ---
function injectStyles() {
    if (document.getElementById("gh-ai-styles")) return;

    const style = document.createElement("style");
    style.id = "gh-ai-styles";
    style.textContent = `
        /* ===== Floating Widget Container ===== */
        #gh-ai-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 370px;
            height: auto;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            border-radius: 16px;
            overflow: hidden;
            transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: top right;

            /* Glassmorphism Dark Theme */
            background: rgba(13, 17, 23, 0.88);
            backdrop-filter: blur(18px) saturate(1.5);
            -webkit-backdrop-filter: blur(18px) saturate(1.5);
            border: 1px solid rgba(240, 246, 252, 0.1);
            box-shadow:
                0 10px 40px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.04) inset;
            color: #e6edf3;
        }

        #gh-ai-panel.hidden {
            opacity: 0;
            transform: scale(0.92) translateY(-10px);
            pointer-events: none;
        }

        /* ===== Panel Header ===== */
        #gh-ai-panel .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 22px;
            border-bottom: 1px solid rgba(240, 246, 252, 0.08);
        }

        #gh-ai-panel .panel-header .title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
            font-weight: 700;
            color: #f0f6fc;
        }

        #gh-ai-panel .panel-header .title .logo {
            font-size: 20px;
        }

        #gh-ai-panel .panel-header .badge {
            font-size: 10px;
            padding: 3px 10px;
            border-radius: 10px;
            font-weight: 600;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            background: rgba(56, 139, 253, 0.2);
            color: #58a6ff;
            border: 1px solid rgba(56, 139, 253, 0.25);
        }

        /* Kapat Butonu */
        #gh-ai-panel .close-btn {
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 7px;
            background: transparent;
            color: #8b949e;
            font-size: 17px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            line-height: 1;
        }
        #gh-ai-panel .close-btn:hover {
            background: rgba(240, 246, 252, 0.1);
            color: #f0f6fc;
        }

        /* ===== Dosya Bilgisi ===== */
        #gh-ai-panel .file-info {
            padding: 12px 22px;
            font-size: 12px;
            border-bottom: 1px solid rgba(240, 246, 252, 0.06);
            display: flex;
            align-items: center;
            gap: 8px;
            color: #8b949e;
        }
        #gh-ai-panel .file-info .filename {
            font-weight: 600;
            color: #c9d1d9;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* ===== Buton Listesi ===== */
        #gh-ai-panel .actions {
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* ===== Aksiyon Butonu ===== */
        #gh-ai-panel .action-btn {
            display: flex;
            align-items: center;
            gap: 14px;
            width: 100%;
            height: 54px;
            padding: 0 18px;
            border: 1px solid rgba(240, 246, 252, 0.08);
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            background: rgba(255, 255, 255, 0.03);
            color: #c9d1d9;
            box-sizing: border-box;
        }

        #gh-ai-panel .action-btn:hover {
            background: rgba(255, 255, 255, 0.07);
            transform: translateX(4px);
        }

        #gh-ai-panel .action-btn .btn-icon {
            font-size: 20px;
            flex-shrink: 0;
            width: 26px;
            text-align: center;
        }

        #gh-ai-panel .action-btn .btn-label {
            font-weight: 600;
            font-size: 14px;
            color: #e6edf3;
            transition: opacity 0.15s ease;
        }

        /* Buton hover renk vurguları */
        #gh-ai-panel .action-btn.explain:hover {
            border-color: rgba(84, 174, 255, 0.45);
            box-shadow: 0 0 16px rgba(84, 174, 255, 0.1) inset;
        }
        #gh-ai-panel .action-btn.quality:hover {
            border-color: rgba(63, 185, 80, 0.45);
            box-shadow: 0 0 16px rgba(63, 185, 80, 0.1) inset;
        }
        #gh-ai-panel .action-btn.security:hover {
            border-color: rgba(210, 153, 34, 0.45);
            box-shadow: 0 0 16px rgba(210, 153, 34, 0.1) inset;
        }
        #gh-ai-panel .action-btn.refactor:hover {
            border-color: rgba(163, 113, 247, 0.45);
            box-shadow: 0 0 16px rgba(163, 113, 247, 0.1) inset;
        }

        /* ===== Sonuç Kutusu ===== */
        #ai-result-box {
            display: none;
            margin: 0 16px 14px 16px;
            padding: 14px 16px;
            max-height: 250px;
            overflow-y: auto;
            border-radius: 10px;
            font-size: 13px;
            line-height: 1.55;
            word-break: break-word;
            color: #c9d1d9;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(240, 246, 252, 0.08);
        }

        #ai-result-box strong {
            color: #f0f6fc;
            font-weight: 700;
        }
        #ai-result-box em {
            color: #d2a8ff;
            font-style: italic;
        }
        #ai-result-box li {
            margin-left: 8px;
            padding: 2px 0;
            list-style: none;
        }
        #ai-result-box li::before {
            content: '▸';
            color: #58a6ff;
            margin-right: 8px;
            font-weight: 700;
        }

        /* Fullscreen için aynı stiller */
        .ai-fullscreen-box strong {
            color: #f0f6fc;
            font-weight: 700;
        }
        .ai-fullscreen-box em {
            color: #d2a8ff;
            font-style: italic;
        }
        .ai-fullscreen-box li {
            margin-left: 8px;
            padding: 3px 0;
            list-style: none;
        }
        .ai-fullscreen-box li::before {
            content: '▸';
            color: #58a6ff;
            margin-right: 8px;
            font-weight: 700;
        }

        /* ===== Başlıklar (h1-h3) ===== */
        #ai-result-box h1, .ai-fullscreen-box h1 {
            font-size: 18px;
            font-weight: 700;
            color: #f0f6fc;
            margin: 12px 0 6px 0;
            border-bottom: 1px solid rgba(240, 246, 252, 0.1);
            padding-bottom: 4px;
        }
        #ai-result-box h2, .ai-fullscreen-box h2 {
            font-size: 15px;
            font-weight: 700;
            color: #e6edf3;
            margin: 10px 0 4px 0;
        }
        #ai-result-box h3, .ai-fullscreen-box h3 {
            font-size: 14px;
            font-weight: 600;
            color: #c9d1d9;
            margin: 8px 0 4px 0;
        }

        /* ===== Kod Blokları ===== */
        #ai-result-box pre, .ai-fullscreen-box pre {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(240, 246, 252, 0.1);
            border-radius: 8px;
            padding: 12px 14px;
            margin: 8px 0;
            overflow-x: auto;
            font-size: 12px;
            line-height: 1.5;
        }
        #ai-result-box pre code, .ai-fullscreen-box pre code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            color: #e6edf3;
            white-space: pre;
        }

        #ai-result-box::-webkit-scrollbar {
            width: 5px;
        }
        #ai-result-box::-webkit-scrollbar-track {
            background: transparent;
        }
        #ai-result-box::-webkit-scrollbar-thumb {
            background: rgba(139, 148, 158, 0.35);
            border-radius: 4px;
        }

        #ai-result-box.error {
            color: #f85149;
            border-color: rgba(248, 81, 73, 0.25);
        }

        /* ===== Daha Ayrıntılı Açıkla Butonu ===== */
        #ai-detail-btn {
            display: block;
            margin: 6px 16px 14px 16px;
            padding: 8px 14px;
            width: calc(100% - 32px);
            border: 1px dashed rgba(88, 166, 255, 0.3);
            border-radius: 8px;
            background: transparent;
            color: #58a6ff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }
        #ai-detail-btn:hover {
            background: rgba(88, 166, 255, 0.08);
            border-color: rgba(88, 166, 255, 0.5);
        }
        #ai-detail-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        /* ===== Sonuç Kutusu Başlık Barı ===== */
        .ai-result-header {
            display: none;
            align-items: center;
            justify-content: space-between;
            margin: 0 16px;
            padding: 8px 4px 4px 4px;
        }
        .ai-result-header .result-title {
            font-size: 11px;
            font-weight: 600;
            color: #8b949e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .ai-result-header .expand-btn {
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #8b949e;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            line-height: 1;
        }
        .ai-result-header .expand-btn:hover {
            background: rgba(240, 246, 252, 0.1);
            color: #f0f6fc;
        }

        /* ===== Fullscreen Modal ===== */
        .ai-fullscreen-overlay {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            align-items: center;
            justify-content: center;
        }
        .ai-fullscreen-overlay.active {
            display: flex;
        }

        .ai-fullscreen-box {
            width: 90vw;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 28px 32px;
            border-radius: 16px;
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-break: break-word;
            color: #e6edf3;
            background: rgba(13, 17, 23, 0.95);
            border: 1px solid rgba(240, 246, 252, 0.12);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            position: relative;
        }

        .ai-fullscreen-box::-webkit-scrollbar {
            width: 6px;
        }
        .ai-fullscreen-box::-webkit-scrollbar-track {
            background: transparent;
        }
        .ai-fullscreen-box::-webkit-scrollbar-thumb {
            background: rgba(139, 148, 158, 0.4);
            border-radius: 4px;
        }

        .ai-fullscreen-close {
            position: absolute;
            top: 12px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: rgba(240, 246, 252, 0.06);
            color: #8b949e;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }
        .ai-fullscreen-close:hover {
            background: rgba(240, 246, 252, 0.12);
            color: #f0f6fc;
        }

        .ai-fullscreen-box.error {
            color: #f85149;
        }

        /* ===== Buton Disabled Durumu ===== */
        #gh-ai-panel .action-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none !important;
        }

        /* ===== Repo Mode: Analyze Butonu ===== */
        #gh-ai-panel .repo-analyze-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            height: 58px;
            padding: 0 18px;
            border: 1px solid rgba(56, 139, 253, 0.3);
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s ease;
            text-align: center;
            background: linear-gradient(135deg, rgba(56, 139, 253, 0.12) 0%, rgba(163, 113, 247, 0.12) 100%);
            color: #58a6ff;
            box-sizing: border-box;
        }
        #gh-ai-panel .repo-analyze-btn:hover {
            background: linear-gradient(135deg, rgba(56, 139, 253, 0.22) 0%, rgba(163, 113, 247, 0.22) 100%);
            border-color: rgba(56, 139, 253, 0.5);
            box-shadow: 0 0 20px rgba(56, 139, 253, 0.15) inset;
            transform: translateY(-1px);
        }
        #gh-ai-panel .repo-analyze-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none !important;
        }

        #gh-ai-panel .repo-info {
            padding: 12px 22px;
            font-size: 12px;
            border-bottom: 1px solid rgba(240, 246, 252, 0.06);
            display: flex;
            align-items: center;
            gap: 8px;
            color: #8b949e;
        }
        #gh-ai-panel .repo-info .repo-name {
            font-weight: 600;
            color: #c9d1d9;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* ===== Footer ===== */
        #gh-ai-panel .panel-footer {
            padding: 12px 22px;
            font-size: 11px;
            text-align: center;
            border-top: 1px solid rgba(240, 246, 252, 0.06);
            color: #484f58;
        }

        /* ===== Floating Action Button (FAB) ===== */
        #gh-ai-fab {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 99998;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid rgba(240, 246, 252, 0.12);
            cursor: pointer;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

            background: rgba(13, 17, 23, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow: 0 4px 22px rgba(0, 0, 0, 0.4);
            color: #e6edf3;
        }

        #gh-ai-fab:hover {
            transform: scale(1.12);
            box-shadow: 0 6px 28px rgba(56, 139, 253, 0.35);
            border-color: rgba(56, 139, 253, 0.45);
        }

        #gh-ai-fab.hidden {
            opacity: 0;
            transform: scale(0.6);
            pointer-events: none;
        }
    `;

    document.head.appendChild(style);
    console.log("[Content] CSS stilleri enjekte edildi.");
}

// --- Panel Aç / Kapat ---
function togglePanel(show) {
    const panel = document.getElementById("gh-ai-panel");
    const fab = document.getElementById("gh-ai-fab");
    if (!panel || !fab) return;

    if (show) {
        panel.classList.remove("hidden");
        fab.classList.add("hidden");
    } else {
        panel.classList.add("hidden");
        fab.classList.remove("hidden");
    }
}

// --- Fullscreen Aç ---
function openFullscreen() {
    const resultBox = document.getElementById("ai-result-box");
    const overlay = document.getElementById("ai-fullscreen-overlay");
    const fsText = document.getElementById("ai-fullscreen-text");
    const fsContent = document.getElementById("ai-fullscreen-content");
    if (!resultBox || !overlay) return;

    fsText.innerHTML = resultBox.innerHTML;
    fsContent.className = resultBox.classList.contains("error")
        ? "ai-fullscreen-box error"
        : "ai-fullscreen-box";
    overlay.classList.add("active");
}

// --- Fullscreen Kapat ---
function closeFullscreen() {
    const overlay = document.getElementById("ai-fullscreen-overlay");
    if (overlay) overlay.classList.remove("active");
}

// --- Tüm Butonları Kilitle ---
function lockAllButtons(activeBtn) {
    const allBtns = document.querySelectorAll('#gh-ai-panel .action-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        b._loading = true;
    });
    // Aktif butonun metnini değiştir
    const labelSpan = activeBtn.querySelector('.btn-label');
    if (labelSpan) labelSpan.textContent = '⏳ Analiz ediliyor...';
}

// --- Tüm Butonların Kilidini Aç ---
function unlockAllButtons() {
    const allBtns = document.querySelectorAll('#gh-ai-panel .action-btn');
    allBtns.forEach(b => {
        b.disabled = false;
        b._loading = false;
        // Orijinal İngilizce metne döndür
        const labelSpan = b.querySelector('.btn-label');
        if (labelSpan && b.dataset.labelEn) {
            labelSpan.textContent = b.dataset.labelEn;
        }
    });
}

// --- Detay Butonunu Panele Ekle ---
function injectDetailButton(rawCode) {
    // Zaten varsa ekleme
    if (document.getElementById("ai-detail-btn")) return;

    const resultBox = document.getElementById("ai-result-box");
    if (!resultBox) return;

    const detailBtn = document.createElement("button");
    detailBtn.id = "ai-detail-btn";
    detailBtn.textContent = "🔎 Daha Ayrıntılı Açıkla";

    // resultBox'tan hemen sonra ekle
    resultBox.insertAdjacentElement("afterend", detailBtn);

    detailBtn.addEventListener("click", () => {
        handleDetailedExplain(detailBtn, rawCode);
    });
}

// --- Fullscreen Overlay Oluştur (Reusable) ---
function ensureFullscreenOverlay() {
    let overlay = document.getElementById("ai-fullscreen-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "ai-fullscreen-overlay";
        overlay.id = "ai-fullscreen-overlay";
        overlay.innerHTML = `
            <div class="ai-fullscreen-box" id="ai-fullscreen-content">
                <button class="ai-fullscreen-close" id="ai-fullscreen-close" title="Kapat">✕</button>
                <div id="ai-fullscreen-text"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Overlay dışına tıklayınca kapat
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeFullscreen();
        });
        overlay.querySelector("#ai-fullscreen-close").addEventListener("click", closeFullscreen);
    }
    return overlay;
}

// --- File Mode Panelini Oluştur ---
function createPanel() {
    if (document.getElementById("gh-ai-panel")) return;

    const fileName = getFileNameFromURL();

    // Buton verileri: İngilizce label + Türkçe hover metni
    const buttons = [
        { action: "explain", icon: "🔍", labelEN: "Explain Code", labelTR: "Kodu Açıkla", cls: "explain" },
        { action: "quality", icon: "📊", labelEN: "Code Quality Score", labelTR: "Kod Kalitesini Puanla", cls: "quality" },
        { action: "security", icon: "🛡️", labelEN: "Security Check", labelTR: "Güvenlik Taraması", cls: "security" },
        { action: "refactor", icon: "♻️", labelEN: "Refactor Suggestion", labelTR: "İyileştirme Önerileri", cls: "refactor" },
    ];

    // Buton HTML'lerini oluştur
    const buttonsHTML = buttons.map(b => `
        <button class="action-btn ${b.cls}" data-action="${b.action}" data-label-en="${b.labelEN}" data-label-tr="${b.labelTR}">
            <span class="btn-icon">${b.icon}</span>
            <span class="btn-label">${b.labelEN}</span>
        </button>
    `).join("");

    // -------- Panel --------
    const panel = document.createElement("div");
    panel.id = "gh-ai-panel";
    panel.innerHTML = `
        <div class="panel-header">
            <div class="title">
                <span class="logo">🤖</span>
                <span>AI Assistant</span>
            </div>
            <span class="badge">file</span>
            <button class="close-btn" id="gh-ai-close" title="Paneli kapat">✕</button>
        </div>

        <div class="file-info">
            <span>📄</span>
            <span class="filename" title="${fileName}">${fileName}</span>
        </div>

        <div class="actions">
            ${buttonsHTML}
        </div>

        <div class="ai-result-header" id="ai-result-header">
            <span class="result-title">📝 Sonuç</span>
            <button class="expand-btn" id="ai-expand-btn" title="Tam ekran">⛶</button>
        </div>
        <div id="ai-result-box"></div>

        <div class="panel-footer">
            ⚡ Powered by Ollama · Local LLM
        </div>
    `;

    // -------- FAB --------
    const fab = document.createElement("button");
    fab.id = "gh-ai-fab";
    fab.classList.add("hidden");
    fab.textContent = "🤖";
    fab.title = "AI Assistant'ı aç";
    fab.addEventListener("click", () => togglePanel(true));

    // Kapat butonu
    panel.querySelector("#gh-ai-close").addEventListener("click", () => togglePanel(false));

    // Aksiyon butonları: click + hover metin değiştirme
    panel.querySelectorAll(".action-btn").forEach((btn) => {
        const labelSpan = btn.querySelector(".btn-label");
        const labelEN = btn.dataset.labelEn;
        const labelTR = btn.dataset.labelTr;

        // Hover: İngilizce → Türkçe (loading sırasında devre dışı)
        btn.addEventListener("mouseenter", () => {
            if (btn._loading) return;
            labelSpan.textContent = labelTR;
        });

        // Hover çıkış: Türkçe → İngilizce (loading sırasında devre dışı)
        btn.addEventListener("mouseleave", () => {
            if (btn._loading) return;
            labelSpan.textContent = labelEN;
        });

        // Tıklama — tüm butonlar unified handler üzerinden
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            console.log(`[Content] Buton tıklandı: ${action}`);
            handleAction(btn, action);
        });
    });

    // -------- Fullscreen Overlay --------
    ensureFullscreenOverlay();

    // Expand butonu
    panel.querySelector("#ai-expand-btn").addEventListener("click", openFullscreen);

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    console.log("[Content] Floating widget oluşturuldu.");
}

// --- Repo Mode Panelini Oluştur ---
function createRepoPanel() {
    if (document.getElementById("gh-ai-panel")) return;

    const repoName = getRepoNameFromURL();

    const panel = document.createElement("div");
    panel.id = "gh-ai-panel";
    panel.dataset.mode = "repo";
    panel.innerHTML = `
        <div class="panel-header">
            <div class="title">
                <span class="logo">🤖</span>
                <span>AI Assistant</span>
            </div>
            <span class="badge">repo</span>
            <button class="close-btn" id="gh-ai-close" title="Paneli kapat">✕</button>
        </div>

        <div class="repo-info">
            <span>📁</span>
            <span class="repo-name" title="${repoName}">${repoName}</span>
        </div>

        <div class="actions">
            <button class="action-btn explain" id="repo-analyze-btn" data-label-en="🔍 Analyze Repository" data-label-tr="🔍 Depoyu Analiz Et">
                <span class="btn-icon">🔍</span>
                <span class="btn-label">🔍 Analyze Repository</span>
            </button>
        </div>

        <div class="ai-result-header" id="ai-result-header">
            <span class="result-title">📝 Sonuç</span>
            <button class="expand-btn" id="ai-expand-btn" title="Tam ekran">⛶</button>
        </div>
        <div id="ai-result-box"></div>

        <div class="panel-footer">
            ⚡ Powered by Ollama · Local LLM
        </div>
    `;

    // FAB
    const fab = document.createElement("button");
    fab.id = "gh-ai-fab";
    fab.classList.add("hidden");
    fab.textContent = "🤖";
    fab.title = "AI Assistant'ı aç";
    fab.addEventListener("click", () => togglePanel(true));

    // Kapat butonu
    panel.querySelector("#gh-ai-close").addEventListener("click", () => togglePanel(false));

    // Analyze butonu: hover EN ↔ TR + click
    const analyzeBtn = panel.querySelector("#repo-analyze-btn");
    const analyzeLabelSpan = analyzeBtn.querySelector(".btn-label");
    const analyzeLabelEN = analyzeBtn.dataset.labelEn;
    const analyzeLabelTR = analyzeBtn.dataset.labelTr;

    analyzeBtn.addEventListener("mouseenter", () => {
        if (analyzeBtn._loading) return;
        analyzeLabelSpan.textContent = analyzeLabelTR;
    });
    analyzeBtn.addEventListener("mouseleave", () => {
        if (analyzeBtn._loading) return;
        analyzeLabelSpan.textContent = analyzeLabelEN;
    });
    analyzeBtn.addEventListener("click", () => {
        handleRepoAnalyze();
    });

    // Fullscreen Overlay
    ensureFullscreenOverlay();

    // Expand butonu
    panel.querySelector("#ai-expand-btn").addEventListener("click", openFullscreen);

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    console.log("[Content] Repo Mode paneli oluşturuldu.");
}

// --- Paneli ve FAB'ı Kaldır ---
function removePanel() {
    const panel = document.getElementById("gh-ai-panel");
    const fab = document.getElementById("gh-ai-fab");
    if (panel) panel.remove();
    if (fab) fab.remove();
    console.log("[Content] Panel kaldırıldı (dosya sayfası değil).");
}

// --- Panel State'ini Sıfırla (Dosya Değiştiğinde) ---
function resetPanelState() {
    // 1) Dosya ismini güncelle
    const filenameEl = document.querySelector("#gh-ai-panel .filename");
    const newFileName = getFileNameFromURL();
    if (filenameEl) {
        filenameEl.textContent = newFileName;
        filenameEl.title = newFileName;
    }

    // 2) Sonuç kutusunu temizle ve gizle
    const resultBox = document.getElementById("ai-result-box");
    if (resultBox) {
        resultBox.style.display = "none";
        resultBox.className = "";
        resultBox.innerHTML = "";
    }

    // 3) Sonuç başlığını gizle
    const resultHeader = document.getElementById("ai-result-header");
    if (resultHeader) resultHeader.style.display = "none";

    // 4) Detay butonunu kaldır
    const detailBtn = document.getElementById("ai-detail-btn");
    if (detailBtn) detailBtn.remove();

    // 5) Tüm butonların kilidini aç
    unlockAllButtons();

    // 6) Fullscreen modal açıksa kapat
    closeFullscreen();

    console.log("[Content] Panel state sıfırlandı (yeni dosya: " + newFileName + ")");
}
