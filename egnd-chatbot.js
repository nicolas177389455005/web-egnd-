(function() {
  const style = document.createElement('style');
  style.textContent = `
    #egnd-chat-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%; background: #0A2342;
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    }
    #egnd-chat-btn svg { width: 26px; height: 26px; fill: white; }
    #egnd-chat-badge {
      position: absolute; top: -4px; right: -4px; background: #F5C842;
      width: 14px; height: 14px; border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
    #egnd-chat-box {
      position: fixed; bottom: 96px; right: 28px; z-index: 9998;
      width: 340px; height: 480px; background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: none;
      flex-direction: column; font-family: 'DM Sans', sans-serif; overflow: hidden;
    }
    #egnd-chat-header {
      background: #0A2342; color: white; padding: 16px 20px;
      font-weight: 700; font-size: 15px; display: flex;
      justify-content: space-between; align-items: center;
    }
    #egnd-chat-header span { font-size: 12px; opacity: 0.7; font-weight: 400; }
    #egnd-chat-close { cursor: pointer; font-size: 20px; opacity: 0.7; }
    #egnd-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 10px;
    }
    .egnd-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .egnd-msg.bot { background: #f0f4f8; color: #0A2342; align-self: flex-start; border-bottom-left-radius: 4px; }
    .egnd-msg.user { background: #0A2342; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    #egnd-chat-quicks { padding: 0 12px 8px; display: flex; gap: 6px; flex-wrap: wrap; }
    .egnd-quick { background: #f0f4f8; border: 1px solid #dce4ef; color: #0A2342;
      padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; }
    .egnd-quick:hover { background: #0A2342; color: white; }
    #egnd-chat-input-row { display: flex; padding: 10px 12px; border-top: 1px solid #eee; gap: 8px; }
    #egnd-chat-input { flex: 1; border: 1px solid #dce4ef; border-radius: 20px;
      padding: 8px 14px; font-size: 13px; outline: none; }
    #egnd-chat-send { background: #0A2342; color: white; border: none;
      border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 18px; }
    .egnd-cal-btn { display: inline-block; margin-top: 8px; background: #F5C842;
      color: #0A2342; padding: 7px 14px; border-radius: 20px; font-size: 12px;
      font-weight: 700; text-decoration: none; }
    .egnd-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px;
      background: #f0f4f8; border-radius: 12px; align-self: flex-start; }
    .egnd-typing span { width: 7px; height: 7px; background: #0A2342; border-radius: 50%;
      animation: bounce 1.2s infinite; }
    .egnd-typing span:nth-child(2) { animation-delay: 0.2s; }
    .egnd-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'egnd-chat-btn';
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div id="egnd-chat-badge"></div>`;
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'egnd-chat-box';
  box.innerHTML = `
    <div id="egnd-chat-header">
      <div>egnd <span>· Asistente financiero</span></div>
      <div id="egnd-chat-close">×</div>
    </div>
    <div id="egnd-chat-messages"></div>
    <div id="egnd-chat-quicks"></div>
    <div id="egnd-chat-input-row">
      <input id="egnd-chat-input" placeholder="Escribí tu consulta..." />
      <button id="egnd-chat-send">→</button>
    </div>
  `;
  document.body.appendChild(box);

  const msgs = document.getElementById('egnd-chat-messages');
  const input = document.getElementById('egnd-chat-input');
  const send = document.getElementById('egnd-chat-send');
  const quicks = document.getElementById('egnd-chat-quicks');
  let history = [];
  let typing = false;

  function addMessage(role, text, showCal) {
    const d = document.createElement('div');
    d.className = 'egnd-msg ' + role;
    d.textContent = text;
    if (showCal) {
      const a = document.createElement('a');
      a.href = 'https://calendly.com/egnd';
      a.target = '_blank';
      a.className = 'egnd-cal-btn';
      a.textContent = 'Agendar llamada →';
      d.appendChild(document.createElement('br'));
      d.appendChild(a);
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'egnd-typing'; d.id = 'egnd-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('egnd-typing');
    if (t) t.remove();
  }

  function setQuicks(options) {
    quicks.innerHTML = '';
    options.forEach(o => {
      const b = document.createElement('button');
      b.className = 'egnd-quick'; b.textContent = o;
      b.onclick = () => sendMessage(o);
      quicks.appendChild(b);
    });
  }

  async function sendMessage(text) {
    if (!text.trim() || typing) return;
    input.value = '';
    quicks.innerHTML = '';
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    typing = true;
    showTyping();
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      hideTyping();
      const data = await res.json();
      const reply = data.reply || 'Hubo un error. Intentá de nuevo.';
      history.push({ role: 'assistant', content: reply });
      const showCal = /agend|llamada|calendly|hablar|reuni/i.test(reply);
      addMessage('bot', reply, showCal);
      const lc = reply.toLowerCase();
      if (/startup|pyme/i.test(reply) && history.length < 4) {
        setQuicks(['Startup', 'Pyme']);
      } else if (/precio|costo|valor|usd/i.test(lc)) {
        setQuicks(['Me interesa', 'Quiero agendar una llamada', 'Contame más']);
      } else if (history.length > 3) {
        setQuicks(['Quiero agendar una llamada', 'Tengo otra pregunta']);
      }
    } catch(e) {
      hideTyping();
      addMessage('bot', 'Hubo un problema de conexión. Intentá de nuevo.');
    }
    typing = false;
  }

  btn.addEventListener('click', () => {
    const open = box.style.display === 'flex';
    box.style.display = open ? 'none' : 'flex';
    if (!open && history.length === 0) {
      setTimeout(() => {
        addMessage('bot', '¡Hola! Soy el asistente de egnd. ¿Sos una startup o una pyme?');
        setQuicks(['Startup', 'Pyme']);
      }, 300);
    }
  });

  document.getElementById('egnd-chat-close').addEventListener('click', () => {
    box.style.display = 'none';
  });

  send.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });
})();
