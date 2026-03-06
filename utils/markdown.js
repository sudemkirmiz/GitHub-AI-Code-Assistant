// ============================================================
// GitHub AI Code Assistant — Markdown Parser (Vanilla JS)
// Hiçbir dış kütüphane kullanmadan Markdown → HTML dönüşümü.
// ============================================================

function simpleMarkdownToHTML(text) {
    if (!text) return "";

    // 1) Çok satırlı kod bloklarını placeholder ile koruma
    const codeBlocks = [];
    let html = text.replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
        const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        codeBlocks.push('<pre><code>' + escaped + '</code></pre>');
        return '%%CODEBLOCK_' + codeBlocks.length + '%%';
    });

    // 2) Escape HTML (kod blokları dışında)
    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 3) Başlıklar (### önce, ## sonra, # en son)
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // 4) **bold**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // 5) *italic*
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // 6) Satır başındaki - veya • liste maddesi
    html = html.replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>");
    // 7) Satır atlamaları
    html = html.replace(/\n/g, "<br>");

    // 8) Kod bloklarını geri koy
    codeBlocks.forEach((block, i) => {
        html = html.replace('%%CODEBLOCK_' + (i + 1) + '%%', block);
    });

    return html;
}
