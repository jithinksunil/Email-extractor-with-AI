import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();
export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL,
});

export const gmail = google.gmail({
  version: 'v1',
  auth: oauth2Client,
});
