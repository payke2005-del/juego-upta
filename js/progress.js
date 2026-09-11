// ==========================================================================
// SISTEMA DE PROGRESO - PIXEL VOCACIONAL
// ==========================================================================

const ProgressSystem = {
  // Obtener la clave de progreso del usuario actual
  getKey() {
    const user = window.currentUser || localStorage.getItem('activeUser') || 'invitado';
    return `progress_${user}`;
  },

  // Obtener todo el progreso del usuario
  getProgress() {
    const data = localStorage.getItem(this.getKey());
    if (!data) return { history: [], bestScore: 0, bestArea: '' };
    try {
      return JSON.parse(data);
    } catch (e) {
      return { history: [], bestScore: 0, bestArea: '' };
    }
  },

  // Guardar una nueva partida
  saveGame(stats, score, areas) {
    const progress = this.getProgress();
    const user = window.currentUser || localStorage.getItem('activeUser') || 'Invitado';

    // Calcular área con mayor afinidad
    let bestArea = '';
    let bestScore = 0;
    for (const [area, val] of Object.entries(stats)) {
      if (val > bestScore) {
        bestScore = val;
        bestArea = area;
      }
    }

    const newGame = {
      date: new Date().toISOString(),
      user: user,
      stats: { ...stats },
      score: score,
      bestArea: bestArea,
      bestScore: bestScore
    };

    // Agregar al inicio del historial
    progress.history.unshift(newGame);

    // Mantener solo las últimas 3 partidas
    if (progress.history.length > 3) {
      progress.history = progress.history.slice(0, 3);
    }

    // Actualizar mejor puntaje global
    if (bestScore > progress.bestScore) {
      progress.bestScore = bestScore;
      progress.bestArea = bestArea;
    }

    localStorage.setItem(this.getKey(), JSON.stringify(progress));
    return newGame;
  },

  // Obtener el historial
  getHistory() {
    return this.getProgress().history || [];
  },

  // Obtener el mejor puntaje
  getBest() {
    const p = this.getProgress();
    return {
      score: p.bestScore || 0,
      area: p.bestArea || ''
    };
  },

  // Limpiar historial
  clearHistory() {
    localStorage.removeItem(this.getKey());
  },

  // Formatear fecha bonita
  formatDate(iso) {
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  },

  // Traducir nombre de carrera
  translateArea(area, lang) {
    const areas = {
      informatica: { es: 'Informática', en: 'Computer Science' },
      telecomunicaciones: { es: 'Telecomunicaciones', en: 'Telecommunications' },
      mecanica: { es: 'Mecánica', en: 'Mechanical' },
      electricidad: { es: 'Electricidad', en: 'Electrical' },
      contaduria: { es: 'Contaduría', en: 'Accounting' }
    };
    return areas[area] ? areas[area][lang] : area;
  }
};