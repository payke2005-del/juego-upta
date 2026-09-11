let currentUILanguage = 'es';

// Inicializar EmailJS
(function() {
  if (typeof EMAILJS_PUBLIC_KEY !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('✅ EmailJS inicializado correctamente');
    };
    script.onerror = () => {
      console.error('❌ No se pudo cargar EmailJS.');
    };
    document.head.appendChild(script);
  } else {
    console.warn('⚠️ EmailJS no configurado. Usando modo simulación.');
  }
})();

function showSystemToast(messageKey, type = 'error', customText = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const lang = window.currentLanguage || 'es';
  const messages = {
    es: {
      loginSuccess: '¡Sesión iniciada correctamente!',
      loginError: 'Credenciales inválidas.',
      registerSuccess: '¡Registro exitoso! Ya puedes iniciar sesión.',
      registerError: 'Error en el registro.',
      guest: 'Ingresaste como invitado.',
      passLength: 'La contraseña debe tener mínimo 8 caracteres.',
      userExists: 'El usuario ya existe.',
      emailRequired: 'El correo electrónico es obligatorio.',
      recoverCodeSent: 'Código enviado a tu correo. Revisa tu bandeja.',
      recoverCodeSentError: 'Error al enviar el correo. Intenta de nuevo.',
      recoverResent: 'Código reenviado. Revisa tu correo.',
      recoverCooldown: 'Espera {s} segundos para reenviar.',
      recoverMaxAttempts: 'Has alcanzado el máximo de reenvíos (4).',
      recoverSuccess: 'Contraseña actualizada correctamente.',
      recoverError: 'Usuario o correo no encontrado.',
      recoverInvalidCode: 'Código incorrecto.',
      recoverPassLength: 'La nueva contraseña debe tener mínimo 8 caracteres.',
      logoutSuccess: 'Sesión cerrada correctamente.'
    },
    en: {
      loginSuccess: 'Login successful!',
      loginError: 'Invalid credentials.',
      registerSuccess: 'Registration successful! You can now log in.',
      registerError: 'Registration error.',
      guest: 'Entered as guest.',
      passLength: 'Password must be at least 8 characters.',
      userExists: 'Username already exists.',
      emailRequired: 'Email is required.',
      recoverCodeSent: 'Code sent to your email. Check your inbox.',
      recoverCodeSentError: 'Error sending email. Try again.',
      recoverResent: 'Code resent. Check your email.',
      recoverCooldown: 'Wait {s} seconds to resend.',
      recoverMaxAttempts: 'You have reached the maximum resends (4).',
      recoverSuccess: 'Password updated successfully.',
      recoverError: 'User or email not found.',
      recoverInvalidCode: 'Invalid code.',
      recoverPassLength: 'New password must be at least 8 characters.',
      logoutSuccess: 'Logged out successfully.'
    }
  };

  const text = customText || messages[lang][messageKey] || messageKey;
  const toast = document.createElement('div');
  toast.className = `toast-bubble toast-${type}`;
  toast.innerText = text;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('usersDB')) {
    localStorage.setItem('usersDB', JSON.stringify({
      'admin': { pass: '12345678', name: 'Admin', email: 'admin@upta.edu' }
    }));
  }

  // ========== MOSTRAR/OCULTAR CONTRASEÑA ==========
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = '🙈';
          this.title = 'Ocultar contraseña';
        } else {
          input.type = 'password';
          this.textContent = '👁️';
          this.title = 'Mostrar contraseña';
        }
      }
    });
  });

  // ========== AUTOCOMPLETADO DE DOMINIOS DE CORREO ==========
  function attachEmailAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Crear contenedor de sugerencias
    const wrapper = input.parentElement;
    if (wrapper.querySelector('.email-suggestions')) return;

    const suggestions = document.createElement('div');
    suggestions.className = 'email-suggestions hidden';
    wrapper.style.position = 'relative';
    wrapper.appendChild(suggestions);

    const domains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];

    input.addEventListener('input', function() {
      const val = this.value.trim();
      if (val.includes('@') && val.split('@')[1].length > 0) {
        suggestions.classList.add('hidden');
        return;
      }

      if (val.length > 0 && !val.includes('@')) {
        suggestions.innerHTML = '';
        domains.forEach(dom => {
          const item = document.createElement('div');
          item.className = 'email-suggestion-item';
          item.innerText = val + dom;
          item.addEventListener('click', () => {
            input.value = val + dom;
            suggestions.classList.add('hidden');
            input.focus();
          });
          suggestions.appendChild(item);
        });
        suggestions.classList.remove('hidden');
      } else {
        suggestions.classList.add('hidden');
      }
    });

    // Ocultar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        suggestions.classList.add('hidden');
      }
    });
  }

  attachEmailAutocomplete('reg-email');
  attachEmailAutocomplete('recover-email');

  // ========== NAVEGACIÓN ==========
  document.getElementById('link-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-register').classList.remove('hidden');
  });

  document.getElementById('link-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('screen-register').classList.add('hidden');
    document.getElementById('screen-login').classList.remove('hidden');
  });

  document.getElementById('link-to-recover')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-recover').classList.remove('hidden');
    resetRecoverForm();
  });

  document.getElementById('link-recover-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('screen-recover').classList.add('hidden');
    document.getElementById('screen-login').classList.remove('hidden');
    resetRecoverForm();
  });

  function resetRecoverForm() {
    const form = document.getElementById('form-recover');
    if (!form) return;
    form.reset();
    document.getElementById('recover-code-group').classList.add('hidden');
    document.getElementById('recover-new-pass-group').classList.add('hidden');
    const btn = document.getElementById('btn-recover-submit');
    if (btn) btn.textContent = 'ENVIAR CÓDIGO';
    const resendContainer = document.getElementById('resend-container');
    if (resendContainer) resendContainer.remove();
    recoveryUser = null;
    recoveryCode = null;
    resendCount = 0;
  }

  // ========== LOGIN ==========
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value.trim();
      const db = JSON.parse(localStorage.getItem('usersDB'));

      if (db[user] && db[user].pass === pass) {
        window.dispatchEvent(new CustomEvent('authSuccess', {
          detail: { username: user, isGuest: false }
        }));
        showSystemToast('loginSuccess', 'success');
      } else {
        showSystemToast('loginError', 'error');
      }
    });
  }

  // ========== REGISTRO ==========
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('reg-fullname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const user = document.getElementById('reg-user').value.trim();
      const pass = document.getElementById('reg-pass').value.trim();
      const db = JSON.parse(localStorage.getItem('usersDB'));

      if (!email) {
        showSystemToast('emailRequired', 'error');
        return;
      }
      if (pass.length < 8) {
        showSystemToast('passLength', 'error');
        return;
      }
      if (db[user]) {
        showSystemToast('userExists', 'warning');
        return;
      }

      db[user] = { pass, name: fullName, email };
      localStorage.setItem('usersDB', JSON.stringify(db));
      showSystemToast('registerSuccess', 'success');

      setTimeout(() => {
        document.getElementById('screen-register').classList.add('hidden');
        document.getElementById('screen-login').classList.remove('hidden');
        document.getElementById('form-register').reset();
      }, 2000);
    });
  }

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========
  let recoveryUser = null;
  let recoveryCode = null;
  let resendCount = 0;
  let resendCooldown = 0;
  let cooldownInterval = null;

  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function sendEmail(toEmail, code) {
    if (typeof emailjs === 'undefined') {
      console.log('📧 EmailJS no cargado. Código simulado:', code);
      return true;
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        user_email: toEmail,
        reply_to: toEmail,
        code: code
      });
      return true;
    } catch (error) {
      console.error('❌ Error EmailJS:', error);
      return false;
    }
  }

  function createResendButton() {
    if (document.getElementById('resend-container')) return;

    const codeGroup = document.getElementById('recover-code-group');
    if (!codeGroup) return;

    const container = document.createElement('div');
    container.id = 'resend-container';
    container.style.textAlign = 'center';
    container.style.marginTop = '10px';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-resend-code';
    btn.className = 'btn-secondary';
    btn.style.fontSize = '0.75rem';
    btn.innerText = currentUILanguage === 'es' ? 'Reenviar código' : 'Resend code';
    btn.addEventListener('click', handleResend);
    container.appendChild(btn);

    const info = document.createElement('p');
    info.id = 'resend-info';
    info.style.fontFamily = 'Silkscreen, monospace';
    info.style.fontSize = '0.7rem';
    info.style.color = 'var(--accent-orange)';
    info.style.marginTop = '8px';
    info.innerText = currentUILanguage === 'es' ? 'Reenvíos disponibles: 4' : 'Resends available: 4';
    container.appendChild(info);

    codeGroup.parentElement.insertBefore(container, codeGroup.nextSibling);
  }

  async function handleResend() {
    if (resendCount >= 4) {
      showSystemToast('recoverMaxAttempts', 'warning');
      return;
    }
    if (resendCooldown > 0) {
      const msg = currentUILanguage === 'es'
        ? `Espera ${resendCooldown} segundos para reenviar.`
        : `Wait ${resendCooldown} seconds to resend.`;
      showSystemToast(null, 'warning', msg);
      return;
    }

    const email = localStorage.getItem('recoverEmailTemp');
    if (!email) return;

    recoveryCode = generateCode();
    const sent = await sendEmail(email, recoveryCode);

    if (sent) {
      resendCount++;
      showSystemToast('recoverResent', 'success');
      const info = document.getElementById('resend-info');
      if (info) {
        const remaining = 4 - resendCount;
        info.innerText = currentUILanguage === 'es'
          ? `Reenvíos disponibles: ${remaining}`
          : `Resends available: ${remaining}`;
      }
      startCooldown(15);
    } else {
      showSystemToast('recoverCodeSentError', 'error');
    }
  }

  function startCooldown(seconds) {
    resendCooldown = seconds;
    const btn = document.getElementById('btn-resend-code');
    if (btn) btn.disabled = true;

    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      resendCooldown--;
      if (btn) {
        btn.innerText = currentUILanguage === 'es'
          ? `Reenviar en ${resendCooldown}s`
          : `Resend in ${resendCooldown}s`;
      }
      if (resendCooldown <= 0) {
        clearInterval(cooldownInterval);
        if (btn) {
          btn.disabled = false;
          btn.innerText = currentUILanguage === 'es' ? 'Reenviar código' : 'Resend code';
        }
      }
    }, 1000);
  }

  const formRecover = document.getElementById('form-recover');
  if (formRecover) {
    formRecover.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('recover-user').value.trim();
      const email = document.getElementById('recover-email').value.trim();
      const db = JSON.parse(localStorage.getItem('usersDB'));

      // FASE 1: Enviar código
      if (document.getElementById('recover-code-group').classList.contains('hidden')) {
        if (db[user] && db[user].email === email) {
          recoveryUser = user;
          recoveryCode = generateCode();
          localStorage.setItem('recoverEmailTemp', email);

          const sent = await sendEmail(email, recoveryCode);
          if (sent) {
            showSystemToast('recoverCodeSent', 'success');
            document.getElementById('recover-code-group').classList.remove('hidden');
            document.getElementById('btn-recover-submit').textContent = 'VERIFICAR CÓDIGO';
            resendCount = 0;
            createResendButton();
          } else {
            showSystemToast('recoverCodeSentError', 'error');
          }
        } else {
          showSystemToast('recoverError', 'error');
        }
        return;
      }

      // FASE 2: Verificar código
      if (document.getElementById('recover-new-pass-group').classList.contains('hidden')) {
        const code = document.getElementById('recover-code').value.trim();
        if (code === recoveryCode) {
          document.getElementById('recover-new-pass-group').classList.remove('hidden');
          document.getElementById('btn-recover-submit').textContent = 'CAMBIAR CONTRASEÑA';
        } else {
          showSystemToast('recoverInvalidCode', 'error');
        }
        return;
      }

      // FASE 3: Cambiar contraseña
      const newPass = document.getElementById('recover-new-pass').value.trim();
      if (newPass.length < 8) {
        showSystemToast('recoverPassLength', 'error');
        return;
      }

      db[recoveryUser].pass = newPass;
      localStorage.setItem('usersDB', JSON.stringify(db));
      localStorage.removeItem('recoverEmailTemp');
      showSystemToast('recoverSuccess', 'success');

      setTimeout(() => {
        document.getElementById('screen-recover').classList.add('hidden');
        document.getElementById('screen-login').classList.remove('hidden');
        resetRecoverForm();
      }, 2000);
    });
  }

  // ========== INVITADO ==========
  document.getElementById('btn-guest-login')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('authSuccess', {
      detail: { username: 'Invitado', isGuest: true }
    }));
    showSystemToast('guest', 'success');
  });

  // ========== CERRAR SESIÓN ==========
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    document.querySelectorAll('.view-box').forEach(v => v.classList.add('hidden'));
    document.getElementById('screen-login').classList.remove('hidden');
    document.getElementById('btn-global-back').classList.add('hidden');
    document.getElementById('form-login').reset();
    showSystemToast('logoutSuccess', 'success');
  });
});