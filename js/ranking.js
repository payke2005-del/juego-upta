// ==========================================================================
// SISTEMA DE RANKING LOCAL - PIXEL VOCACIONAL
// ==========================================================================

const RankingSystem = {
  STORAGE_KEY: 'pixelVocacional_ranking',

  // Obtener el ranking completo (todos los usuarios, todas las áreas)
  getRanking() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  },

  // Guardar un puntaje
  saveScore(user, area, score, date) {
    const ranking = this.getRanking();
    if (!ranking[area]) ranking[area] = [];

    ranking[area].push({
      user: user,
      score: score,
      date: date || new Date().toISOString()
    });

    // Ordenar por puntaje descendente
    ranking[area].sort((a, b) => b.score - a.score);

    // Solo guardar el top 5 por área
    ranking[area] = ranking[area].slice(0, 5);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ranking));
  },

  // Obtener el top 5 de un área
  getTopByArea(area) {
    const ranking = this.getRanking();
    return ranking[area] || [];
  },

  // Obtener el mejor de todas las áreas
  getTopOverall() {
    const ranking = this.getRanking();
    let best = { user: '', area: '', score: 0 };
    for (const area in ranking) {
      if (ranking[area][0] && ranking[area][0].score > best.score) {
        best = { ...ranking[area][0], area: area };
      }
    }
    return best;
  },

  // Limpiar todo el ranking
  clearRanking() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};