// ==========================================================================
// MOTOR LÓGICO CENTRAL - PIXEL VOCACIONAL SPA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- TEMA CLARO/OSCURO ---
  const themeBtn = document.getElementById('btn-theme-toggle');
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
    });
  }

  // --- SONIDOS ---
  if (typeof SoundSystem !== 'undefined') {
    SoundSystem.init();
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      if (!SoundSystem.enabled) soundBtn.classList.add('muted');
      soundBtn.addEventListener('click', () => {
        const enabled = SoundSystem.toggle();
        soundBtn.textContent = enabled ? '🔊' : '🔇';
        soundBtn.classList.toggle('muted', !enabled);
        if (enabled) SoundSystem.play('click');
      });
    }
  }

  // --- ESTADO INTERNO ---
  let currentUser = null;
  let isGuest = false;
  let currentLanguage = 'es';
  let selectedDifficulty = 'easy';
  let selectedAreas = [];
  let practiceMode = false;

  // Control de juego
  let gameQuestions = [];
  let currentQuestionIndex = 0;
  let currentScore = 0;
  let sessionStats = {};
  let areaPerformance = {};
  let lives = 3;
  let timerInterval = null;
  let timeLeft = 30;
  const TOTAL_QUESTIONS = 11;

  // Control de racha (para logros) y tiempo de partida
  let currentStreak = 0;
  let maxStreakThisGame = 0;
  let gameStartTime = null;

  // --- DICCIONARIO DE INTERFAZ ---
  const i18n = {
    es: {
      backBtn: 'Volver',
      loginTitle: 'INICIAR SESIÓN',
      loginDesc: 'Ingresa al sistema para registrar tus estadísticas vocacionales.',
      labelUser: 'Usuario:',
      labelPass: 'Contraseña:',
      loginBtn: 'ENTRAR AL SISTEMA',
      guestBtn: 'Entrar como Invitado',
      registerLink: '¿No tienes cuenta? Regístrate aquí',
      registerTitle: 'REGISTRO DE ESTUDIANTE',
      registerDesc: 'Crea un perfil local para guardar tu progreso académico.',
      labelFullName: 'Nombre Completo:',
      registerBtn: 'CONFIRMAR REGISTRO',
      loginLink: '¿Ya tienes cuenta? Inicia sesión',
      recoverLink: '¿Olvidaste tu contraseña?',
      passHint: 'Mínimo 8 caracteres',
      configTitle: 'PANEL DE CONFIGURACIÓN ACADÉMICA',
      difficultyLabel: 'Dificultad del Desafío:',
      areasLabel: 'Especialidades Técnicas (Selección Múltiple):',
      startTriviaBtn: 'INICIAR TRIVIA',
      practiceBtn: '🎯 MODO PRÁCTICA',
      practiceMode: '🎯 Modo Práctica',
      viewSheetsBtn: 'FICHAS ACADÉMICAS',
      rankingBtn: '🏆 RANKING',
      rankingTitle: '🏆 RANKING DE JUGADORES',
      rankingDesc: 'Los 5 mejores puntajes por especialidad.',
      clearRanking: '🗑️ Borrar ranking',
      sheetsTitle: 'FICHAS TÉCNICAS ACADÉMICAS',
      sheetsDesc: 'Explora los perfiles de egreso de las áreas universitarias.',
      nextBtn: 'CONTINUAR',
      labelLives: 'Vidas:',
      labelTime: 'Tiempo:',
      questionCounter: 'Pregunta {current}/{total}',
      reportTitle: 'INFORME DE EVALUACIÓN VOCACIONAL',
      reportSubtitle: 'Resultados estadísticos basados en competencias cognitivas.',
      reportStatsTitle: 'Afinidad por Especialidad Técnica:',
      reportVerdictTitle: 'Dictamen de Orientación Vocacional:',
      backMenuBtn: 'VOLVER AL PANEL',
      noAreas: 'Selecciona al menos un área.',
      notEnoughQuestions: 'No hay suficientes preguntas para esta combinación.',
      gameOver: '¡Sin vidas! Intenta de nuevo.',
      correct: '✅ ¡Correcto!',
      incorrect: '❌ Incorrecto',
      abandonTitle: 'Progreso guardado',
      abandonMsg: 'Has abandonado la trivia.',
      closeSession: '🚪 Cerrar sesión',
      progressTitle: '📊 TU PROGRESO',
      noProgress: 'Aún no has jugado ninguna trivia.',
      bestAffinity: 'Mejor afinidad',
      recentGames: 'Últimas partidas',
      yourBest: '🏆 Tu mejor marca',
      shareTitle: '📢 Compartir resultado',
      shareWhatsapp: 'WhatsApp',
      shareTwitter: 'Twitter/X',
      shareCopy: '📋 Copiar texto',
      shareCopied: '¡Texto copiado al portapapeles!',
      rankingEmpty: 'Aún no hay puntajes registrados.',
      achievementsTitle: '🏅 LOGROS',
      achievementsDesc: 'Desbloquea logros mientras juegas y demuestra tu dominio.',
      achievementsBtn: '🏅 LOGROS',
      unlockedCount: 'Desbloqueados',
      totalCount: 'Total',
      gamesPlayed: 'Partidas',
      bestStreak: 'Mejor racha',
      resetAchievements: '🗑️ Borrar logros',
      achievementUnlocked: '¡LOGRO DESBLOQUEADO!',
      confirmResetAchievements: '¿Borrar todos tus logros?',
      installAppBtn: '📲 INSTALAR APP',
      welcomeTitle: '¡BIENVENIDO A TU AVENTURA VOCACIONAL!',
      welcomeMission: '🎓 Misión:',
      welcomeMissionText: 'U.E.N. "Víctor Ángel Hernández" (Turmero, Edo. Aragua)',
      welcomeObjective: '🎯 Objetivo:',
      welcomeObjectiveText: 'Explorar las especialidades del futuro y descubrir tu verdadera vocación.',
      welcomeQuote: 'La transición a la universidad es el reto más importante de tu etapa escolar. Esta plataforma fue diseñada para que dejes de ser un espectador y te conviertas en el protagonista de tu futuro. Supera los desafíos, pon a prueba tus conocimientos en Informática, Contaduría, Mecánica, Electricidad y Telecomunicaciones, y descubre cuál es la carrera ideal para ti.',
      welcomeGalleryTitle: '✨ Nuestro Futuro ✨',
      startAdventureBtn: '🚀 COMENZAR MI AVENTURA',
      backToWelcome: '← Volver a la bienvenida',
      diffEasy: 'Fácil (30s)',
      diffMedium: 'Medio (20s)',
      diffHard: 'Difícil (10s)',
      areaInformatica: '💻 Informática',
      areaTelecom: '📡 Telecom',
      areaMecanica: '⚙️ Mecánica',
      areaElectricidad: '⚡ Electricidad',
      areaContaduria: '📊 Contaduría',
    },
    en: {
      backBtn: 'Back',
      loginTitle: 'SYSTEM LOGIN',
      loginDesc: 'Log in to record your vocational statistics.',
      labelUser: 'Username:',
      labelPass: 'Password:',
      loginBtn: 'LOGIN',
      guestBtn: 'Enter as Guest',
      registerLink: "Don't have an account? Register here",
      registerTitle: 'STUDENT REGISTRATION',
      registerDesc: 'Create a local profile to save your academic progress.',
      labelFullName: 'Full Name:',
      registerBtn: 'CONFIRM REGISTRATION',
      loginLink: 'Already have an account? Log in',
      recoverLink: 'Forgot your password?',
      passHint: 'Minimum 8 characters',
      configTitle: 'ACADEMIC SETTINGS PANEL',
      difficultyLabel: 'Challenge Difficulty:',
      areasLabel: 'Technical Specialties (Multiple Selection):',
      startTriviaBtn: 'START TRIVIA',
      practiceBtn: '🎯 PRACTICE MODE',
      practiceMode: '🎯 Practice Mode',
      viewSheetsBtn: 'ACADEMIC SHEETS',
      rankingBtn: '🏆 RANKING',
      rankingTitle: '🏆 PLAYER RANKING',
      rankingDesc: 'Top 5 scores by specialty.',
      clearRanking: '🗑️ Clear ranking',
      sheetsTitle: 'TECHNICAL ACADEMIC SHEETS',
      sheetsDesc: 'Explore the graduation profiles of university areas.',
      nextBtn: 'CONTINUE',
      labelLives: 'Lives:',
      labelTime: 'Time:',
      questionCounter: 'Question {current}/{total}',
      reportTitle: 'VOCATIONAL EVALUATION REPORT',
      reportSubtitle: 'Statistical results based on cognitive competencies.',
      reportStatsTitle: 'Affinity by Technical Specialty:',
      reportVerdictTitle: 'Vocational Orientation Verdict:',
      backMenuBtn: 'BACK TO PANEL',
      noAreas: 'Select at least one area.',
      notEnoughQuestions: 'Not enough questions for this combination.',
      gameOver: 'Out of lives! Try again.',
      correct: '✅ Correct!',
      incorrect: '❌ Incorrect',
      abandonTitle: 'Progress saved',
      abandonMsg: 'You have left the trivia.',
      closeSession: '🚪 Log out',
      progressTitle: '📊 YOUR PROGRESS',
      noProgress: 'You have not played any trivia yet.',
      bestAffinity: 'Best affinity',
      recentGames: 'Recent games',
      yourBest: '🏆 Your best score',
      shareTitle: '📢 Share result',
      shareWhatsapp: 'WhatsApp',
      shareTwitter: 'Twitter/X',
      shareCopy: '📋 Copy text',
      shareCopied: 'Text copied to clipboard!',
      rankingEmpty: 'No scores registered yet.',
      achievementsTitle: '🏅 ACHIEVEMENTS',
      achievementsDesc: 'Unlock achievements while playing and prove your mastery.',
      achievementsBtn: '🏅 ACHIEVEMENTS',
      unlockedCount: 'Unlocked',
      totalCount: 'Total',
      gamesPlayed: 'Games',
      bestStreak: 'Best streak',
      resetAchievements: '🗑️ Clear achievements',
      achievementUnlocked: 'ACHIEVEMENT UNLOCKED!',
      confirmResetAchievements: 'Clear all your achievements?',
      installAppBtn: '📲 INSTALL APP',
      welcomeTitle: 'WELCOME TO YOUR VOCATIONAL ADVENTURE!',
      welcomeMission: '🎓 Mission:',
      welcomeMissionText: 'U.E.N. "Víctor Ángel Hernández" High School (Turmero, Aragua State)',
      welcomeObjective: '🎯 Objective:',
      welcomeObjectiveText: 'Explore the specialties of the future and discover your true vocation.',
      welcomeQuote: 'The transition to university is the most important challenge of your school stage. This platform was designed so you stop being a spectator and become the protagonist of your future. Overcome challenges, test your knowledge in Computer Science, Accounting, Mechanics, Electrical and Telecommunications, and discover which is the ideal career for you.',
      welcomeGalleryTitle: '✨ Our Future ✨',
      startAdventureBtn: '🚀 START MY ADVENTURE',
      backToWelcome: '← Back to welcome',
      diffEasy: 'Easy (30s)',
      diffMedium: 'Medium (20s)',
      diffHard: 'Hard (10s)',
      areaInformatica: '💻 Computer Science',
      areaTelecom: '📡 Telecom',
      areaMecanica: '⚙️ Mechanics',
      areaElectricidad: '⚡ Electrical',
      areaContaduria: '📊 Accounting',
    }
  };

  // --- TRADUCIR INTERFAZ ---
  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[currentLanguage] && i18n[currentLanguage][key]) {
        el.innerText = i18n[currentLanguage][key];
      }
    });
    const btnEs = document.getElementById('btn-lang-es');
    const btnEn = document.getElementById('btn-lang-en');
    if (btnEs) btnEs.classList.toggle('active', currentLanguage === 'es');
    if (btnEn) btnEn.classList.toggle('active', currentLanguage === 'en');
  }

  // --- NAVEGACIÓN ---
  function showView(viewId) {
    document.querySelectorAll('.view-box').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');

    const backBtn = document.getElementById('btn-global-back');
    
    if (viewId === 'screen-welcome' || viewId === 'screen-register' || viewId === 'screen-recover') {
      backBtn.classList.add('hidden');
    } else if (viewId === 'screen-login') {
      backBtn.classList.remove('hidden');
      const backSpan = backBtn.querySelector('[data-i18n]');
      if (backSpan) backSpan.innerText = i18n[currentLanguage].backBtn;
      backBtn.onclick = () => showView('screen-welcome');
    } else {
      backBtn.classList.remove('hidden');
      const backSpan = backBtn.querySelector('[data-i18n]');
      if (backSpan) backSpan.innerText = i18n[currentLanguage].backBtn;
      backBtn.onclick = defaultBackBehavior;
    }

    if (viewId === 'screen-game') {
      backBtn.onclick = abandonGame;
    }
  }

  function defaultBackBehavior() {
    clearTimer();
    const visibleView = document.querySelector('.view-box:not(.hidden)');
    if (!visibleView) return;
    const id = visibleView.id;

    if (id === 'screen-sheets' || id === 'screen-report' || id === 'screen-ranking' || id === 'screen-achievements') {
      showView('screen-config');
      renderProgressPanel();
    } else if (id === 'screen-config') {
      document.querySelectorAll('.view-box').forEach(v => v.classList.add('hidden'));
      document.getElementById('screen-login').classList.remove('hidden');
      document.getElementById('btn-global-back').classList.add('hidden');
    } else if (id === 'screen-recover') {
      document.getElementById('screen-recover').classList.add('hidden');
      document.getElementById('screen-login').classList.remove('hidden');
    }
  }

  // --- CAMBIO DE IDIOMA ---
  document.getElementById('btn-lang-es').addEventListener('click', () => {
    currentLanguage = 'es';
    translateUI();
    refreshDynamicContent();
  });

  document.getElementById('btn-lang-en').addEventListener('click', () => {
    currentLanguage = 'en';
    translateUI();
    refreshDynamicContent();
  });

  // --- PANTALLA DE BIENVENIDA ---
  const startAdventureBtn = document.getElementById('btn-start-adventure');
  if (startAdventureBtn) {
    startAdventureBtn.addEventListener('click', () => {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('start');
      showView('screen-login');
    });
  }

  // --- BOTÓN VOLVER A LA BIENVENIDA DESDE EL LOGIN ---
  const backToWelcomeLink = document.getElementById('link-back-to-welcome');
  if (backToWelcomeLink) {
    backToWelcomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      showView('screen-welcome');
    });
  }

  function refreshDynamicContent() {
    if (!document.getElementById('screen-game').classList.contains('hidden')) {
      updateQuestionCounter();
    }
    if (!document.getElementById('screen-sheets').classList.contains('hidden')) {
      const activeSheet = document.querySelector('.btn-sheet-select.active');
      if (activeSheet) renderSheet(activeSheet.dataset.sheet);
    }
    if (!document.getElementById('screen-config').classList.contains('hidden')) {
      renderProgressPanel();
    }
    if (!document.getElementById('screen-ranking').classList.contains('hidden')) {
      renderRanking();
    }
    if (!document.getElementById('screen-achievements').classList.contains('hidden')) {
      renderAchievements();
    }
  }

  // --- AUTENTICACIÓN ---
  window.addEventListener('authSuccess', (event) => {
    currentUser = event.detail.username;
    isGuest = event.detail.isGuest;
    localStorage.setItem('activeUser', currentUser);
    showView('screen-config');
    translateUI();
    renderProgressPanel();
  });

  // --- SELECCIÓN DE ÁREAS Y DIFICULTAD ---
  document.querySelectorAll('.btn-area').forEach(btn => {
    btn.addEventListener('click', function () {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      const area = this.dataset.area;
      if (selectedAreas.includes(area)) {
        selectedAreas = selectedAreas.filter(a => a !== area);
        this.classList.remove('active');
      } else {
        selectedAreas.push(area);
        this.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.btn-diff').forEach(btn => {
    btn.addEventListener('click', function () {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('btn-active'));
      this.classList.add('btn-active');
      selectedDifficulty = this.dataset.diff;
    });
  });

  // --- INICIAR TRIVIA ---
  document.getElementById('btn-start-trivia').addEventListener('click', () => {
    if (typeof SoundSystem !== 'undefined') SoundSystem.play('start');
    if (selectedAreas.length === 0) {
      alert(i18n[currentLanguage].noAreas);
      return;
    }
    practiceMode = false;
    startTrivia();
  });

  // --- MODO PRÁCTICA ---
  const practiceBtn = document.getElementById('btn-practice-mode');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', () => {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('start');
      if (selectedAreas.length === 0) {
        alert(i18n[currentLanguage].noAreas);
        return;
      }
      practiceMode = true;
      startTrivia();
    });
  }

  // --- VER RANKING ---
  const rankingBtn = document.getElementById('btn-view-ranking');
  if (rankingBtn) {
    rankingBtn.addEventListener('click', () => {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      showView('screen-ranking');
      renderRanking();
    });
  }

  // --- BORRAR RANKING ---
  const clearRankingBtn = document.getElementById('btn-clear-ranking');
  if (clearRankingBtn) {
    clearRankingBtn.addEventListener('click', () => {
      if (confirm('¿Borrar el ranking? Esta acción no se puede deshacer.')) {
        RankingSystem.clearRanking();
        renderRanking();
      }
    });
  }

  function startTrivia() {
    const pool = [];
    for (const area of selectedAreas) {
      const difficultyQuestions = questionsBank[area]?.[selectedDifficulty];
      if (difficultyQuestions) {
        const langQuestions = difficultyQuestions[currentLanguage] || [];
        for (const q of langQuestions) {
          pool.push({ ...q, area: area });
        }
      }
    }

    if (pool.length === 0) {
      alert(i18n[currentLanguage].notEnoughQuestions);
      return;
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    gameQuestions = pool.slice(0, TOTAL_QUESTIONS);
    currentQuestionIndex = 0;
    currentScore = 0;
    lives = 3;
    areaPerformance = {};
    sessionStats = {};
    currentStreak = 0;
    maxStreakThisGame = 0;
    gameStartTime = Date.now();

    for (const area of selectedAreas) {
      areaPerformance[area] = { total: 0, correct: 0 };
    }

    const practiceIndicator = document.getElementById('practice-indicator');
    if (practiceIndicator) {
      practiceIndicator.style.display = practiceMode ? 'block' : 'none';
    }

    updateLivesDisplay();
    createQuestionCounterElement();
    updateQuestionCounter();
    showQuestion();
    showView('screen-game');
    updateGameAvatar();
  }

  function createQuestionCounterElement() {
    if (document.getElementById('question-counter')) return;
    const container = document.querySelector('#screen-game .question-container');
    const counterDiv = document.createElement('div');
    counterDiv.id = 'question-counter';
    counterDiv.style.textAlign = 'center';
    counterDiv.style.fontWeight = 'bold';
    counterDiv.style.marginBottom = '15px';
    container.insertBefore(counterDiv, document.getElementById('question-text'));
  }

  function updateQuestionCounter() {
    const counter = document.getElementById('question-counter');
    if (counter) {
      const total = gameQuestions.length;
      const current = currentQuestionIndex + 1;
      counter.innerText = i18n[currentLanguage].questionCounter
        .replace('{current}', current)
        .replace('{total}', total);
    }
  }

  function updateGameAvatar() {
    const img = document.getElementById('game-avatar-img');
    if (img) {
      if (gameQuestions.length > 0 && gameQuestions[currentQuestionIndex]) {
        const area = gameQuestions[currentQuestionIndex].area;
        const avatarMap = {
          informatica: 'https://i.postimg.cc/9f8d1SBw/informatico-trivias.jpg',
          telecomunicaciones: 'https://i.postimg.cc/3wSX96ZG/telecomunicaciones-trivias.jpg',
          mecanica: 'https://i.postimg.cc/mrXYVqSk/mecanico-trivias.jpg',
          electricidad: 'https://i.postimg.cc/W4WGSK7d/electricista-trivias.jpg',
          contaduria: 'https://i.postimg.cc/zftCpMkb/contaduria-trivias.jpg'
        };
        img.src = avatarMap[area] || 'assets/avatars/default.png';
      } else {
        img.src = 'assets/avatars/default.png';
      }
    }
  }

  function showQuestion() {
    clearTimer();
    if (currentQuestionIndex >= gameQuestions.length) {
      finishGame();
      return;
    }

    const q = gameQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    if (!practiceMode) {
      const times = { easy: 30, medium: 20, hard: 10 };
      timeLeft = times[selectedDifficulty] || 30;
      document.getElementById('timer-counter').innerText = timeLeft;
      startTimer();
    } else {
      document.getElementById('timer-counter').innerText = '∞';
    }

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.innerText = opt;
      btn.onclick = () => handleAnswer(idx, q);
      container.appendChild(btn);
    });

    updateGameAvatar();
    updateQuestionCounter();
  }

  function handleAnswer(selectedIdx, question) {
    clearTimer();
    const isCorrect = (selectedIdx === question.answer);

    if (areaPerformance[question.area]) {
      areaPerformance[question.area].total++;
      if (isCorrect) {
        areaPerformance[question.area].correct++;
      }
    }

    if (isCorrect) {
      currentScore++;
      currentStreak++;
      if (currentStreak > maxStreakThisGame) maxStreakThisGame = currentStreak;
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('correct');
      document.getElementById('screen-game').classList.add('screen-flash-correct');
      setTimeout(() => document.getElementById('screen-game').classList.remove('screen-flash-correct'), 300);
    } else {
      currentStreak = 0;
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('wrong');
      if (!practiceMode) {
        lives--;
        updateLivesDisplay();
      }
      document.getElementById('screen-game').classList.add('screen-flash-wrong');
      setTimeout(() => document.getElementById('screen-game').classList.remove('screen-flash-wrong'), 300);

      if (!practiceMode && lives <= 0) {
        if (typeof SoundSystem !== 'undefined') SoundSystem.play('gameOver');
        alert(i18n[currentLanguage].gameOver);
        finishGame();
        return;
      }
    }

    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.classList.remove('hidden');
    document.getElementById('feedback-title').innerText = isCorrect ? i18n[currentLanguage].correct : i18n[currentLanguage].incorrect;
    document.getElementById('feedback-explanation').innerText = question.explanation;

    document.getElementById('btn-next').onclick = () => {
      feedbackBox.classList.add('hidden');
      currentQuestionIndex++;
      showQuestion();
    };
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timer-counter').innerText = timeLeft;
      if (timeLeft <= 0) {
        clearTimer();
        lives--;
        currentStreak = 0;
        updateLivesDisplay();
        if (typeof SoundSystem !== 'undefined') SoundSystem.play('wrong');
        const currentQ = gameQuestions[currentQuestionIndex];
        if (currentQ && areaPerformance[currentQ.area]) {
          areaPerformance[currentQ.area].total++;
        }
        if (lives <= 0) {
          if (typeof SoundSystem !== 'undefined') SoundSystem.play('gameOver');
          alert(i18n[currentLanguage].gameOver);
          finishGame();
        } else {
          currentQuestionIndex++;
          showQuestion();
        }
      }
    }, 1000);
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateLivesDisplay() {
    const livesSpan = document.getElementById('lives-display');
    if (livesSpan) livesSpan.innerHTML = '❤️'.repeat(Math.max(0, lives));
  }

  function abandonGame() {
    clearTimer();
    sessionStats = {};
    for (const area in areaPerformance) {
      const perf = areaPerformance[area];
      if (perf.total > 0) {
        sessionStats[area] = Math.round((perf.correct / perf.total) * 100);
      } else {
        sessionStats[area] = 0;
      }
    }
    if (typeof ProgressSystem !== 'undefined' && Object.keys(sessionStats).length > 0 && !practiceMode) {
      ProgressSystem.saveGame(sessionStats, currentScore, selectedAreas);
    }
    showReport(true);
  }

  function finishGame() {
    clearTimer();
    sessionStats = {};
    for (const area in areaPerformance) {
      const perf = areaPerformance[area];
      if (perf.total > 0) {
        sessionStats[area] = Math.round((perf.correct / perf.total) * 100);
      } else {
        sessionStats[area] = 0;
      }
    }

    if (!practiceMode) {
      if (typeof ProgressSystem !== 'undefined') {
        ProgressSystem.saveGame(sessionStats, currentScore, selectedAreas);
      }
      if (typeof RankingSystem !== 'undefined' && currentUser) {
        for (const [area, score] of Object.entries(sessionStats)) {
          if (score > 0) {
            RankingSystem.saveScore(currentUser, area, score);
          }
        }
      }
      if (typeof AchievementsSystem !== 'undefined') {
        AchievementsSystem.incrementGames();
        AchievementsSystem.updateBestStreak(maxStreakThisGame);
        AchievementsSystem.checkAchievements(sessionStats, {
          lives: lives,
          streak: maxStreakThisGame,
          time: gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 999,
          totalCorrect: currentScore,
          areasPlayed: selectedAreas
        });
      }
    }

    if (typeof SoundSystem !== 'undefined' && !practiceMode) SoundSystem.play('win');
    showReport(false);
  }

  function showReport(abandoned = false) {
    showView('screen-report');
    translateUI();

    const container = document.getElementById('chart-bars-container');
    container.innerHTML = '';

    let maxArea = '';
    let maxScore = 0;
    for (const [area, score] of Object.entries(sessionStats)) {
      const areaName = ProgressSystem.translateArea(area, currentLanguage);
      container.innerHTML += `<div><strong>${areaName}:</strong> ${score}%</div>`;
      if (score > maxScore) {
        maxScore = score;
        maxArea = area;
      }
    }

    const verdictText = document.getElementById('report-verdict-text');
    if (abandoned) {
      verdictText.innerText = currentLanguage === 'es'
        ? 'Has abandonado la trivia. Resultados parciales:'
        : 'You have left the trivia. Partial results:';
    } else if (maxArea) {
      const areaName = ProgressSystem.translateArea(maxArea, currentLanguage);
      verdictText.innerText = currentLanguage === 'es'
        ? `Tu mayor afinidad es con ${areaName} (${maxScore}%). ¡Enhorabuena!`
        : `Your highest affinity is with ${areaName} (${maxScore}%). Congratulations!`;
    } else {
      verdictText.innerText = currentLanguage === 'es'
        ? 'No se pudieron calcular afinidades. Intenta de nuevo.'
        : 'Could not calculate affinities. Try again.';
    }

    const existingBest = document.getElementById('report-best');
    if (existingBest) existingBest.remove();

    if (typeof ProgressSystem !== 'undefined') {
      const best = ProgressSystem.getBest();
      const reportContainer = document.querySelector('.report-verdict');
      if (reportContainer && best.score > 0) {
        const bestDiv = document.createElement('p');
        bestDiv.id = 'report-best';
        bestDiv.style.marginTop = '15px';
        bestDiv.style.borderTop = '2px solid var(--accent-yellow)';
        bestDiv.style.paddingTop = '10px';
        const bestAreaName = ProgressSystem.translateArea(best.area, currentLanguage);
        bestDiv.innerHTML = `<strong>${i18n[currentLanguage].yourBest}:</strong> ${bestAreaName} (${best.score}%)`;
        reportContainer.appendChild(bestDiv);
      }
    }

    setupShareButtons(maxArea, maxScore);
  }

  function setupShareButtons(area, score) {
    const btnWA = document.getElementById('btn-share-whatsapp');
    const btnTW = document.getElementById('btn-share-twitter');
    const btnCopy = document.getElementById('btn-share-copy');

    if (!btnWA) return;

    const user = currentUser || 'Invitado';
    const text = ShareSystem.generateText(user, area, score, currentLanguage);

    btnWA.onclick = () => ShareSystem.shareWhatsApp(text);
    btnTW.onclick = () => ShareSystem.shareTwitter(text);
    btnCopy.onclick = async () => {
      const ok = await ShareSystem.copyToClipboard(text);
      if (ok) {
        const toast = document.createElement('div');
        toast.className = 'toast-bubble toast-success';
        toast.innerText = i18n[currentLanguage].shareCopied;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      }
    };
  }

  document.getElementById('btn-finish-report').addEventListener('click', () => {
    showView('screen-config');
    translateUI();
    renderProgressPanel();
  });

  // --- PANEL DE PROGRESO ---
  function renderProgressPanel() {
    const container = document.getElementById('progress-content');
    if (!container) return;
    if (typeof ProgressSystem === 'undefined') return;

    const history = ProgressSystem.getHistory();
    const best = ProgressSystem.getBest();

    if (history.length === 0) {
      container.innerHTML = `<p style="text-align:center;">${i18n[currentLanguage].noProgress}</p>`;
      return;
    }

    let html = `<p><strong>${i18n[currentLanguage].bestAffinity}:</strong> ${ProgressSystem.translateArea(best.area, currentLanguage)} (${best.score}%)</p>`;
    html += `<h4 style="margin-top:15px;">${i18n[currentLanguage].recentGames}:</h4>`;

    history.forEach((game, i) => {
      html += `
        <div class="progress-item">
          <span>#${i + 1} - ${ProgressSystem.formatDate(game.date)}</span>
          <span>${ProgressSystem.translateArea(game.bestArea, currentLanguage)}: ${game.bestScore}%</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // --- RANKING ---
  function renderRanking() {
    const container = document.getElementById('ranking-content');
    if (!container) return;

    const areas = ['informatica', 'telecomunicaciones', 'mecanica', 'electricidad', 'contaduria'];
    let hasData = false;
    let html = '';

    for (const area of areas) {
      const top = RankingSystem.getTopByArea(area);
      if (top.length > 0) {
        hasData = true;
        const areaName = ProgressSystem.translateArea(area, currentLanguage);
        html += `<div class="ranking-section"><h3>${areaName}</h3>`;
        top.forEach((item, i) => {
          const posClass = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : '';
          html += `
            <div class="ranking-row ${posClass}">
              <span class="user-name">${item.user}</span>
              <span class="score">${item.score}%</span>
            </div>
          `;
        });
        html += `</div>`;
      }
    }

    if (!hasData) {
      container.innerHTML = `<p style="text-align:center;">${i18n[currentLanguage].rankingEmpty}</p>`;
    } else {
      container.innerHTML = html;
    }
  }

  // --- LOGROS ---
  const achievementsBtn = document.getElementById('btn-view-achievements');
  if (achievementsBtn) {
    achievementsBtn.addEventListener('click', () => {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      showView('screen-achievements');
      renderAchievements();
    });
  }

  const resetAchievementsBtn = document.getElementById('btn-reset-achievements');
  if (resetAchievementsBtn) {
    resetAchievementsBtn.addEventListener('click', () => {
      if (confirm(i18n[currentLanguage].confirmResetAchievements)) {
        AchievementsSystem.resetAchievements();
        renderAchievements();
      }
    });
  }

  window.addEventListener('achievementUnlocked', (e) => {
    showAchievementNotification(e.detail.achievement);
  });

  function renderAchievements() {
    const container = document.getElementById('achievements-content');
    if (!container || typeof AchievementsSystem === 'undefined') return;

    const all = AchievementsSystem.getAll();
    const data = AchievementsSystem.getAchievements();

    const elUnlocked = document.getElementById('achievements-unlocked');
    const elTotal = document.getElementById('achievements-total');
    const elGames = document.getElementById('achievements-games');
    const elStreak = document.getElementById('achievements-streak');

    if (elUnlocked) elUnlocked.innerText = AchievementsSystem.getUnlockedCount();
    if (elTotal) elTotal.innerText = all.length;
    if (elGames) elGames.innerText = data.totalGames;
    if (elStreak) elStreak.innerText = data.bestStreak;

    container.innerHTML = all.map(a => {
      const name = a.name[currentLanguage] || a.name.es;
      const desc = a.desc[currentLanguage] || a.desc.es;
      return `
        <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
          ${a.unlocked ? '' : '<span class="achievement-lock">🔒</span>'}
          <div class="achievement-emoji">${a.emoji}</div>
          <div class="achievement-name">${name}</div>
          <div class="achievement-desc">${desc}</div>
        </div>
      `;
    }).join('');
  }

  function showAchievementNotification(logro) {
    const container = document.getElementById('achievement-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="achievement-toast-emoji">${logro.emoji}</span>
      <div class="achievement-toast-text">
        <span class="achievement-toast-title">${i18n[currentLanguage].achievementUnlocked}</span>
        <span class="achievement-toast-name">${logro.name[currentLanguage] || logro.name.es}</span>
      </div>
    `;
    container.appendChild(toast);

    if (typeof SoundSystem !== 'undefined') SoundSystem.play('win');

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // --- FICHAS ---
  document.getElementById('btn-view-sheets').addEventListener('click', () => {
    if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
    showView('screen-sheets');
    translateUI();
    const firstBtn = document.querySelector('.btn-sheet-select');
    if (firstBtn) firstBtn.click();
  });

  document.querySelector('.btn-group-sheets').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-sheet-select')) {
      if (typeof SoundSystem !== 'undefined') SoundSystem.play('click');
      document.querySelectorAll('.btn-sheet-select').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderSheet(e.target.dataset.sheet);
    }
  });

  function renderSheet(key) {
    const ficha = fichasAcademicas[key];
    if (!ficha) return;

    const data = ficha[currentLanguage] || ficha['es'];

    document.getElementById('sheet-title-display').innerText = data.title;
    document.getElementById('sheet-body-display').innerHTML = `
      <p>${data.body}</p>
      <p><strong>${currentLanguage === 'es' ? 'Perfil' : 'Profile'}:</strong> ${data.perfil}</p>
      <p><strong>${currentLanguage === 'es' ? 'Habilidades' : 'Skills'}:</strong> ${data.habilidades.join(', ')}</p>
      <p><strong>${currentLanguage === 'es' ? 'Campo laboral' : 'Labor field'}:</strong> ${data.campoLaboral.join(', ')}</p>
    `;

    const avatarImg = document.getElementById('ficha-avatar-img');
    if (avatarImg) {
      const avatarMap = {
        informatica: 'https://i.postimg.cc/brd1KR3x/informatica-fichas.jpg',
        telecomunicaciones: 'https://i.postimg.cc/gjr3fKN3/telecomunicaciones-fichas.jpg',
        mecanica: 'https://i.postimg.cc/hvhVH0pb/mecanico-fichas.jpg',
        electricidad: 'https://i.postimg.cc/XqX9TgQg/electricista-fichas.jpg',
        contaduria: 'https://i.postimg.cc/Fz102xDV/contaduria-fichas.jpg'
      };
      avatarImg.src = avatarMap[key] || 'assets/avatars/default.png';
      avatarImg.onerror = function() {
        this.src = 'assets/avatars/default.png';
      };
    }
  }

  // --- PWA: INSTALACIÓN ---
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-install-pwa');
    if (btn) btn.classList.remove('hidden');
  });

  const installBtn = document.getElementById('btn-install-pwa');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('👤 Usuario aceptó instalar Pixel Vocacional');
      }
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('btn-install-pwa');
    if (btn) btn.classList.add('hidden');
    console.log('🎉 Pixel Vocacional instalada como aplicación');
  });

  // --- INICIALIZACIÓN ---
  showView('screen-welcome');
  translateUI();
});