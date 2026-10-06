import 'dotenv/config';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ error: 'El teléfono y el PIN son obligatorios' });
  }

  try {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Buscar citas desde ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const response = await calendar.events.list({
      calendarId,
      timeMin: yesterday.toISOString(),
      privateExtendedProperty: "phone=" + phone,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    let events = response.data.items || [];
    
    if (events.length === 0) {
      // Fallback a q: phone por si acaso
      const fallback = await calendar.events.list({
        calendarId,
        timeMin: yesterday.toISOString(),
        q: phone,
        singleEvents: true,
        orderBy: 'startTime'
      });
      events = (fallback.data.items || []).filter(ev => 
        (ev.extendedProperties?.private?.phone === phone) || 
        (ev.description && ev.description.includes(phone))
      );
    }

    
    const now = new Date();
    // Filtrar por PIN y mapear
    const citas = events.filter(ev => ev.extendedProperties?.private?.pin === pin).map(ev => {

      const evStart = new Date(ev.start.dateTime || ev.start.date);
      const isExpired = evStart < now;
      
      return {
        id: ev.id,
        summary: ev.summary,
        date: evStart.toLocaleDateString('es-ES'),
        time: evStart.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        status: isExpired ? 'Expirada' : 'Pendiente'
      };
    });

    res.status(200).json({ success: true, citas });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener citas' });
  }
}
