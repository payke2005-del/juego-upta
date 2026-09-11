// ==========================================================================
// CHATBOT PIXEL VOCACIONAL (OpenRouter API, solo online)
// ==========================================================================

(function() {
  if (!navigator.onLine) return;

  // --- INTERFAZ ---
  const chatHTML = `
    <div id="pixel-chat-container" style="position:fixed; bottom:20px; right:20px; z-index:9999;">
      <button id="pixel-chat-toggle" style="
        background:#cc0000; border:3px solid #fff; color:#fff; font-family:'Press Start 2P',monospace;
        font-size:1.2rem; width:60px; height:60px; border-radius:0; cursor:pointer; box-shadow:4px 4px 0 #000;
      ">💬</button>
      <div id="pixel-chat-window" style="
        display:none; position:absolute; bottom:70px; right:0; width:320px; height:450px;
        background:var(--bg-secondary,#1a1c2c); border:4px solid var(--accent-red,#cc0000);
        box-shadow:6px 6px 0 #000; padding:15px; flex-direction:column;
      ">
        <div id="pixel-chat-messages" style="
          flex:1; overflow-y:auto; margin-bottom:10px; font-family:'Silkscreen',monospace;
          font-size:0.7rem; color:var(--text-primary,#f0e6d2);
        "></div>
        <div style="display:flex; gap:5px;">
          <input type="text" id="pixel-chat-input" placeholder="Escribe tu pregunta..." style="
            flex:1; padding:8px; font-family:'Silkscreen',monospace; font-size:0.7rem;
            background:var(--bg-primary,#2b1e10); border:2px solid var(--accent-orange,#ff8c00);
            color:var(--text-primary,#f0e6d2);
          ">
          <button id="pixel-chat-send" style="
            background:var(--accent-red,#cc0000); border:2px solid #fff; color:#fff;
            font-family:'Press Start 2P',monospace; font-size:0.6rem; padding:8px; cursor:pointer;
          ">ENVIAR</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const toggleBtn = document.getElementById('pixel-chat-toggle');
  const chatWindow = document.getElementById('pixel-chat-window');
  const messagesDiv = document.getElementById('pixel-chat-messages');
  const input = document.getElementById('pixel-chat-input');
  const sendBtn = document.getElementById('pixel-chat-send');

  toggleBtn.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    if (chatWindow.style.display === 'flex') input.focus();
  });

  function addMessage(msg, color = '#f0e6d2') {
    const p = document.createElement('p');
    p.style.color = color;
    p.style.marginBottom = '10px';
    p.textContent = msg;
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage('🧑 ' + text, '#ffcc00');
    input.value = '';
    callOpenRouter(text);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // --- LLAMADA A OPENROUTER ---
  async function callOpenRouter(userMessage) {
    if (typeof OPENROUTER_API_KEY === 'undefined') {
      addMessage('🤖 Error: No se encontró la API Key de OpenRouter.', '#ff4444');
      return;
    }

    const prompt = `Eres el asistente virtual del "Pixel Vocacional", una aplicación web de orientación vocacional para estudiantes universitarios. Solo debes responder preguntas relacionadas con las siguientes carreras: Informática, Telecomunicaciones, Mecánica, Electricidad, Contaduría. Puedes dar detalles sobre perfiles, habilidades, campo laboral, materias, etc. También puedes saludar y tener una conversación amigable, pero siempre vuelve a tu rol principal. Responde en español con un tono cálido y motivador. Si te preguntan algo fuera de estas áreas, redirige amablemente la conversación hacia la orientación vocacional.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      console.log('Respuesta OpenRouter:', data);

      if (data.error) {
        addMessage('🤖 Error: ' + data.error.message, '#ff4444');
        return;
      }

      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        addMessage('🤖 ' + reply, '#00ff88');
      } else {
        addMessage('🤖 No obtuve respuesta. Mira la consola (F12).', '#ff4444');
      }
    } catch (error) {
      console.error('Error de red:', error);
      addMessage('🤖 Error de conexión. ¿Tienes internet?', '#ff4444');
    }
  }
})();