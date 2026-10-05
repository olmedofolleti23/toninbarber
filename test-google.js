import 'dotenv/config';
import { google } from 'googleapis';

async function test() {
  try {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar']
    });

    await auth.authorize();
    console.log("Authorized!");

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    console.log("Calendar ID:", calendarId);
    console.log("Client Email:", credentials.client_email);

    const dayStart = new Date().toISOString();
    const dayEnd = new Date(Date.now() + 86400000).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin: dayStart,
      timeMax: dayEnd,
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log("Success! Events:", response.data.items.length);
  } catch (error) {
    console.error("GOOGLE API ERROR:");
    console.error(error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

test();
