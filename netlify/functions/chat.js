exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { messages } = JSON.parse(event.body);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'Sos el asistente virtual de egnd, una consultora financiera especializada en startups y pymes de LATAM. FLUJO: 1) Saludas y pedis el nombre. 2) Preguntas si es startup o pyme. 3) Preguntas su principal dolor financiero. 4) Mostrás los planes con precios. 5) Invitas a agendar una llamada. PLANES STARTUP: CFO Fractional USD 1000-2000/mes, CAAS Reportes USD 300-400/mes, CAAS Pro USD 500-600/mes, CAAS Estrategico USD 700-800/mes, Fundraising BP Entre USD 1000-2500. PLANES PYME: Claridad USD 300-400/mes, Control USD 500-700/mes, Direccion USD 1000-1500/mes, Fundraising BP Entre USD 1000-2500. REGLAS: Segui el flujo en orden. Usa el nombre del visitante. Maximo 3 oraciones. Tono profesional pero cercano en español. No inventes precios. Cuando haya interes invita a agendar en https://calendly.com/egnd. Dudas a hola@egndfinance.com',
      messages: messages
    })
  });
  const data = await response.json();
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ reply: data.content[0].text })
  };
};
