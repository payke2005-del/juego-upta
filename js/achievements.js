// ==========================================================================
// SISTEMA DE LOGROS - PIXEL VOCACIONAL
// Logros estilo Steam/Xbox con persistencia por usuario en localStorage.
// Estructura guardada: { unlockedIds: [], totalGames: 0, bestStreak: 0, areasExplored: [] }
// ==========================================================================

const AchievementsSystem = {

  // --- CATÁLOGO DE LOGROS ---
  // Cada logro define: id único, emoji, nombre y descripción bilingües (es/en).
  definitions: [
    { id: 'primera_victoria',   emoji: '🎯', name: { es: 'Primera Victoria', en: 'First Victory' },   desc: { es: 'Completar tu primera trivia',      en: 'Complete your first trivia' } },
    { id: 'perfecto_100',       emoji: '💯', name: { es: 'Perfeccionista',   en: 'Perfectionist' },    desc: { es: 'Obtener 100% en una carrera',      en: 'Get 100% in one career' } },
    { id: 'explorador',         emoji: '🧭', name: { es: 'Explorador',       en: 'Explorer' },         desc: { es: 'Probar las 5 carreras',            en: 'Try all 5 careers' } },
    { id: 'racha_5',            emoji: '🔥', name: { es: 'En Racha',         en: 'On Fire' },          desc: { es: 'Acertar 5 preguntas seguidas',     en: 'Answer 5 questions in a row' } },
    { id: 'racha_10',           emoji: '⚡', name: { es: 'Imparable',        en: 'Unstoppable' },      desc: { es: 'Acertar 10 preguntas seguidas',    en: 'Answer 10 questions in a row' } },
    { id: 'sin_vidas_perdidas', emoji: '💚', name: { es: 'Intocable',        en: 'Untouchable' },      desc: { es: 'Terminar sin perder vidas',        en: 'Finish without losing lives' } },
    { id: 'rapido_30',          emoji: '⏱️', name: { es: 'Velocista',        en: 'Speedrunner' },      desc: { es: 'Terminar en menos de 30 segundos', en: 'Finish in under 30 seconds' } },
    { id: 'contador_pro',       emoji: '📊', name: { es: 'Contador Pro',     en: 'Accounting Pro' },   desc: { es: '100% en Contaduría',               en: '100% in Accounting' } },
    { id: 'informatico_pro',    emoji: '💻', name: { es: 'Informático Pro',  en: 'Computer Pro' },     desc: { es: '100% en Informática',              en: '100% in Computer Science' } },
    { id: 'telecom_pro',        emoji: '📡', name: { es: 'Telecom Pro',      en: 'Telecom Pro' },      desc: { es: '100% en Telecomunicaciones',       en: '100% in Telecommunications' } },
    { id: 'mecanico_pro',       emoji: '⚙️', name: { es: 'Mecánico Pro',     en: 'Mechanic Pro' },     desc: { es: '100% en Mecánica',                 en: '100% in Mechanical' } },
    { id: 'electricista_pro',   emoji: '⚡', name: { es: 'Electricista Pro', en: 'Electrician Pro' },  desc: { es: '100% en Electricidad',             en: '100% in Electrical' } },
    { id: 'veterano',           emoji: '🏆', name: { es: 'Veterano',         en: 'Veteran' },          desc: { es: 'Jugar 10 trivias en total',        en: 'Play 10 trivias in total' } },
    { id: 'coleccionista',      emoji: '🎖️', name: { es: 'Coleccionista',    en: 'Collector' },        desc: { es: 'Desbloquear 8 logros',             en: 'Unlock 8 achievements' } }
  ],

  // --- PERSISTENCIA (localStorage por usuario) ---

  // Clave única del usuario activo: achievements_<usuario>
  getKey() {
    const user = localStorage.getItem('activeUser') || 'Invitado';
    return `achievements_${user}`;
  },

  // Lee y normaliza los datos guardados (con valores por defecto seguros)
  getAchievements() {
    const base = { unlockedIds: [], totalGames: 0, bestStreak: 0, areasExplored: [] };
    try {
      const raw = localStorage.getItem(this.getKey());
      if (!raw) return { ...base };
      return { ...base, ...JSON.parse(raw) };
    } catch (e) {
      return { ...base };
    }
  },

  // Guarda el objeto completo del usuario
  save(data) {
    localStorage.setItem(this.getKey(), JSON.stringify(data));
  },

  // --- API PÚBLICA ---

  // Desbloquea un logro. Retorna true si es nuevo, false si ya estaba.
  // Al desbloquear, dispara el evento global 'achievementUnlocked'.
  unlock(id) {
    const data = this.getAchievements();
    if (data.unlockedIds.includes(id)) return false;

    const logro = this.definitions.find(d => d.id === id);
    if (!logro) return false;

    data.unlockedIds.push(id);
    this.save(data);

    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
      detail: { achievement: logro }
    }));
    return true;
  },

  // ¿Está desbloqueado este logro?
  isUnlocked(id) {
    return this.getAchievements().unlockedIds.includes(id);
  },

  // Retorna el catálogo completo con el estado de cada logro
  getAll() {
    const data = this.getAchievements();
    return this.definitions.map(d => ({
      ...d,
      unlocked: data.unlockedIds.includes(d.id)
    }));
  },

  // Evalúa el desempeño de una partida y desbloquea los logros que correspondan.
  //   stats   = { [area]: score }  → puntaje % por área en esta partida
  //   context = { lives, streak, time, totalCorrect, areasPlayed }
  // Retorna un array con los logros NUEVAMENTE desbloqueados.
  checkAchievements(stats, context) {
    const newlyUnlocked = [];
    const ctx = context || {};

    // Helper: intenta desbloquear y registra si es nuevo
    const tryUnlock = (id) => {
      const def = this.definitions.find(d => d.id === id);
      if (def && this.unlock(id)) newlyUnlocked.push(def);
    };

    const data = this.getAchievements();

    // 🎯 Primera victoria: al menos 1 partida completada
    if (data.totalGames >= 1) tryUnlock('primera_victoria');

    // 💯 Perfecto: 100% en alguna carrera de esta partida
    if (stats && Object.values(stats).some(s => s >= 100)) tryUnlock('perfecto_100');

    // 🧭 Explorador: acumular áreas jugadas entre todas las sesiones
    if (Array.isArray(ctx.areasPlayed) && ctx.areasPlayed.length > 0) {
      // Re-leer para no pisar desbloqueos recientes con datos viejos
      const fresh = this.getAchievements();
      let changed = false;
      ctx.areasPlayed.forEach(a => {
        if (!fresh.areasExplored.includes(a)) {
          fresh.areasExplored.push(a);
          changed = true;
        }
      });
      if (changed) this.save(fresh);
      if (fresh.areasExplored.length >= 5) tryUnlock('explorador');
    }

    // 🔥⚡ Rachas de aciertos (usa la mejor racha de la partida)
    if (typeof ctx.streak === 'number') {
      if (ctx.streak >= 5) tryUnlock('racha_5');
      if (ctx.streak >= 10) tryUnlock('racha_10');
    }

    // 💚 Sin vidas perdidas: terminó con las 3 vidas intactas
    if (typeof ctx.lives === 'number' && ctx.lives >= 3) tryUnlock('sin_vidas_perdidas');

    // ⏱️ Velocista: partida completa en menos de 30 segundos
    if (typeof ctx.time === 'number' && ctx.time > 0 && ctx.time < 30) tryUnlock('rapido_30');

    // 📊💻📡⚙️⚡ Logros "Pro": 100% en una carrera específica
    const proMap = {
      contaduria: 'contador_pro',
      informatica: 'informatico_pro',
      telecomunicaciones: 'telecom_pro',
      mecanica: 'mecanico_pro',
      electricidad: 'electricista_pro'
    };
    if (stats) {
      for (const [area, id] of Object.entries(proMap)) {
        if (stats[area] >= 100) tryUnlock(id);
      }
    }

    // 🏆 Veterano: 10 trivias jugadas en total
    if (this.getAchievements().totalGames >= 10) tryUnlock('veterano');

    // 🎖️ Coleccionista: se evalúa AL FINAL, contando los desbloqueos de arriba
    if (this.getUnlockedCount() >= 8) tryUnlock('coleccionista');

    return newlyUnlocked;
  },

  // Suma 1 al contador de partidas del usuario
  incrementGames() {
    const data = this.getAchievements();
    data.totalGames++;
    this.save(data);
    return data.totalGames;
  },

  // Actualiza la mejor racha histórica si la nueva la supera
  updateBestStreak(streak) {
    if (typeof streak !== 'number' || streak <= 0) {
      return this.getAchievements().bestStreak;
    }
    const data = this.getAchievements();
    if (streak > data.bestStreak) {
      data.bestStreak = streak;
      this.save(data);
    }
    return data.bestStreak;
  },

  // Cantidad de logros desbloqueados
  getUnlockedCount() {
    return this.getAchievements().unlockedIds.length;
  },

  // Borra TODOS los logros y estadísticas del usuario actual
  resetAchievements() {
    localStorage.removeItem(this.getKey());
  }
};