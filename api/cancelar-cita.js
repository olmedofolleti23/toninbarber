import 'dotenv/config';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'El token es obligatorio' });
  }

  try {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // 1. Buscar evento por token
    const response = await calendar.events.list({
      calendarId,
      privateExtendedProperty: `token=${token}`,
    });
    
    const events = response.data.items || [];
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'No se ha encontrado ninguna cita con este token' });
    }

    // 2. Borrar evento
    const eventId = events[0].id;
    await calendar.events.delete({ calendarId, eventId });

    res.status(200).json({ success: true, message: 'Cita cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar la cita:', error);
    res.status(500).json({ error: 'Error interno del servidor al cancelar la cita' });
  }
}
