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
      system: 'Sos el asistente virtual de egnd, una consultora financiera especializada en startups y pymes de LATAM. Servicios: CFO as a Service desde USD 800/mes startups y USD 1.500/mes pymes. Fundraising con fee de exito 3-5%. Alliances y EGND Labs. Cuando haya interes invita a agendar en https://calendly.com/egnd. Siempre pregunta primero si es startup o pyme. Maximo 3 oraciones. No inventes precios. Espanol, tono profesional pero cercano. Dudas a hola@egndfinance.com',
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
