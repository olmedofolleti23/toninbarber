import 'dotenv/config';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, date, time, serviceName, duracion } = req.body;

  if (!name || !phone || !date || !time || !serviceName || !duracion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
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

    // Calcular horas
    const startDateTimeStr = `${date}T${time}:00`;
    const startDate = new Date(startDateTimeStr);
    const endDate = new Date(startDate.getTime() + duracion * 60000);

    const startDateTimeIso = startDate.toISOString();
    const endDateTimeIso = endDate.toISOString();

    // 1. Buscar colisiones
    // Traemos los eventos del día
    const dayStart = new Date(`${date}T00:00:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59`).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin: dayStart,
      timeMax: dayEnd,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    
    // Verificamos si hay colisión de horario o si el mismo teléfono ya tiene cita
    for (let ev of events) {
      const evStart = new Date(ev.start.dateTime || ev.start.date);
      const evEnd = new Date(ev.end.dateTime || ev.end.date);

      // Revisar si ya tiene cita ese día
      if (
        (ev.description && ev.description.includes(phone)) || 
        (ev.extendedProperties?.private?.phone === phone)
      ) {
        return res.status(400).json({ error: 'Ya tienes una cita reservada para este día' });
      }

      // Revisar solapamiento (si el inicio propuesto es menor al fin del evento Y el fin propuesto es mayor al inicio del evento)
      if (startDate < evEnd && endDate > evStart) {
        return res.status(400).json({ error: 'Ese horario ya no está disponible, por favor elige otro' });
      }
    }

    // 2. Generar Token
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Crear evento
    const event = {
      summary: `Cita: ${name} - ${serviceName}`,
      description: `Teléfono: ${phone}`,
      start: {
        dateTime: startDateTimeIso,
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: endDateTimeIso,
        timeZone: 'Europe/Madrid',
      },
      extendedProperties: {
        private: {
          token: token,
          phone: phone
        }
      }
    };
    
    await calendar.events.insert({ calendarId, requestBody: event });

    // 4. Devolver respuesta
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear la cita' });
  }
}
