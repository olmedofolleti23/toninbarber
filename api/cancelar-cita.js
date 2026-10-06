import 'dotenv/config';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, phone, pin } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'El ID de la cita es obligatorio' });
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

    // Verificar que el evento pertenece al telefono si se proporciona
    if (phone) {
      try {
        const ev = await calendar.events.get({ calendarId, eventId });
        const isOwner = ev.data.extendedProperties?.private?.phone === phone && ev.data.extendedProperties?.private?.pin === pin;
        if (!isOwner) {
          return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });
        }
      } catch (err) {
        // If it's already deleted in Google Calendar, just tell the frontend it's a success so it removes it from UI
        return res.status(200).json({ success: true, message: 'La cita ya no existe en el calendario.' });
      }
    }

    
    try {
      await calendar.events.delete({ calendarId, eventId });
    } catch (deleteError) {
      // If error is 410 (Gone) or 404 (Not Found), it means it's already deleted. We can safely ignore it.
      if (deleteError.code === 410 || deleteError.code === 404) {
        console.log("El evento ya estaba eliminado de Google Calendar.");
      } else {
        throw deleteError;
      }
    }


    res.status(200).json({ success: true, message: 'Cita cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar la cita:', error);
    res.status(500).json({ error: 'Error interno del servidor al cancelar la cita: ' + error.message });
  }
}
