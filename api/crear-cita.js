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
    
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0) return res.status(400).json({ error: 'El local está cerrado los domingos' });
    
    const h = startDate.getHours();
    const m = startDate.getMinutes();
    const totalMins = h * 60 + m;
    
    // Validar horario comercial
    let isBusinessHours = false;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if ((totalMins >= 11 * 60 && totalMins < 14 * 60) || (totalMins >= 16 * 60 && totalMins < 21 * 60)) {
        isBusinessHours = true;
      }
    } else if (dayOfWeek === 6) {
      if (totalMins >= 10 * 60 && totalMins < 14 * 60) {
        isBusinessHours = true;
      }
    }
    
    if (!isBusinessHours) {
      return res.status(400).json({ error: 'Fuera de horario. Abre: L-V (11:00-14:00 / 16:00-21:00), Sáb (10:00-14:00)' });
    }


    let hasOverlap = false;
    for (let ev of events) {
      const evStart = new Date(ev.start.dateTime || ev.start.date);
      const evEnd = new Date(ev.end.dateTime || ev.end.date);
      
      // Revisar si ya tiene cita ese día (misma persona)
      if (
        (ev.description && ev.description.includes(phone)) || 
        (ev.extendedProperties?.private?.phone === phone)
      ) {
        return res.status(400).json({ error: 'Ya tienes una cita reservada para este día' });
      }

      // Solapamiento
      if (startDate < evEnd && endDate > evStart) {
        hasOverlap = true;
      }
    }

    if (hasOverlap) {
      return res.status(400).json({ error: 'Ese hueco ya está ocupado, por favor prueba a elegir otra hora.' });
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
