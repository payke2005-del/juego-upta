// ==========================================================================
// SISTEMA PARA COMPARTIR RESULTADOS - PIXEL VOCACIONAL
// ==========================================================================

const ShareSystem = {
  // Compartir por WhatsApp
  shareWhatsApp(text) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  // Compartir por Twitter/X
  shareTwitter(text) {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  // Copiar al portapapeles
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  // Generar texto del resultado
  generateText(user, area, score, lang) {
    const areaName = {
      informatica: { es: 'Informática', en: 'Computer Science' },
      telecomunicaciones: { es: 'Telecomunicaciones', en: 'Telecommunications' },
      mecanica: { es: 'Mecánica', en: 'Mechanical' },
      electricidad: { es: 'Electricidad', en: 'Electrical' },
      contaduria: { es: 'Contaduría', en: 'Accounting' }
    };

    const name = areaName[area] ? areaName[area][lang] : area;

    if (lang === 'es') {
      return `🎓 ¡Acabo de hacer mi test vocacional en Pixel Vocacional!\n\n🏆 Mi mayor afinidad: ${name} (${score}%)\n\n👉 Pruébalo tú también: https://payke2005-del.github.io/juego-upta/`;
    } else {
      return `🎓 I just took my vocational test on Pixel Vocacional!\n\n🏆 My highest affinity: ${name} (${score}%)\n\n👉 Try it yourself: https://payke2005-del.github.io/juego-upta/`;
    }
  }
};
