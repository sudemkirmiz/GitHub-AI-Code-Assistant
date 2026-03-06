// ============================================================
// GitHub AI Code Assistant — GitHub DOM Utility Fonksiyonları
// URL parsing, sayfa tipi algılama ve DOM'dan veri çekme.
// ============================================================

// --- Dosya Adını URL'den Çıkar ---
function getFileNameFromURL() {
    const pathParts = window.location.pathname.split("/");
    const blobIndex = pathParts.indexOf("blob");
    if (blobIndex !== -1 && blobIndex + 2 < pathParts.length) {
        return pathParts.slice(blobIndex + 2).join("/");
    }
    return "Bilinmeyen dosya";
}

// --- Repo Adını URL'den Çıkar ---
function getRepoNameFromURL() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
        return parts[0] + "/" + parts[1];
    }
    return "Bilinmeyen repo";
}

// --- Sayfa Tipi Algılama (Router) ---
function getPageType() {
    const pathname = window.location.pathname;
    // Dosya sayfası
    if (pathname.includes("/blob/")) return "FILE_MODE";
    // Repo ana sayfası: /owner/repo veya /owner/repo/tree/branch
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
        // Repo alt sayfalarını hariç tut (issues, pulls, actions vb.)
        const repoSubPages = ["issues", "pulls", "actions", "projects", "wiki", "security", "pulse", "settings", "discussions", "labels", "milestones", "compare", "commit", "commits"];
        if (parts.length === 2 || (parts.length >= 3 && (parts[2] === "tree" || !repoSubPages.includes(parts[2])))) {
            // /tree/ ile başlayan sayfaları da REPO_MODE olarak say
            if (parts.length === 2 || parts[2] === "tree") {
                return "REPO_MODE";
            }
        }
    }
    return null;
}

// --- GitHub DOM'dan Kaynak Kodu Çekme (Robust Extraction) ---
function getGitHubSourceCode() {
    try {
        // 1) Eski GitHub DOM yapısı: .blob-code-inner
        let codeLines = document.querySelectorAll(".blob-code-inner");
        if (codeLines.length > 0) {
            const raw = Array.from(codeLines).map(el => el.textContent).join("\n");
            return raw.trim() || null;
        }

        // 2) Eski GitHub DOM yapısı: .js-file-line
        codeLines = document.querySelectorAll(".js-file-line");
        if (codeLines.length > 0) {
            const raw = Array.from(codeLines).map(el => el.textContent).join("\n");
            return raw.trim() || null;
        }

        // 3) Yeni React tabanlı GitHub DOM — react-app container
        const reactRoot = document.querySelector('[data-target="react-app.reactRoot"]');
        if (reactRoot) {
            // 3a) textarea (raw blob content)
            const textarea = reactRoot.querySelector("textarea");
            if (textarea && textarea.value.trim()) {
                return textarea.value.trim();
            }

            // 3b) table satırları (code view)
            const tableRows = reactRoot.querySelectorAll("table tr");
            if (tableRows.length > 0) {
                const lines = Array.from(tableRows).map(tr => {
                    const codeCell = tr.querySelector("td:last-child");
                    return codeCell ? codeCell.textContent : "";
                });
                const raw = lines.join("\n").trim();
                if (raw) return raw;
            }

            // 3c) Genel text content
            const text = reactRoot.textContent.trim();
            if (text.length > 50) return text;
        }

        // 4) Fallback: genel <pre> veya <code> blokları
        const preTags = document.querySelectorAll("pre code, pre");
        for (const el of preTags) {
            const text = el.textContent.trim();
            if (text.length > 20) return text;
        }

        return null;
    } catch (err) {
        console.error("[Content] Kod çekme hatası:", err);
        return null;
    }
}

// --- Repo Dosya Ağacından Akıllı Özet Çıkarma ---
function getRepoFileSummary() {
    // GitHub DOM'dan dosya satırlarını topla
    const fileEntries = [];

    // Yöntem 1: Yeni React tabanlı GitHub DOM
    const rows = document.querySelectorAll('.react-directory-row, [data-testid="listrow-name-text"], .js-navigation-open');
    rows.forEach(el => {
        const name = el.textContent.trim();
        if (name) fileEntries.push(name);
    });

    // Yöntem 2: Eski GitHub DOM - tablo satırları
    if (fileEntries.length === 0) {
        const links = document.querySelectorAll('a.js-navigation-open, .react-directory-truncate a, td.content a');
        links.forEach(a => {
            const name = a.textContent.trim();
            if (name && !name.includes('/')) fileEntries.push(name);
        });
    }

    // Yöntem 3: Genel fallback - tüm dosya linklerini tara
    if (fileEntries.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/blob/"], a[href*="/tree/"]');
        allLinks.forEach(a => {
            const text = a.textContent.trim();
            if (text && text.length < 80 && !text.includes(' ')) fileEntries.push(text);
        });
    }

    if (fileEntries.length === 0) return null;

    // Benzersizleştir
    const unique = [...new Set(fileEntries)];

    // Filtrele: önemsiz dosyaları çıkar
    const ignorePatterns = ['.gitignore', '.gitattributes', 'LICENSE', 'LICENCE', '.env.example',
        'node_modules', '.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        '.eslintrc', '.prettierrc', '.editorconfig', '.npmrc', 'tsconfig.json',
        '.github', '.vscode', '__pycache__', '.idea'];
    const ignoreExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
        '.mp4', '.mp3', '.wav', '.ttf', '.woff', '.woff2', '.eot'];

    const filtered = unique.filter(name => {
        const lower = name.toLowerCase();
        if (ignorePatterns.some(p => lower === p.toLowerCase())) return false;
        if (ignoreExtensions.some(ext => lower.endsWith(ext))) return false;
        return true;
    });

    // Öncelik sırasına göre sırala
    function getPriority(name) {
        const lower = name.toLowerCase();
        if (lower === 'readme.md' || lower === 'readme') return 0;
        if (['package.json', 'requirements.txt', 'go.mod', 'pom.xml', 'cargo.toml', 'gemfile', 'build.gradle', 'composer.json'].includes(lower)) return 1;
        if (['docker-compose.yml', 'docker-compose.yaml', 'dockerfile'].includes(lower)) return 2;
        if (lower.startsWith('main.') || lower.startsWith('index.') || lower.startsWith('app.')) return 3;
        if (['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs', '.rb', '.cpp', '.c', '.cs'].some(ext => lower.endsWith(ext))) return 4;
        if (['.yml', '.yaml', '.toml', '.json', '.xml'].some(ext => lower.endsWith(ext))) return 5;
        if (lower.endsWith('.md')) return 6;
        return 7;
    }

    filtered.sort((a, b) => getPriority(a) - getPriority(b));

    // Maksimum 10 dosya
    const top10 = filtered.slice(0, 10);

    // Formatla
    return top10.map((name, i) => (i + 1) + ') ' + name).join(', ');
}
